import { beforeEach, describe, expect, it } from 'vitest';

import { addAlert, alerts, collectTriggeredAlerts, isTriggered, normalizeAlerts, replaceAlerts } from './alerts';

const bitcoin = { id: 'btc-bitcoin', symbol: 'BTC', name: 'Bitcoin' };

describe('alerts', () => {
    beforeEach(() => replaceAlerts([]));

    it('picks the direction from the current price', () => {
        expect(addAlert({ coin: bitcoin, currency: 'USD', target: 90_000, currentPrice: 86_000 }).direction).toBe('above');
        expect(addAlert({ coin: bitcoin, currency: 'USD', target: 80_000, currentPrice: 86_000 }).direction).toBe('below');
    });

    it('triggers when the price reaches the target', () => {
        const above = { direction: 'above', target: 100 };
        const below = { direction: 'below', target: 100 };
        expect(isTriggered(above, 100)).toBe(true);
        expect(isTriggered(above, 99.99)).toBe(false);
        expect(isTriggered(below, 100)).toBe(true);
        expect(isTriggered(below, 101)).toBe(false);
        expect(isTriggered(above, null)).toBe(false);
    });

    it('removes triggered alerts and returns them once', () => {
        addAlert({ coin: bitcoin, currency: 'USD', target: 90_000, currentPrice: 86_000 });
        addAlert({ coin: bitcoin, currency: 'EUR', target: 70_000, currentPrice: 77_000 });
        const prices = { USD: 91_000, EUR: 78_000 };

        const triggered = collectTriggeredAlerts(alert => prices[alert.currency]);
        expect(triggered.map(alert => alert.currency)).toEqual(['USD']);
        expect(alerts.value.map(alert => alert.currency)).toEqual(['EUR']);
        expect(collectTriggeredAlerts(alert => prices[alert.currency])).toEqual([]);
    });

    it('ignores invalid stored alerts', () => {
        expect(normalizeAlerts([
            { coinId: 'x', currency: 'USD', target: 1, direction: 'above' },
            { coinId: 'x', currency: 'GBP', target: 1, direction: 'above' },
            { coinId: 'x', currency: 'USD', target: -1, direction: 'above' },
            { coinId: 'x', currency: 'USD', target: 1, direction: 'sideways' },
            'junk',
        ])).toHaveLength(1);
    });
});
