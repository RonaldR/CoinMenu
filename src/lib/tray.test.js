import { describe, expect, it } from 'vitest';

import { trayContent } from './tray';

const summary = { holdings: 2, value: 12345.678, changePercent: -2.5 };
const ticker = { symbol: 'BTC', quotes: { USD: { price: 86215.87, percent_change_24h: 1.4 } } };

describe('trayContent', () => {
    it('shows nothing next to the icon by default', () => {
        expect(trayContent({ mode: 'icon', currency: 'USD', privacy: false, summary, ticker }).title).toBe('');
    });

    it('shows the portfolio value, masked in privacy mode', () => {
        expect(trayContent({ mode: 'value', currency: 'USD', privacy: false, summary, ticker }).title).toBe('$12,346');
        const hidden = trayContent({ mode: 'value', currency: 'USD', privacy: true, summary, ticker });
        expect(hidden.title).toBe('••••');
        expect(hidden.tooltip).not.toContain('12,345');
    });

    it('shows the 24h change with a direction arrow', () => {
        expect(trayContent({ mode: 'change', currency: 'USD', privacy: false, summary, ticker }).title).toBe('▼ 2.50%');
    });

    it('shows a coin price', () => {
        expect(trayContent({ mode: 'coin', currency: 'USD', privacy: false, summary, ticker }).title).toBe('BTC $86,216');
    });

    it('stays empty when there is nothing to show yet', () => {
        const empty = { holdings: 0, value: 0, changePercent: null };
        expect(trayContent({ mode: 'value', currency: 'USD', privacy: false, summary: empty, ticker })).toEqual({ title: '', tooltip: 'CoinMenu' });
        expect(trayContent({ mode: 'coin', currency: 'USD', privacy: false, summary: empty, ticker: null }).title).toBe('');
    });
});
