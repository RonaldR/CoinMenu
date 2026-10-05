import { reactive, watch } from 'vue';

import { NATURAL_DIRECTION, SORT_KEYS } from '@/lib/portfolio';
import { readJson, writeJson } from '@/lib/storage';

const STORAGE_KEY = 'coinmenu-settings';

export const CURRENCIES = ['USD', 'EUR'];
export const PERIODS = ['1h', '24h', '7d'];
export const THEMES = ['system', 'dark', 'light'];
export const TRAY_MODES = ['icon', 'value', 'change', 'coin'];

const DEFAULTS = Object.freeze({
    currency: 'USD',
    period: '24h',
    theme: 'system',
    privacy: false,
    trayMode: 'icon',
    trayCoinId: 'btc-bitcoin',
    sortKey: null,
    sortDirection: 'asc',
});

const oneOf = (options, value, fallback) => (options.includes(value) ? value : fallback);

export function sanitizeSettings(saved) {
    const value = saved && typeof saved === 'object' ? saved : {};
    return {
        currency: oneOf(CURRENCIES, value.currency, DEFAULTS.currency),
        period: oneOf(PERIODS, value.period, DEFAULTS.period),
        theme: oneOf(THEMES, value.theme, DEFAULTS.theme),
        privacy: value.privacy === true,
        trayMode: oneOf(TRAY_MODES, value.trayMode, DEFAULTS.trayMode),
        trayCoinId: typeof value.trayCoinId === 'string' ? value.trayCoinId : DEFAULTS.trayCoinId,
        sortKey: oneOf(SORT_KEYS, value.sortKey, DEFAULTS.sortKey),
        sortDirection: oneOf(['asc', 'desc'], value.sortDirection, DEFAULTS.sortDirection),
    };
}

export const settings = reactive(sanitizeSettings(readJson(STORAGE_KEY, {})));

watch(settings, value => writeJson(STORAGE_KEY, value), { deep: true });

/** Column header clicks cycle: natural direction → reversed → back to your own order. */
export function toggleSort(key) {
    const natural = NATURAL_DIRECTION[key];
    if (settings.sortKey !== key) {
        Object.assign(settings, { sortKey: key, sortDirection: natural });
    } else if (settings.sortDirection === natural) {
        settings.sortDirection = natural === 'asc' ? 'desc' : 'asc';
    } else {
        Object.assign(settings, { sortKey: null, sortDirection: 'asc' });
    }
}

export function replaceSettings(value) {
    Object.assign(settings, sanitizeSettings(value));
}

export function resetSettings() {
    Object.assign(settings, DEFAULTS);
}
