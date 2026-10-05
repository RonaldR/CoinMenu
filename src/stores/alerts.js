import { ref, watch } from 'vue';

import { readJson, writeJson } from '@/lib/storage';
import { CURRENCIES } from './settings';

const STORAGE_KEY = 'coinmenu-alerts';

export function normalizeAlert(alert) {
    if (!alert || typeof alert !== 'object') return null;
    const target = Number(alert.target);
    if (typeof alert.coinId !== 'string' || !Number.isFinite(target) || target <= 0) return null;
    if (!CURRENCIES.includes(alert.currency) || !['above', 'below'].includes(alert.direction)) return null;
    return {
        id: typeof alert.id === 'string' ? alert.id : crypto.randomUUID(),
        coinId: alert.coinId,
        symbol: String(alert.symbol ?? '').toUpperCase(),
        name: String(alert.name ?? alert.symbol ?? ''),
        currency: alert.currency,
        target,
        direction: alert.direction,
        createdAt: Number.isFinite(alert.createdAt) ? alert.createdAt : Date.now(),
    };
}

export function normalizeAlerts(list) {
    return Array.isArray(list) ? list.map(normalizeAlert).filter(Boolean) : [];
}

export const alerts = ref(normalizeAlerts(readJson(STORAGE_KEY, [])));

watch(alerts, value => writeJson(STORAGE_KEY, value), { deep: true });

/** The direction follows from where the target sits relative to the current price. */
export function addAlert({ coin, currency, target, currentPrice }) {
    const alert = normalizeAlert({
        coinId: coin.id,
        symbol: coin.symbol,
        name: coin.name,
        currency,
        target,
        direction: target >= currentPrice ? 'above' : 'below',
    });
    if (alert) alerts.value.push(alert);
    return alert;
}

export function removeAlert(id) {
    alerts.value = alerts.value.filter(alert => alert.id !== id);
}

export function replaceAlerts(list) {
    alerts.value = normalizeAlerts(list);
}

export function isTriggered(alert, price) {
    if (typeof price !== 'number' || !Number.isFinite(price)) return false;
    return alert.direction === 'above' ? price >= alert.target : price <= alert.target;
}

/** Removes and returns every alert the latest prices crossed. `priceFor(alert)` reads the price. */
export function collectTriggeredAlerts(priceFor) {
    const triggered = alerts.value.filter(alert => isTriggered(alert, priceFor(alert)));
    if (triggered.length) {
        const ids = new Set(triggered.map(alert => alert.id));
        alerts.value = alerts.value.filter(alert => !ids.has(alert.id));
    }
    return triggered;
}
