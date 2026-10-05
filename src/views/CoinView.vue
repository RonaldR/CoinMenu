<template>
    <main class="view coin-view">
        <header class="topbar">
            <div class="identity">
                <button type="button" class="icon-button" aria-label="Back to watchlist" title="Back (Esc)" @click="goBack">
                    <AppIcon name="back" :size="16" />
                </button>
                <CoinLogo :id="id" :symbol="info.symbol" :size="26" />
                <div class="names">
                    <h1>{{ info.name }}</h1>
                    <span>
                        {{ info.symbol }}
                        <span v-if="ticker?.rank" class="rank">Rank #{{ ticker.rank }}</span>
                    </span>
                </div>
            </div>
            <div class="toolbar">
                <button v-if="!coin && ticker" type="button" class="button" @click="addToWatchlist">
                    <AppIcon name="plus" :size="13" /> Watchlist
                </button>
                <button
                    type="button"
                    class="icon-button"
                    :aria-label="`Open ${info.name} on CoinPaprika`"
                    title="Open on CoinPaprika"
                    @click="openExternal(coinPageUrl(id))"
                >
                    <AppIcon name="external" :size="14" />
                </button>
            </div>
        </header>

        <section class="price-head">
            <div>
                <div class="price">{{ formatPrice(displayPrice, settings.currency) }}</div>
                <div class="price-change" :class="displayChange === null ? 'muted' : displayChange >= 0 ? 'up' : 'down'">
                    <AppIcon v-if="displayChange !== null" :name="displayChange >= 0 ? 'arrowUp' : 'arrowDown'" :size="12" :stroke-width="2.5" />
                    {{ formatPercent(displayChange) }}
                    <span class="muted">{{ changeLabel }}</span>
                </div>
            </div>
            <SegmentedControl v-model="range" :options="RANGE_OPTIONS" label="Chart range" />
        </section>

        <PriceChart
            :points="chartPoints"
            :currency="settings.currency"
            :range="range"
            :loading="historyLoading"
            :error="history?.error ?? ''"
            @hover="hoverPoint = $event"
        />
        <p v-if="settings.currency !== 'USD' && chartPoints.length" class="chart-note">
            Price history converted from USD at today's rate.
        </p>

        <div class="cards">
            <PositionCard
                v-if="coin"
                :coin="coin"
                :ticker="ticker"
                :currency="settings.currency"
                :rates="rates"
                :privacy="settings.privacy"
            />
            <PriceAlerts :coin="{ id, symbol: info.symbol, name: info.name }" :ticker="ticker" :currency="settings.currency" />
        </div>

        <section v-if="ticker" class="market" aria-labelledby="market-title">
            <h2 id="market-title" class="eyebrow">Market</h2>
            <div class="changes">
                <div v-for="period in CHANGE_PERIODS" :key="period">
                    <span>{{ period }}</span>
                    <strong :class="toneOf(changeOf(ticker, settings.currency, period))">
                        {{ formatPercent(changeOf(ticker, settings.currency, period)) }}
                    </strong>
                </div>
            </div>
            <dl class="stats">
                <div v-for="stat in stats" :key="stat.label">
                    <dt>{{ stat.label }}</dt>
                    <dd :class="stat.tone">{{ stat.value }} <small v-if="stat.note">{{ stat.note }}</small></dd>
                </div>
            </dl>
        </section>
    </main>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import AppIcon from '@/components/AppIcon.vue';
import CoinLogo from '@/components/CoinLogo.vue';
import PositionCard from '@/components/PositionCard.vue';
import PriceAlerts from '@/components/PriceAlerts.vue';
import PriceChart from '@/components/PriceChart.vue';
import SegmentedControl from '@/components/SegmentedControl.vue';
import { useHotkeys } from '@/composables/useHotkeys';
import { formatBtc, formatCompactMoney, formatCompactNumber, formatDate, formatPercent, formatPrice } from '@/lib/format';
import { openExternal } from '@/lib/platform';
import { changeOf, priceOf, quoteOf } from '@/lib/portfolio';
import { coinPageUrl } from '@/services/coinpaprika';
import { btcPriceOf, ensureHistory, ensureTicker, historyFor, market, rates, tickerById } from '@/stores/market';
import { settings } from '@/stores/settings';
import { addCoin, findCoin } from '@/stores/watchlist';

const props = defineProps({
    id: { type: String, required: true },
});

const RANGE_OPTIONS = [
    { value: '24h', label: '24H' },
    { value: '7d', label: '7D' },
    { value: '30d', label: '30D' },
    { value: '1y', label: '1Y' },
];
const RANGE_LABELS = { '24h': 'past 24 hours', '7d': 'past 7 days', '30d': 'past 30 days', '1y': 'past year' };
const CHANGE_PERIODS = ['1h', '24h', '7d'];

const router = useRouter();
const range = ref('24h');
const hoverPoint = ref(null);

const coin = computed(() => findCoin(props.id));
const ticker = computed(() => tickerById(props.id));
const info = computed(() => ({
    symbol: ticker.value?.symbol ?? coin.value?.symbol ?? '',
    name: ticker.value?.name ?? coin.value?.name ?? 'Loading…',
}));

watch(() => [props.id, market.updatedAt], () => ensureTicker(props.id), { immediate: true });
watch(
    () => [props.id, range.value, market.visible, market.updatedAt],
    () => {
        ensureHistory(props.id, range.value);
        // Daily history gets the last day in hourly detail (usually cached for the sparkline).
        if (range.value === '7d' || range.value === '30d') ensureHistory(props.id, '24h');
    },
    { immediate: true },
);

