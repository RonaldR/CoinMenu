// Pure portfolio maths. An "entry" pairs a watchlist coin with its live ticker (which may be
// missing while prices load or when the price service does not know the coin).

const isNumber = value => typeof value === 'number' && Number.isFinite(value);

export function quoteOf(ticker, currency) {
    return ticker?.quotes?.[currency] ?? null;
}

export function priceOf(ticker, currency) {
    const price = quoteOf(ticker, currency)?.price;
    return isNumber(price) ? price : null;
}

export function changeOf(ticker, currency, period) {
    const change = quoteOf(ticker, currency)?.[`percent_change_${period}`];
    return isNumber(change) ? change : null;
}

/** Units of each quoted currency per US dollar, derived from a ticker quoted in all of them. */
export function exchangeRates(referenceTicker) {
    const quotes = referenceTicker?.quotes ?? {};
    const usd = quotes.USD?.price;
    const rates = { USD: 1 };
    if (!isNumber(usd) || usd <= 0) return rates;
    for (const [currency, quote] of Object.entries(quotes)) {
        if (isNumber(quote?.price) && quote.price > 0) rates[currency] = quote.price / usd;
    }
    return rates;
}

export function convert(value, from, to, rates) {
    if (!isNumber(value)) return null;
    if (from === to) return value;
    const fromRate = rates[from];
    const toRate = rates[to];
    return isNumber(fromRate) && isNumber(toRate) ? (value / fromRate) * toRate : null;
}

export function holdingValue(coin, ticker, currency) {
    const price = priceOf(ticker, currency);
    return isNumber(coin.holding) && price !== null ? coin.holding * price : null;
}

/** What the holding cost, converted to the display currency. */
export function costOf(coin, currency, rates) {
    if (!isNumber(coin.holding) || !isNumber(coin.costBasis)) return null;
    const unitCost = convert(coin.costBasis, coin.costCurrency || currency, currency, rates);
    return unitCost === null ? null : unitCost * coin.holding;
}

export function profitOf(coin, ticker, currency, rates) {
    const value = holdingValue(coin, ticker, currency);
    const cost = costOf(coin, currency, rates);
    if (value === null || cost === null) return null;
    return { value, cost, profit: value - cost, percent: cost > 0 ? ((value - cost) / cost) * 100 : null };
}

export function summarize(entries, { currency, period, rates }) {
    let value = 0;
    let previousValue = 0;
    let cost = 0;
    let costedValue = 0;
    let holdings = 0;

    for (const { coin, ticker } of entries) {
        const current = holdingValue(coin, ticker, currency);
        if (current === null) continue;
        holdings += 1;
        value += current;

        const change = changeOf(ticker, currency, period);
        previousValue += change !== null && change > -100 ? current / (1 + change / 100) : current;

        const coinCost = costOf(coin, currency, rates);
        if (coinCost !== null) {
            cost += coinCost;
            costedValue += current;
        }
    }

    const change = value - previousValue;
    return {
        value,
        holdings,
        change,
        changePercent: previousValue > 0 ? (change / previousValue) * 100 : null,
        cost: cost > 0 ? cost : null,
        profit: cost > 0 ? costedValue - cost : null,
        profitPercent: cost > 0 ? ((costedValue - cost) / cost) * 100 : null,
    };
}

export const ALLOCATION_SLOTS = 7;

/**
 * Holdings by value, largest first. The largest `slots` holdings get their own slice and the
 * rest are grouped as "Other" (slot null). Color slots go by watchlist order rather than by
 * value, so a coin keeps its color when prices reshuffle the ranking.
 */
export function allocate(entries, currency, slots = ALLOCATION_SLOTS) {
    const held = entries
        .map(({ coin, ticker }) => ({
            key: coin.id ?? coin.symbol,
            symbol: coin.symbol,
            value: holdingValue(coin, ticker, currency) ?? 0,
        }))
        .filter(slice => slice.value > 0);

    const total = held.reduce((sum, slice) => sum + slice.value, 0);
    if (!total) return [];

    const named = new Set([...held].sort((a, b) => b.value - a.value).slice(0, slots).map(slice => slice.key));
    const slices = held.filter(slice => named.has(slice.key))
        .map((slice, slot) => ({ ...slice, slot }))
        .sort((a, b) => b.value - a.value);
    const rest = held.filter(slice => !named.has(slice.key));
    if (rest.length) {
        slices.push({ key: 'other', symbol: 'Other', value: rest.reduce((sum, slice) => sum + slice.value, 0), slot: null });
    }
    return slices.map(slice => ({ ...slice, share: (slice.value / total) * 100 }));
}

export const SORT_KEYS = ['rank', 'name', 'value', 'price', 'change'];

// The direction a column sorts in when first clicked.
export const NATURAL_DIRECTION = { rank: 'asc', name: 'asc', value: 'desc', price: 'desc', change: 'desc' };

const sortValue = {
    rank: ({ ticker }) => ticker?.rank || null,
    name: ({ coin }) => coin.name.toLocaleLowerCase(),
    value: ({ coin, ticker }, { currency }) => holdingValue(coin, ticker, currency),
    price: ({ ticker }, { currency }) => priceOf(ticker, currency),
    change: ({ ticker }, { currency, period }) => changeOf(ticker, currency, period),
};

/** Sorts a copy of the entries. Entries without a value always go last. */
export function sortEntries(entries, { key, direction, currency, period }) {
    const read = sortValue[key];
    if (!read) return entries;
    const factor = direction === 'asc' ? 1 : -1;

    return entries
        .map(entry => ({ entry, value: read(entry, { currency, period }) }))
        .sort((a, b) => {
            if (a.value === null) return b.value === null ? 0 : 1;
            if (b.value === null) return -1;
            const order = typeof a.value === 'string' ? a.value.localeCompare(b.value) : a.value - b.value;
            return order * factor;
        })
        .map(({ entry }) => entry);
}
