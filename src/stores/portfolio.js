import { computed } from 'vue';

import { allocate, sortEntries, summarize } from '@/lib/portfolio';
import { rates, tickerFor } from './market';
import { settings } from './settings';
import { coins } from './watchlist';

/** Watchlist coins paired with their live tickers, in the user's own order. */
export const entries = computed(() => coins.value.map(coin => ({ coin, ticker: tickerFor(coin) })));

export const sortedEntries = computed(() => (settings.sortKey
    ? sortEntries(entries.value, {
        key: settings.sortKey,
        direction: settings.sortDirection,
        currency: settings.currency,
        period: settings.period,
    })
    : entries.value));

export const summary = computed(() => summarize(entries.value, {
    currency: settings.currency,
    period: settings.period,
    rates: rates.value,
}));

/** The menu bar always reports the 24-hour change, whatever period the list shows. */
export const daySummary = computed(() => (settings.period === '24h'
    ? summary.value
    : summarize(entries.value, { currency: settings.currency, period: '24h', rates: rates.value })));

export const allocation = computed(() => allocate(entries.value, settings.currency));