const history = computed(() => historyFor(props.id, range.value));
const historyLoading = computed(() => Boolean(history.value?.loading || !history.value));

/** History plus the live price, in the display currency. */
const chartPoints = computed(() => {
    let points = history.value?.points ?? [];
    if (!points.length) return [];

    const recent = historyFor(props.id, '24h')?.points ?? [];
    if ((range.value === '7d' || range.value === '30d') && recent.length) {
        points = [...points.filter(([time]) => time < recent[0][0]), ...recent];
    }

    const live = priceOf(ticker.value, 'USD');
    const liveTime = Date.parse(ticker.value?.last_updated) || market.updatedAt;
    if (live !== null && liveTime > points[points.length - 1][0]) points = [...points, [liveTime, live]];

    const rate = rates.value[settings.currency];
    return rate ? points.map(([time, usd]) => [time, usd * rate]) : [];
});

const displayPrice = computed(() => hoverPoint.value?.[1] ?? priceOf(ticker.value, settings.currency));
// CoinPaprika reports 0 for every 30-day and 1-year USD change, so those come from the chart.
const QUOTED_RANGES = ['24h', '7d'];

const displayChange = computed(() => {
    const points = chartPoints.value;
    if (hoverPoint.value && points.length) return (hoverPoint.value[1] / points[0][1] - 1) * 100;
    if (QUOTED_RANGES.includes(range.value)) return changeOf(ticker.value, settings.currency, range.value);
    return points.length > 1 ? (points[points.length - 1][1] / points[0][1] - 1) * 100 : null;
});
const changeLabel = computed(() => {
    if (!hoverPoint.value) return RANGE_LABELS[range.value];
    const options = range.value === '24h'
        ? { weekday: 'short', hour: 'numeric', minute: '2-digit' }
        : { day: 'numeric', month: 'short', year: 'numeric' };
    return formatDate(hoverPoint.value[0], options);
});

const toneOf = value => (value === null ? 'muted' : value >= 0 ? 'up' : 'down');

const stats = computed(() => {
    const quote = quoteOf(ticker.value, settings.currency) ?? {};
    const currency = settings.currency;
    const supply = ticker.value?.total_supply;
    const maxSupply = ticker.value?.max_supply;
    return [
        { label: 'Market cap', value: formatCompactMoney(quote.market_cap, currency) },
        { label: '24h volume', value: formatCompactMoney(quote.volume_24h, currency) },
        { label: 'All-time high', value: formatPrice(quote.ath_price, currency), note: quote.ath_date ? formatDate(quote.ath_date) : '' },
        { label: 'Down from high', value: formatPercent(quote.percent_from_price_ath), tone: toneOf(quote.percent_from_price_ath ?? null) },
        { label: 'Supply', value: supply ? `${formatCompactNumber(supply)} ${info.value.symbol}` : '—' },
        { label: 'Max supply', value: maxSupply ? `${formatCompactNumber(maxSupply)} ${info.value.symbol}` : 'No cap' },
        { label: 'Price in BTC', value: formatBtc(btcPriceOf(ticker.value)) },
        { label: 'Tracked since', value: formatDate(ticker.value?.first_data_at) },
    ];
});

function addToWatchlist() {
    addCoin(ticker.value);
}

function goBack() {
    if (window.history.state?.back) router.back();
    else router.push('/');
}

useHotkeys({
    escape: goBack,
    backspace: goBack,
    1: () => {
        range.value = '24h';
    },
    2: () => {
        range.value = '7d';
    },
    3: () => {
        range.value = '30d';
    },
    4: () => {
        range.value = '1y';
    },
});
</script>

<style scoped>
.identity {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 10px;
}

.names {
    display: grid;
    min-width: 0;
}

h1 {
    overflow: hidden;
    margin: 0;
    font-size: 14px;
    font-weight: 700;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.names > span {
    color: var(--muted);
    font-size: 11px;
}

.rank {
    margin-left: 4px;
    color: var(--faint);
}

.price-head {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px;
    margin: 16px 0 14px;
}

.price {
    font-size: 28px;
    font-variant-numeric: tabular-nums;
    font-weight: 720;
    letter-spacing: -0.03em;
    line-height: 1.1;
}

.price-change {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-top: 5px;
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    font-weight: 650;
}

.price-change .muted {
    font-weight: 500;
}

.chart-note {
    margin: 4px 0 0;
    color: var(--faint);
    font-size: 10px;
    text-align: right;
}

.cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
    gap: 10px;
    margin-top: 16px;
}

.market {
    margin: 18px 0 16px;
}

.changes {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
    margin: 10px 0;
}

.changes div {
    display: grid;
    justify-items: center;
    gap: 3px;
    padding: 8px 4px;
    border: 1px solid var(--line);
    border-radius: var(--radius);
    background: var(--surface);
}

.changes span {
    color: var(--muted);
    font-size: 10px;
    font-weight: 650;
    text-transform: uppercase;
}

.changes strong {
    font-size: 12px;
    font-variant-numeric: tabular-nums;
}

.stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 18px;
    margin: 0;
}

.stats div {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 10px;
    padding: 9px 0;
    border-bottom: 1px solid var(--line);
}

dt {
    color: var(--muted);
    font-size: 11px;
    white-space: nowrap;
}

dd {
    margin: 0;
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    font-weight: 600;
    text-align: right;
}

dd small {
    display: block;
    color: var(--faint);
    font-size: 10px;
    font-weight: 500;
}
</style>
