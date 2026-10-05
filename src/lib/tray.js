import { formatMoney, formatPercent, formatTrayPrice, MASK } from './format';
import { changeOf, priceOf } from './portfolio';

/**
 * What the menu bar shows next to the icon, plus the hover tooltip.
 * Modes: "icon" (nothing), "value" (portfolio value), "change" (portfolio 24h %), "coin" (a price).
 */
export function trayContent({ mode, currency, privacy, summary, ticker }) {
    const hasPortfolio = summary.holdings > 0;
    let title = '';

    if (mode === 'value' && hasPortfolio) {
        title = privacy ? MASK.slice(0, 4) : formatTrayPrice(summary.value, currency);
    } else if (mode === 'change' && hasPortfolio && summary.changePercent !== null) {
        title = `${summary.changePercent >= 0 ? '▲' : '▼'} ${formatPercent(Math.abs(summary.changePercent), { signed: false })}`;
    } else if (mode === 'coin' && priceOf(ticker, currency) !== null) {
        title = `${ticker.symbol} ${formatTrayPrice(priceOf(ticker, currency), currency)}`;
    }

    let tooltip = 'CoinMenu';
    if (hasPortfolio) {
        const value = privacy ? 'hidden' : formatMoney(summary.value, currency);
        tooltip += ` · Portfolio ${value} (${formatPercent(summary.changePercent)} 24h)`;
    } else if (mode === 'coin' && ticker) {
        tooltip += ` · ${ticker.symbol} ${formatPercent(changeOf(ticker, currency, '24h'))} 24h`;
    }

    return { title, tooltip };
}
