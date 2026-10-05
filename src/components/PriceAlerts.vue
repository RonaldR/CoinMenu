<template>
    <section class="card alerts" aria-labelledby="alerts-title">
        <h2 id="alerts-title" class="eyebrow">Price alerts</h2>

        <form class="add" @submit.prevent="submit">
            <span class="input-wrap">
                <input
                    v-model="targetDraft"
                    class="field"
                    inputmode="decimal"
                    :placeholder="current === null ? 'Price' : formatPrice(current, currency)"
                    :aria-label="`Alert price in ${currency}`"
                    :disabled="current === null"
                >
                <em>{{ currency }}</em>
            </span>
            <button type="submit" class="button primary" :disabled="!target">
                <AppIcon name="bell" :size="13" /> Add
            </button>
        </form>

        <div class="presets" role="group" aria-label="Quick targets">
            <button v-for="step in PRESETS" :key="step" type="button" :disabled="current === null" @click="usePreset(step)">
                {{ step > 0 ? '+' : '−' }}{{ Math.abs(step) }}%
            </button>
        </div>

        <p class="hint" :class="{ warning: blocked }">
            <template v-if="blocked">Notifications are blocked for this site in your browser settings.</template>
            <template v-else-if="target">
                Notify me when {{ coin.symbol }} goes {{ target >= current ? 'above' : 'below' }}
                {{ formatPrice(target, currency) }}.
            </template>
            <template v-else>Get notified when the price crosses a level, even with the window closed.</template>
        </p>

        <ul v-if="coinAlerts.length" class="list">
            <li v-for="alert in coinAlerts" :key="alert.id">
                <AppIcon :name="alert.direction === 'above' ? 'arrowUp' : 'arrowDown'" :size="12" :class="alert.direction === 'above' ? 'up' : 'down'" />
                <span class="target">{{ formatPrice(alert.target, alert.currency) }}</span>
                <span class="distance">{{ distanceLabel(alert) }}</span>
                <button type="button" class="icon-button small" :aria-label="`Delete alert at ${formatPrice(alert.target, alert.currency)}`" @click="removeAlert(alert.id)">
                    <AppIcon name="x" :size="12" />
                </button>
            </li>
        </ul>
    </section>
</template>

<script setup>
import { computed, ref } from 'vue';

import AppIcon from '@/components/AppIcon.vue';
import { formatInput, formatPercent, formatPrice, parseDecimal } from '@/lib/format';
import { ensureNotificationPermission } from '@/lib/platform';
import { priceOf } from '@/lib/portfolio';
import { addAlert, alerts, removeAlert } from '@/stores/alerts';

const props = defineProps({
    /** `{ id, symbol, name }` — the coin does not need to be on the watchlist. */
    coin: { type: Object, required: true },
    ticker: { type: Object, default: null },
    currency: { type: String, required: true },
});

const PRESETS = [-10, -5, 5, 10];

const targetDraft = ref('');
const blocked = ref(false);

const current = computed(() => priceOf(props.ticker, props.currency));
const target = computed(() => {
    const value = parseDecimal(targetDraft.value);
    return value > 0 && current.value !== null && value !== current.value ? value : null;
});
const coinAlerts = computed(() => alerts.value
    .filter(alert => alert.coinId === props.coin.id)
    .sort((a, b) => b.target - a.target));

function usePreset(step) {
    const value = current.value * (1 + step / 100);
    targetDraft.value = formatInput(value, value < 1 ? { maximumSignificantDigits: 4 } : { maximumFractionDigits: 2 });
}

function distanceLabel(alert) {
    const price = priceOf(props.ticker, alert.currency);
    return price ? `${formatPercent((alert.target / price - 1) * 100)} away` : '';
}

async function submit() {
    if (!target.value) return;
    blocked.value = !(await ensureNotificationPermission());
    addAlert({ coin: props.coin, currency: props.currency, target: target.value, currentPrice: current.value });
    targetDraft.value = '';
}
</script>

<style scoped>
.alerts {
    display: grid;
    align-content: start;
    gap: 10px;
    padding: 14px;
}

.add {
    display: flex;
    gap: 6px;
}

.input-wrap {
    position: relative;
    flex: 1;
}

.input-wrap .field {
    padding-right: 42px;
}

em {
    position: absolute;
    top: 50%;
    right: 10px;
    color: var(--faint);
    font-size: 10px;
    font-style: normal;
    font-weight: 650;
    pointer-events: none;
    transform: translateY(-50%);
}

.presets {
    display: flex;
    gap: 5px;
}

.presets button {
    flex: 1;
    height: 24px;
    padding: 0;
    border: 1px solid var(--line);
    border-radius: 6px;
    background: var(--surface-2);
    color: var(--text-2);
    font-size: 11px;
    font-variant-numeric: tabular-nums;
    font-weight: 600;
}

.presets button:hover:not(:disabled) {
    border-color: var(--line-strong);
    color: var(--text);
}

.hint {
    margin: 0;
    color: var(--muted);
    font-size: 11px;
    line-height: 1.45;
}

.hint.warning {
    color: var(--warning);
}

.list {
    display: grid;
    gap: 2px;
    padding: 8px 0 0;
    margin: 0;
    border-top: 1px solid var(--line);
    list-style: none;
}

.list li {
    display: flex;
    align-items: center;
    gap: 7px;
    min-height: 28px;
}

.target {
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    font-weight: 650;
}

.distance {
    margin-left: auto;
    color: var(--muted);
    font-size: 11px;
    font-variant-numeric: tabular-nums;
}
</style>
