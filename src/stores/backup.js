import { alerts, replaceAlerts } from './alerts';
import { clearHistory, refreshNow } from './market';
import { replaceSettings, resetSettings, settings } from './settings';
import { coins, replaceWatchlist, resetWatchlist } from './watchlist';

const FORMAT = 'coinmenu-backup';

export function createBackup() {
    return JSON.stringify({
        format: FORMAT,
        version: 1,
        exportedAt: new Date().toISOString(),
        watchlist: coins.value,
        alerts: alerts.value,
        settings: { ...settings },
    }, null, 2);
}

/** Restores a backup file. A bare watchlist array, as older versions stored it, works too. */
export function restoreBackup(text) {
    let data;
    try {
        data = JSON.parse(text);
    } catch {
        throw new Error('That file is not valid JSON.');
    }
    if (Array.isArray(data)) data = { format: FORMAT, watchlist: data };
    if (data?.format !== FORMAT || !Array.isArray(data.watchlist)) {
        throw new Error('That file is not a CoinMenu backup.');
    }

    replaceWatchlist(data.watchlist);
    replaceAlerts(data.alerts ?? []);
    if (data.settings) replaceSettings(data.settings);
    refreshNow();
    return { coins: coins.value.length, alerts: alerts.value.length };
}

/** Back to a fresh install: the next refresh fills the watchlist with the top coins again. */
export function resetAllData() {
    resetWatchlist();
    replaceAlerts([]);
    resetSettings();
    clearHistory();
    refreshNow();
}
