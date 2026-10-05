import { describe, expect, it, vi } from 'vitest';

import { alerts } from './alerts';
import { createBackup, restoreBackup } from './backup';
import { settings } from './settings';
import { coins } from './watchlist';

vi.mock('./market', () => ({ clearHistory: vi.fn(), refreshNow: vi.fn() }));

describe('backups', () => {
    it('round-trips watchlist, alerts and settings', () => {
        restoreBackup(JSON.stringify({
            format: 'coinmenu-backup',
            watchlist: [{ id: 'btc-bitcoin', symbol: 'BTC', name: 'Bitcoin', holding: 1 }],
            alerts: [{ coinId: 'btc-bitcoin', symbol: 'BTC', currency: 'USD', target: 1, direction: 'below' }],
            settings: { currency: 'EUR' },
        }));
        const backup = JSON.parse(createBackup());

        expect(backup.watchlist[0]).toMatchObject({ id: 'btc-bitcoin', holding: 1 });
        expect(backup.alerts).toHaveLength(1);
        expect(backup.settings.currency).toBe('EUR');
        expect(settings.currency).toBe('EUR');
    });

    it('accepts a bare watchlist array as older versions stored it', () => {
        expect(restoreBackup('[{"symbol":"NEO","holding":200}]')).toEqual({ coins: 1, alerts: 0 });
        expect(coins.value[0]).toMatchObject({ symbol: 'NEO', holding: 200 });
        expect(alerts.value).toEqual([]);
    });

    it('rejects files that are not backups', () => {
        expect(() => restoreBackup('not json')).toThrow('not valid JSON');
        expect(() => restoreBackup('{"hello":1}')).toThrow('not a CoinMenu backup');
    });
});
