import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
    addCoin,
    coins,
    insertCoin,
    moveCoin,
    normalizeCoins,
    removeCoin,
    replaceWatchlist,
    resetWatchlist,
    resolveLegacyCoins,
    seedWatchlist,
} from './watchlist';

const tickers = [
    { id: 'btc-bitcoin', symbol: 'BTC', name: 'Bitcoin', rank: 1 },
    { id: 'eth-ethereum', symbol: 'ETH', name: 'Ethereum', rank: 2 },
    { id: 'neo-neo', symbol: 'NEO', name: 'NEO', rank: 90 },
    { id: 'neo-fake', symbol: 'NEO', name: 'Fake NEO', rank: 900 },
];

describe('normalizeCoins', () => {
    it('reads every format CoinMenu has stored', () => {
        expect(normalizeCoins([
            ' btc ',
            { symbol: 'smart', holding: '10000' },
            { id: 'eth-ethereum', symbol: 'ETH', name: 'Ethereum', holding: 1.5, costBasis: 2000, costCurrency: 'EUR' },
        ])).toEqual([
            { id: null, symbol: 'BTC', name: 'BTC', holding: null, costBasis: null, costCurrency: null },
            { id: null, symbol: 'SMART', name: 'SMART', holding: 10000, costBasis: null, costCurrency: null },
            { id: 'eth-ethereum', symbol: 'ETH', name: 'Ethereum', holding: 1.5, costBasis: 2000, costCurrency: 'EUR' },
        ]);
    });

    it('drops invalid entries, negative amounts and duplicates', () => {
        const result = normalizeCoins([null, 42, { holding: 3 }, { symbol: 'BTC', holding: -1 }, 'BTC', { id: 'x', symbol: 'X' }, { id: 'x', symbol: 'X' }]);
        expect(result).toHaveLength(2);
        expect(result[0].holding).toBeNull();
    });

    it('survives garbage', () => {
        expect(normalizeCoins('nope')).toEqual([]);
    });
});

describe('editing the watchlist', () => {
    beforeEach(() => replaceWatchlist([]));

    it('adds a coin once', () => {
        expect(addCoin(tickers[0])).toBe(true);
        expect(addCoin(tickers[0])).toBe(false);
        expect(coins.value).toHaveLength(1);
    });

    it('removes a coin and can put it back where it was', () => {
        replaceWatchlist(tickers.slice(0, 3));
        const [, ethereum] = coins.value;
        const index = removeCoin(ethereum);
        expect(coins.value.map(coin => coin.symbol)).toEqual(['BTC', 'NEO']);
        insertCoin(ethereum, index);
        expect(coins.value.map(coin => coin.symbol)).toEqual(['BTC', 'ETH', 'NEO']);
    });

    it('reorders coins', () => {
        replaceWatchlist(tickers.slice(0, 3));
        moveCoin(0, 2);
        expect(coins.value.map(coin => coin.symbol)).toEqual(['ETH', 'NEO', 'BTC']);
    });
});

describe('seedWatchlist', () => {
    it('fills a fresh watchlist once, and never refills one the user emptied', () => {
        resetWatchlist();
        seedWatchlist(tickers);
        expect(coins.value).toHaveLength(4);

        replaceWatchlist([]);
        seedWatchlist(tickers);
        expect(coins.value).toHaveLength(0);
    });
});

describe('resolveLegacyCoins', () => {
    it('matches symbols to the highest ranked coin, keeping holdings', async () => {
        replaceWatchlist([{ symbol: 'NEO', holding: 200 }]);
        await resolveLegacyCoins(tickers, vi.fn());
        expect(coins.value).toEqual([
            { id: 'neo-neo', symbol: 'NEO', name: 'NEO', holding: 200, costBasis: null, costCurrency: null },
        ]);
    });

    it('looks up unknown symbols once, then leaves them alone', async () => {
        replaceWatchlist([{ symbol: 'SMART', holding: 5 }, { symbol: 'NOPE' }]);
        const lookup = vi.fn(async symbol => (symbol === 'SMART' ? { id: 'smart-smartcash', symbol: 'SMART', name: 'SmartCash' } : null));

        await resolveLegacyCoins(tickers, lookup);
        await resolveLegacyCoins(tickers, lookup);

        expect(coins.value.map(coin => coin.id)).toEqual(['smart-smartcash', null]);
        expect(lookup).toHaveBeenCalledTimes(2);
    });

    it('merges a legacy entry into an existing coin, keeping its amounts', async () => {
        replaceWatchlist([{ id: 'btc-bitcoin', symbol: 'BTC', name: 'Bitcoin' }, { symbol: 'BTC', holding: 0.5 }]);
        await resolveLegacyCoins(tickers, vi.fn());
        expect(coins.value).toEqual([
            { id: 'btc-bitcoin', symbol: 'BTC', name: 'Bitcoin', holding: 0.5, costBasis: null, costCurrency: null },
        ]);
    });
});
