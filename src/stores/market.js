import { computed, reactive, shallowRef } from 'vue';

import { onVisibilityChange, startsVisible } from '@/lib/platform';
import { exchangeRates } from '@/lib/portfolio';
import { readJson, writeJson } from '@/lib/storage';
import * as api from '@/services/coinpaprika';
import { alerts } from './alerts';
import { settings } from './settings';
import { coins, resolveLegacyCoins, seedWatchlist } from './watchlist';

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

// Budget for the free API (20,000 calls a month): one ticker call every 5 minutes while the
// window is open, every 10 minutes in the background, and only when something needs it then.
const REFRESH_INTERVAL = { visible: 5 * MINUTE, background: 10 * MINUTE };
const REFRESH_ON_SHOW_AFTER = 2 * MINUTE;
const GLOBAL_TTL = 30 * MINUTE;
const EXTRA_TICKER_TTL = 15 * MINUTE;
const MAX_RETRY_DELAY = 5 * MINUTE;
const HISTORY_TTL = { '24h': 2 * HOUR, '7d': 6 * HOUR, '30d': 12 * HOUR, '1y': 24 * HOUR };
const HISTORY_RETRY = 5 * MINUTE;
const HISTORY_KEY = 'coinmenu-history';
const PERSISTED_RANGES = ['24h', '7d'];
const MAX_PARALLEL_HISTORY = 3;
const BTC_ID = 'btc-bitcoin';

export const market = reactive({
    loading: false,
    error: '',
    updatedAt: 0,
    global: null,
    visible: startsVisible,
});

const tickers = shallowRef(new Map());
const tickersBySymbol = shallowRef(new Map());
const extraTickers = new Map();
let lastGlobalAt = 0;
let failures = 0;

export const rates = computed(() => exchangeRates(tickers.value.get(BTC_ID)));

export function tickerById(id) {
    return tickers.value.get(id) ?? null;
}

/** The live ticker for a watchlist coin. Legacy coins without an id are matched by symbol. */
export function tickerFor(coin) {
    if (!coin) return null;
    return (coin.id ? tickers.value.get(coin.id) : tickersBySymbol.value.get(coin.symbol)) ?? null;
}

export function btcPriceOf(ticker) {
    const price = ticker?.quotes?.USD?.price;
    const btc = tickers.value.get(BTC_ID)?.quotes?.USD?.price;
    return Number.isFinite(price) && btc ? price / btc : null;
}

// Watchlist, alert and menu bar coins outside the 2,000 the ticker list covers are fetched one
// by one, at a slower pace.
async function addExtraTickers(map) {
    const ids = new Set([
        ...coins.value.map(coin => coin.id),
        ...alerts.value.map(alert => alert.coinId),
        settings.trayMode === 'coin' ? settings.trayCoinId : null,
    ]);
    const missing = [...ids].filter(id => id && !map.has(id));
    await Promise.all(missing.map(async (id) => {
        const cached = extraTickers.get(id);
        if (!cached || Date.now() - cached.fetchedAt > EXTRA_TICKER_TTL) {
            try {
                extraTickers.set(id, { ticker: await api.getTicker(id), fetchedAt: Date.now() });
            } catch {
                // Keep the last known quote and wait a full interval before trying again, so a
                // delisted coin does not cost a request on every refresh.
                extraTickers.set(id, { ticker: cached?.ticker ?? null, fetchedAt: Date.now() });
            }
        }
    }));

    // Also keeps coins opened from elsewhere (see ensureTicker) while their quote is fresh.
    for (const [id, { ticker, fetchedAt }] of extraTickers) {
        const wanted = ids.has(id) || Date.now() - fetchedAt <= EXTRA_TICKER_TTL;
        if (ticker && wanted && !map.has(id)) map.set(id, ticker);
    }
}

async function load() {
    market.loading = true;
    try {
        const list = await api.getTickers();
        await resolveLegacyCoins(list, symbol => api.findCoinBySymbol(symbol));
        seedWatchlist(list);

        const map = new Map(list.map(ticker => [ticker.id, ticker]));
        await addExtraTickers(map);

        const bySymbol = new Map();
        for (const ticker of list) {
            if (!bySymbol.has(ticker.symbol.toUpperCase())) bySymbol.set(ticker.symbol.toUpperCase(), ticker);
        }

        tickers.value = map;
        tickersBySymbol.value = bySymbol;
        market.updatedAt = Date.now();
        market.error = '';
        failures = 0;
    } catch (error) {
        failures += 1;
        market.error = error.message || 'Could not load prices.';
    } finally {
        market.loading = false;
    }
    refreshGlobalIfStale();
}

async function refreshGlobalIfStale() {
    if (!market.visible || Date.now() - lastGlobalAt < GLOBAL_TTL) return;
    lastGlobalAt = Date.now();
    try {
        market.global = await api.getGlobalMarket();
    } catch {
        lastGlobalAt = 0;
    }
}

let inflight = null;

function refresh() {
    inflight ??= load().finally(() => {
        inflight = null;
    });
    return inflight;
}

/**
 * Instant search through the loaded tickers, so most searches need no API call. Exact symbol
 * matches come first, then prefixes, then names containing the query; ties go to market cap.
 */
