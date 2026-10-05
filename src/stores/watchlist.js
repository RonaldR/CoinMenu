import { ref, watch } from 'vue';

import { hasStoredValue, readJson, writeJson } from '@/lib/storage';
import { CURRENCIES } from './settings';

// The key dates from the first CoinMenu releases; keeping it carries existing watchlists over.
const STORAGE_KEY = 'personalCoinList';
const DEFAULT_SIZE = 10;

const toAmount = (value) => {
    if (value === null || value === undefined || value === '') return null;
    const amount = Number(value);
    return Number.isFinite(amount) && amount >= 0 ? amount : null;
};

/**
 * Accepts every shape CoinMenu has stored over the years: plain symbols ("BTC"), the
 * `{ symbol, holding }` objects of the Vue 2 releases, and current entries with ids.
 */
export function normalizeCoin(entry) {
    if (typeof entry === 'string') entry = { symbol: entry };
    if (!entry || typeof entry !== 'object' || typeof entry.symbol !== 'string') return null;

    const symbol = entry.symbol.trim().toUpperCase();
    if (!symbol) return null;
    const costBasis = toAmount(entry.costBasis);
    return {
        id: typeof entry.id === 'string' && entry.id ? entry.id : null,
        symbol,
        name: typeof entry.name === 'string' && entry.name.trim() ? entry.name.trim() : symbol,
        holding: toAmount(entry.holding),
        costBasis,
        costCurrency: costBasis !== null && CURRENCIES.includes(entry.costCurrency) ? entry.costCurrency : null,
    };
}

/** Entries without an id are legacy symbol-only coins waiting to be matched to a CoinPaprika id. */
export const coinKey = coin => coin.id ?? `symbol:${coin.symbol}`;

export function normalizeCoins(list) {
    if (!Array.isArray(list)) return [];
    const seen = new Set();
    return list.map(normalizeCoin).filter((coin) => {
        if (!coin || seen.has(coinKey(coin))) return false;
        seen.add(coinKey(coin));
        return true;
    });
}

export const coins = ref(normalizeCoins(readJson(STORAGE_KEY, [])));

// New installs start with the largest coins. Once anything is saved, an empty list stays empty.
let pendingSeed = !hasStoredValue(STORAGE_KEY);

watch(coins, value => writeJson(STORAGE_KEY, value), { deep: true });

export function findCoin(id) {
    return coins.value.find(coin => coin.id === id) ?? null;
}

export function addCoin({ id, symbol, name }) {
    if (!id || findCoin(id)) return false;
    coins.value.push(normalizeCoin({ id, symbol, name }));
    return true;
}

/** Removes a coin and returns where it was, so the removal can be undone with `insertCoin`. */
export function removeCoin(coin) {
    const key = coinKey(coin);
    const index = coins.value.findIndex(item => coinKey(item) === key);
    if (index > -1) coins.value = coins.value.filter((_item, position) => position !== index);
    return index;
}

export function insertCoin(coin, index) {
    const entry = normalizeCoin(coin);
    if (!entry || coins.value.some(item => coinKey(item) === coinKey(entry))) return;
    const next = [...coins.value];
    next.splice(Math.min(Math.max(index, 0), next.length), 0, entry);
    coins.value = next;
}

export function moveCoin(from, to) {
    if (from === to || !coins.value[from] || to < 0 || to >= coins.value.length) return;
    const next = [...coins.value];
    next.splice(to, 0, ...next.splice(from, 1));
    coins.value = next;
}

export function setHolding(coin, amount) {
    coin.holding = toAmount(amount);
}

export function setCostBasis(coin, amount, currency) {
    coin.costBasis = toAmount(amount);
    coin.costCurrency = coin.costBasis === null ? null : currency;
}

export function replaceWatchlist(list) {
    coins.value = normalizeCoins(list);
    pendingSeed = false;
}

export function resetWatchlist() {
    coins.value = [];
    pendingSeed = true;
}

/** Fills a brand-new watchlist with the top coins by market cap. `tickers` must be rank-sorted. */
export function seedWatchlist(tickers) {
    if (!pendingSeed) return;
    pendingSeed = false;
    if (!coins.value.length) coins.value = normalizeCoins(tickers.slice(0, DEFAULT_SIZE));
}

const failedLookups = new Set();

/**
 * Matches legacy symbol-only coins to CoinPaprika ids: first against the ranked ticker list,
 * then through `lookup(symbol)` for coins outside it. Symbols that cannot be matched are not
 * looked up again this session, so they do not cost an API call on every refresh.
 */
export async function resolveLegacyCoins(tickers, lookup) {
    const legacy = coins.value.filter(coin => !coin.id && !failedLookups.has(coin.symbol));
    if (!legacy.length) return;

    const bySymbol = new Map();
    for (const ticker of tickers) {
        const symbol = ticker.symbol.toUpperCase();
        if (!bySymbol.has(symbol)) bySymbol.set(symbol, ticker);
    }

    const matches = await Promise.all(legacy.map(async (coin) => {
        const match = bySymbol.get(coin.symbol) ?? await lookup(coin.symbol).catch(() => null);
        if (!match) failedLookups.add(coin.symbol);
        return [coin, match];
    }));

    for (const [coin, match] of matches) {
        if (!match) continue;
        const existing = findCoin(match.id);
        if (existing) {
            // The coin was added again since; keep the amounts the old entry carried.
            if (existing.holding === null) existing.holding = coin.holding;
            if (existing.costBasis === null) Object.assign(existing, { costBasis: coin.costBasis, costCurrency: coin.costCurrency });
            removeCoin(coin);
        } else {
            Object.assign(coin, { id: match.id, name: match.name, symbol: match.symbol.toUpperCase() });
        }
    }
}
