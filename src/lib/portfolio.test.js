import { describe, expect, it } from 'vitest';

import { allocate, convert, exchangeRates, profitOf, sortEntries, summarize } from './portfolio';

const ticker = (id, usd, { eur = usd * 0.9, change24h = 0, change1h = 0, rank = 1 } = {}) => ({
    id,
    symbol: id.toUpperCase(),
    rank,
    quotes: {
        USD: { price: usd, percent_change_24h: change24h, percent_change_1h: change1h },
        EUR: { price: eur, percent_change_24h: change24h, percent_change_1h: change1h },
    },
});

const coin = (id, holding = null, extra = {}) => ({ id, symbol: id.toUpperCase(), name: id, holding, costBasis: null, costCurrency: null, ...extra });

const rates = { USD: 1, EUR: 0.9 };

describe('exchangeRates and convert', () => {
    it('derives rates from one ticker quoted in several currencies', () => {
        expect(exchangeRates(ticker('btc', 100_000, { eur: 90_000 }))).toEqual({ USD: 1, EUR: 0.9 });
        expect(exchangeRates(null)).toEqual({ USD: 1 });
    });

    it('converts between currencies and gives up without a rate', () => {
        expect(convert(100, 'USD', 'EUR', rates)).toBeCloseTo(90);
        expect(convert(90, 'EUR', 'USD', rates)).toBeCloseTo(100);
        expect(convert(5, 'USD', 'USD', {})).toBe(5);
        expect(convert(5, 'USD', 'GBP', rates)).toBeNull();
    });
});

describe('summarize', () => {
    it('adds up holdings and their change over the period', () => {
        const entries = [
            { coin: coin('btc', 0.5), ticker: ticker('btc', 100_000, { change24h: 25 }) },
            { coin: coin('eth', 2), ticker: ticker('eth', 2_500, { change24h: -50 }) },
            { coin: coin('sol'), ticker: ticker('sol', 100) },
            { coin: coin('gone', 10), ticker: null },
        ];
        const result = summarize(entries, { currency: 'USD', period: '24h', rates });

        expect(result.holdings).toBe(2);
        expect(result.value).toBe(55_000);
        // Yesterday: 50,000 / 1.25 + 5,000 / 0.5 = 40,000 + 10,000.
        expect(result.change).toBeCloseTo(5_000);
        expect(result.changePercent).toBeCloseTo(10);
        expect(result.profit).toBeNull();
    });

    it('reports profit only over coins with a buy price, converting its currency', () => {
        const entries = [
            { coin: coin('btc', 1, { costBasis: 45_000, costCurrency: 'EUR' }), ticker: ticker('btc', 100_000) },
            { coin: coin('eth', 1), ticker: ticker('eth', 2_000) },
        ];
        const result = summarize(entries, { currency: 'USD', period: '24h', rates });

        expect(result.cost).toBeCloseTo(50_000);
        expect(result.profit).toBeCloseTo(50_000);
        expect(result.profitPercent).toBeCloseTo(100);
    });
});

describe('profitOf', () => {
    it('compares value with what the holding cost', () => {
        const result = profitOf(coin('btc', 2, { costBasis: 50_000, costCurrency: 'USD' }), ticker('btc', 60_000), 'USD', rates);
        expect(result).toEqual({ value: 120_000, cost: 100_000, profit: 20_000, percent: 20 });
    });

    it('needs both an amount and a buy price', () => {
        expect(profitOf(coin('btc', 2), ticker('btc', 1), 'USD', rates)).toBeNull();
    });
});

describe('allocate', () => {
    it('orders slices by value but keeps colour slots in watchlist order', () => {
        const entries = [
            { coin: coin('a', 1), ticker: ticker('a', 10) },
            { coin: coin('b', 1), ticker: ticker('b', 30) },
            { coin: coin('c'), ticker: ticker('c', 99) },
            { coin: coin('d', 1), ticker: ticker('d', 60) },
        ];
        expect(allocate(entries, 'USD').map(({ key, slot, share }) => [key, slot, share])).toEqual([
            ['d', 2, 60],
            ['b', 1, 30],
            ['a', 0, 10],
        ]);
    });

    it('groups coins past the last colour slot as Other', () => {
        const entries = ['a', 'b', 'c', 'd'].map(id => ({ coin: coin(id, 1), ticker: ticker(id, 25) }));
        const slices = allocate(entries, 'USD', 2);
        expect(slices.map(slice => slice.key)).toEqual(['a', 'b', 'other']);
        expect(slices[2]).toMatchObject({ slot: null, share: 50 });
    });

    it('never hides the largest holding in Other', () => {
        const entries = ['a', 'b', 'c', 'd'].map((id, index) => ({ coin: coin(id, 1), ticker: ticker(id, index === 3 ? 97 : 1) }));
        const slices = allocate(entries, 'USD', 2);
        expect(slices.map(({ key, slot }) => [key, slot])).toEqual([['d', 1], ['a', 0], ['other', null]]);
    });

    it('is empty without holdings', () => {
        expect(allocate([{ coin: coin('a'), ticker: ticker('a', 1) }], 'USD')).toEqual([]);
    });
});

describe('sortEntries', () => {
    const entries = [
        { coin: coin('beta', 1), ticker: ticker('beta', 20, { rank: 2, change24h: 5 }) },
        { coin: coin('alpha'), ticker: ticker('alpha', 50, { rank: 1, change24h: -3 }) },
        { coin: coin('gamma', 2), ticker: null },
    ];
    const ids = list => list.map(entry => entry.coin.id);
    const sort = (key, direction) => ids(sortEntries(entries, { key, direction, currency: 'USD', period: '24h' }));

    it('sorts by each column in both directions', () => {
        expect(sort('rank', 'asc')).toEqual(['alpha', 'beta', 'gamma']);
        expect(sort('name', 'desc')).toEqual(['gamma', 'beta', 'alpha']);
        expect(sort('price', 'desc')).toEqual(['alpha', 'beta', 'gamma']);
        expect(sort('change', 'asc')).toEqual(['alpha', 'beta', 'gamma']);
    });

    it('always puts entries without a value last', () => {
        expect(sort('value', 'desc')).toEqual(['beta', 'alpha', 'gamma']);
        expect(sort('value', 'asc')).toEqual(['beta', 'alpha', 'gamma']);
    });

    it('keeps the original order for an unknown key', () => {
        expect(sort(null, 'asc')).toEqual(['beta', 'alpha', 'gamma']);
    });
});