export function searchTickers(query, limit = 12) {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];

    const matches = [];
    for (const ticker of tickers.value.values()) {
        const symbol = ticker.symbol.toLowerCase();
        const name = ticker.name.toLowerCase();
        const score = symbol === needle ? 0
            : name === needle ? 1
                : symbol.startsWith(needle) ? 2
                    : name.startsWith(needle) ? 3
                        : name.includes(needle) ? 4 : -1;
        if (score >= 0) matches.push({ score, ticker });
    }

    return matches
        .sort((a, b) => a.score - b.score || (a.ticker.rank || Infinity) - (b.ticker.rank || Infinity))
        .slice(0, limit)
        .map(({ ticker: { id, name, symbol, rank } }) => ({ id, name, symbol, rank }));
}

/** Fetches one coin that is not in the ticker list yet, e.g. right after adding it. */
export async function ensureTicker(id) {
    if (!id || !market.updatedAt || tickers.value.has(id)) return;
    try {
        const ticker = await api.getTicker(id);
        extraTickers.set(id, { ticker, fetchedAt: Date.now() });
        tickers.value = new Map(tickers.value).set(id, ticker);
    } catch {
        // The next regular refresh picks the coin up.
    }
}

// --- Auto refresh -------------------------------------------------------------------------

let timer = null;
let needsBackgroundUpdates = () => false;

function nextRefreshAt() {
    if (failures) return Date.now() + Math.min(MAX_RETRY_DELAY, 15_000 * 2 ** (failures - 1));
    return market.updatedAt + (market.visible ? REFRESH_INTERVAL.visible : REFRESH_INTERVAL.background);
}

function schedule() {
    clearTimeout(timer);
    // While hidden and nothing (menu bar title, alerts) needs fresh prices, wait for the window.
    if (!market.visible && !needsBackgroundUpdates()) return;
    timer = setTimeout(refreshNow, Math.max(0, nextRefreshAt() - Date.now()));
}

export async function refreshNow() {
    await refresh();
    schedule();
}

/** `keepAlive()` tells whether prices must stay fresh while the window is hidden. */
export function startAutoRefresh({ keepAlive }) {
    needsBackgroundUpdates = keepAlive;
    onVisibilityChange((visible) => {
        if (visible === market.visible) return;
        market.visible = visible;
        if (!visible) {
            schedule();
            return;
        }
        refreshGlobalIfStale();
        if (Date.now() - market.updatedAt > REFRESH_ON_SHOW_AFTER) refreshNow();
        else schedule();
    });
    refreshNow();
}

export function rescheduleAutoRefresh() {
    if (!inflight) schedule();
}

// --- Price history ------------------------------------------------------------------------

function restoreHistory() {
    const restored = {};
    for (const [key, entry] of Object.entries(readJson(HISTORY_KEY, {}))) {
        const range = key.split(':').pop();
        if (Array.isArray(entry?.points) && Date.now() - entry.fetchedAt < HISTORY_TTL[range] * 4) {
            restored[key] = { points: entry.points, fetchedAt: entry.fetchedAt, loading: false, error: '' };
        }
    }
    return restored;
}

const history = reactive(restoreHistory());

function persistHistory() {
    const saved = {};
    for (const [key, { points, fetchedAt }] of Object.entries(history)) {
        if (points.length && PERSISTED_RANGES.includes(key.split(':').pop())) saved[key] = { points, fetchedAt };
    }
    writeJson(HISTORY_KEY, saved);
}

const queue = [];
let running = 0;

function enqueue(task) {
    return new Promise((resolve, reject) => {
        queue.push({ task, resolve, reject });
        drainQueue();
    });
}

function drainQueue() {
    while (running < MAX_PARALLEL_HISTORY && queue.length) {
        const { task, resolve, reject } = queue.shift();
        running += 1;
        task().then(resolve, reject).finally(() => {
            running -= 1;
            drainQueue();
        });
    }
}

/** Cached USD history as `[timestamp, price]` pairs, or null when nothing is loaded yet. */
export function historyFor(id, range) {
    return history[`${id}:${range}`] ?? null;
}

/** Loads history unless a fresh copy is cached. Skipped while the window is hidden. */
export function ensureHistory(id, range) {
    if (!id || !market.visible || !HISTORY_TTL[range]) return;
    const key = `${id}:${range}`;
    history[key] ??= { points: [], fetchedAt: 0, loading: false, error: '' };
    const entry = history[key];
    if (entry.loading || Date.now() - entry.fetchedAt < HISTORY_TTL[range]) return;

    entry.loading = true;
    enqueue(() => api.getPriceHistory(id, range))
        .then((points) => {
            Object.assign(entry, { points, fetchedAt: Date.now(), error: '' });
            persistHistory();
        })
        .catch((error) => {
            // Back off for a few minutes instead of retrying on every render.
            Object.assign(entry, { error: error.message, fetchedAt: Date.now() - HISTORY_TTL[range] + HISTORY_RETRY });
        })
        .finally(() => {
            entry.loading = false;
        });
}

export function clearHistory() {
    for (const key of Object.keys(history)) delete history[key];
    writeJson(HISTORY_KEY, {});
}
