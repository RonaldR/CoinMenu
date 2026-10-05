import { watch, watchEffect } from 'vue';

import { formatPercent, formatPrice } from '@/lib/format';
import { isDesktop, notify, onNavigate, onRefreshRequest, setTray } from '@/lib/platform';
import { changeOf, priceOf } from '@/lib/portfolio';
import { trayContent } from '@/lib/tray';
import { alerts, collectTriggeredAlerts } from './alerts';
import { market, refreshNow, rescheduleAutoRefresh, startAutoRefresh, tickerById } from './market';
import { daySummary } from './portfolio';
import { settings } from './settings';

/** Work that keeps running while the window is hidden: refreshes, alerts and the menu bar. */
export function startBackgroundTasks(router) {
    onNavigate(route => router.push(route));
    onRefreshRequest(() => refreshNow());

    const needsBackgroundUpdates = () => alerts.value.length > 0 || (isDesktop && settings.trayMode !== 'icon');
    startAutoRefresh({ keepAlive: needsBackgroundUpdates });
    watch(needsBackgroundUpdates, rescheduleAutoRefresh);

    watch(() => market.updatedAt, () => {
        const triggered = collectTriggeredAlerts(alert => priceOf(tickerById(alert.coinId), alert.currency));
        for (const alert of triggered) {
            const ticker = tickerById(alert.coinId);
            const price = priceOf(ticker, alert.currency);
            notify({
                title: `${alert.symbol} is ${alert.direction} ${formatPrice(alert.target, alert.currency)}`,
                body: `${alert.name} is trading at ${formatPrice(price, alert.currency)} `
                    + `(${formatPercent(changeOf(ticker, alert.currency, '24h'))} in 24h).`,
                route: `/coin/${alert.coinId}`,
            });
        }
    });

    if (isDesktop) {
        watchEffect(() => setTray(trayContent({
            mode: settings.trayMode,
            currency: settings.currency,
            privacy: settings.privacy,
            summary: daySummary.value,
            ticker: tickerById(settings.trayCoinId),
        })));
    }
}
