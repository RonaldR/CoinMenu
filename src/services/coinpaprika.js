// CoinPaprika's free API: no key needed, 20,000 requests per month per IP address. Historical
// prices are USD only, hourly data reaches back 24 hours and daily data one year.

const API_URL = 'https://api.coinpaprika.com/v1';
const LOGO_URL = 'https://static.coinpaprika.com/coin';
const TIMEOUT = 20_000;
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

// BTC prices are derived from the USD quotes, which keeps the 2,000-coin ticker payload small.
export const QUOTES = ['USD', 'EUR'];

export const HISTORY_RANGES = ['24h', '7d', '30d', '1y'];

async function request(path, { signal, timeout = TIMEOUT } = {}) {
    const signals = [AbortSignal.timeout(timeout), signal].filter(Boolean);
    let response;
    try {
        response = await fetch(`${API_URL}${path}`, { signal: AbortSignal.any(signals) });
    } catch (error) {
        if (error.name === 'TimeoutError') throw new Error('The price service took too long to respond.', { cause: error });
        if (error.name === 'AbortError') throw error;
        throw new Error('Could not reach the price service. Check your connection.', { cause: error });
    }

    if (response.status === 429) throw new Error('The price service is busy. Trying again shortly.');
    if (!response.ok) throw new Error(`The price service returned an error (${response.status}).`);
    const data = await response.json();
    if (data?.error) throw new Error(data.error);
    return data;
}

const byRank = (a, b) => (a.rank || Number.MAX_SAFE_INTEGER) - (b.rank || Number.MAX_SAFE_INTEGER);

export async function getTickers(options) {
    const tickers = await request(`/tickers?quotes=${QUOTES.join(',')}`, options);
    if (!Array.isArray(tickers)) throw new Error('The price service returned unexpected data.');
    return tickers.sort(byRank);
}

export function getTicker(id, options) {
    return request(`/tickers/${encodeURIComponent(id)}?quotes=${QUOTES.join(',')}`, options);
}

export function getGlobalMarket(options) {
    return request('/global', options);
}

export async function searchCoins(query, options) {
    const params = new URLSearchParams({ q: query, c: 'currencies', limit: '12' });
    const result = await request(`/search/?${params}`, options);
    return (result.currencies ?? []).filter(coin => coin.is_active).sort(byRank);
}

export async function findCoinBySymbol(symbol, options) {
    const params = new URLSearchParams({ q: symbol, c: 'currencies', modifier: 'symbol_search', limit: '50' });
    const result = await request(`/search/?${params}`, options);
    const wanted = symbol.toUpperCase();
    return (result.currencies ?? [])
        .filter(coin => coin.is_active && coin.symbol.toUpperCase() === wanted)
        .sort(byRank)[0] ?? null;
}

function historyQuery(range, now) {
    const day = date => new Date(date).toISOString().slice(0, 10);
    switch (range) {
        // Stay a few minutes inside the free plan's 24-hour window for hourly data.
        case '24h': return { start: new Date(now - DAY + 5 * 60 * 1000).toISOString(), interval: '1h' };
        case '7d': return { start: day(now - 7 * DAY), interval: '1d' };
        case '30d': return { start: day(now - 30 * DAY), interval: '1d' };
        case '1y': return { start: day(now - 364 * DAY), interval: '1d' };
        default: throw new Error(`Unknown history range: ${range}`);
    }
}

/** USD price history as `[timestamp, price]` pairs, oldest first. */
export async function getPriceHistory(id, range, options) {
    const params = new URLSearchParams({ ...historyQuery(range, Date.now()), limit: '400' });
    const points = await request(`/tickers/${encodeURIComponent(id)}/historical?${params}`, options);
    if (!Array.isArray(points)) throw new Error('The price service returned unexpected data.');
    return points
        .filter(point => Number.isFinite(point.price))
        .map(point => [Date.parse(point.timestamp), point.price]);
}

export function logoUrl(id) {
    return `${LOGO_URL}/${encodeURIComponent(id)}/logo.png`;
}

export function coinPageUrl(id) {
    return id ? `https://coinpaprika.com/coin/${encodeURIComponent(id)}/` : 'https://coinpaprika.com';
}
