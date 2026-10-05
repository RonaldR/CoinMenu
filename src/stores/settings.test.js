import { describe, expect, it } from 'vitest';

import { resetSettings, sanitizeSettings, settings, toggleSort } from './settings';

describe('sanitizeSettings', () => {
    it('keeps valid values and replaces anything else with defaults', () => {
        expect(sanitizeSettings({ currency: 'EUR', period: '1y', theme: 'light', privacy: 'yes', sortKey: 'price' }))
            .toMatchObject({ currency: 'EUR', period: '24h', theme: 'light', privacy: false, sortKey: 'price' });
        expect(sanitizeSettings(null).currency).toBe('USD');
    });

    it('defaults to dark, moving the old implicit "system" default over once', () => {
        expect(sanitizeSettings(null).theme).toBe('dark');
        expect(sanitizeSettings({ theme: 'system' }).theme).toBe('dark');
        expect(sanitizeSettings({ theme: 'light' }).theme).toBe('light');
        expect(sanitizeSettings({ version: 2, theme: 'system' }).theme).toBe('system');
    });
});

describe('toggleSort', () => {
    it('cycles natural direction, reversed, then back to your own order', () => {
        resetSettings();
        toggleSort('value');
        expect([settings.sortKey, settings.sortDirection]).toEqual(['value', 'desc']);
        toggleSort('value');
        expect([settings.sortKey, settings.sortDirection]).toEqual(['value', 'asc']);
        toggleSort('value');
        expect(settings.sortKey).toBeNull();

        toggleSort('name');
        expect([settings.sortKey, settings.sortDirection]).toEqual(['name', 'asc']);
    });
});
