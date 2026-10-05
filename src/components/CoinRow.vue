<template>
    <tr class="coin-row" :class="{ editing, clickable: !editing && coin.id }" :draggable="dragArmed" @click="open" @dragend="dragArmed = false">
        <td class="col-coin">
            <div class="coin-cell">
                <span
                    v-if="reorderable"
                    class="grip"
                    title="Drag to reorder"
                    @pointerdown="dragArmed = true"
                    @pointerup="dragArmed = false"
                >
                    <AppIcon name="grip" :size="14" />
                </span>
                <CoinLogo :id="coin.id" :symbol="coin.symbol" :size="26" />
                <span class="names">
                    <RouterLink v-if="coin.id && !editing" :to="`/coin/${coin.id}`" class="name" @click.stop>{{ coin.name }}</RouterLink>
                    <span v-else class="name">{{ coin.name }}</span>
                    <span class="symbol">{{ coin.symbol }}</span>
                </span>
            </div>
        </td>

        <td class="col-chart">
            <SparkLine :points="sparkPoints" :direction="sparkDirection" :label="`${coin.name} price over ${sparkRange}`" />
        </td>

        <td class="col-holding numeric">
            <input
                v-if="editing"
                v-model="holdingDraft"
                class="field holding-input"
                :class="{ invalid: holdingInvalid }"
                inputmode="decimal"
                placeholder="0"
                :aria-label="`Amount of ${coin.symbol} you hold`"
                @click.stop
                @change="saveHolding"
                @keydown.enter="$event.target.blur()"
            >
            <template v-else-if="coin.holding !== null">
                <strong>{{ privacy ? MASK : formatMoney(value, currency) }}</strong>
                <small v-if="!privacy">{{ formatAmount(coin.holding) }} {{ coin.symbol }}</small>
            </template>
            <span v-else class="faint">—</span>
        </td>

        <td class="col-price numeric">
            <strong>{{ formatPrice(price, currency) }}</strong>
            <small>{{ formatBtc(btcPriceOf(ticker)) }}</small>
        </td>

        <td class="col-change numeric">
            <button
                v-if="editing"
                type="button"
                class="icon-button small remove"
                :aria-label="`Remove ${coin.name} from watchlist`"
                @click.stop="emit('remove', coin)"
            >
                <AppIcon name="trash" :size="13" />
            </button>
            <span v-else class="pill" :class="change === null ? 'flat' : change >= 0 ? 'up' : 'down'">
                {{ formatPercent(change) }}
            </span>
        </td>
    </tr>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import AppIcon from '@/components/AppIcon.vue';
import CoinLogo from '@/components/CoinLogo.vue';
import SparkLine from '@/components/SparkLine.vue';
import { formatAmount, formatBtc, formatInput, formatMoney, formatPercent, formatPrice, MASK, parseDecimal } from '@/lib/format';
import { changeOf, holdingValue, priceOf } from '@/lib/portfolio';
import { btcPriceOf, ensureHistory, historyFor, market } from '@/stores/market';
import { setHolding } from '@/stores/watchlist';

const props = defineProps({
    coin: { type: Object, required: true },
    ticker: { type: Object, default: null },
    currency: { type: String, required: true },
    period: { type: String, required: true },
    editing: { type: Boolean, default: false },
    reorderable: { type: Boolean, default: false },
    privacy: { type: Boolean, default: false },
});
const emit = defineEmits(['remove']);
const router = useRouter();

const price = computed(() => priceOf(props.ticker, props.currency));
const change = computed(() => changeOf(props.ticker, props.currency, props.period));
const value = computed(() => holdingValue(props.coin, props.ticker, props.currency));

// History only comes hourly for the last day, so both short periods share the 24h curve.
const sparkRange = computed(() => (props.period === '7d' ? '7d' : '24h'));
const sparkPoints = computed(() => {
    const points = historyFor(props.coin.id, sparkRange.value)?.points ?? [];
    const live = priceOf(props.ticker, 'USD');
    return points.length && live !== null ? [...points.map(([, usd]) => usd), live] : [];
});

// The curve starts on a whole hour and may be cached for a while, so its color follows the
// ticker's own change for that range to always agree with the percentage next to it.
const sparkDirection = computed(() => {
    const rangeChange = changeOf(props.ticker, 'USD', sparkRange.value);
    return rangeChange === null ? null : rangeChange >= 0 ? 'up' : 'down';
});

watch(
    () => [props.coin.id, sparkRange.value, market.visible, market.updatedAt],
    () => ensureHistory(props.coin.id, sparkRange.value),
    { immediate: true },
);

const holdingDraft = ref(formatInput(props.coin.holding));
const holdingInvalid = computed(() => Number.isNaN(parseDecimal(holdingDraft.value)));
watch(() => props.coin.holding, (amount) => {
    holdingDraft.value = formatInput(amount);
});

function saveHolding() {
    const amount = parseDecimal(holdingDraft.value);
    if (Number.isNaN(amount)) {
        holdingDraft.value = formatInput(props.coin.holding);
        return;
    }
    setHolding(props.coin, amount);
    holdingDraft.value = formatInput(props.coin.holding);
}

const dragArmed = ref(false);

function open() {
    if (!props.editing && props.coin.id) router.push(`/coin/${props.coin.id}`);
}
</script>

<style scoped>
.coin-row {
    transition: background-color 0.15s;
}

.coin-row.clickable {
    cursor: pointer;
}

.coin-row.clickable:hover {
    background: color-mix(in srgb, var(--surface) 70%, transparent);
}

td {
    height: 54px;
    padding: 6px 5px;
    border-top: 1px solid var(--line);
    vertical-align: middle;
}

td:first-child {
    padding-left: 4px;
}

td:last-child {
    padding-right: 4px;
}

.coin-cell {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 9px;
}

.grip {
    display: grid;
    margin: 0 -4px 0 -2px;
    color: var(--faint);
    cursor: grab;
    touch-action: none;
}

.grip:active {
    cursor: grabbing;
}

.names {
    display: grid;
    min-width: 0;
    gap: 2px;
}

.name {
    overflow: hidden;
    font-size: 12px;
    font-weight: 620;
    text-overflow: ellipsis;
    white-space: nowrap;
}

a.name:hover {
    color: var(--accent);
}

.symbol {
    color: var(--muted);
    font-size: 10px;
    letter-spacing: 0.04em;
}

.col-chart :deep(.sparkline) {
    margin: 0 auto;
}

.numeric {
    text-align: right;
}

.numeric strong {
    display: block;
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    font-weight: 600;
    white-space: nowrap;
}

.numeric small {
    display: block;
    overflow: hidden;
    margin-top: 2px;
    color: var(--muted);
    font-size: 10px;
    font-variant-numeric: tabular-nums;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.faint {
    color: var(--faint);
}

.holding-input {
    height: 28px;
    padding: 0 7px;
    text-align: right;
}

.holding-input.invalid {
    border-color: var(--down);
}

.remove {
    margin-left: auto;
}

.remove:hover:not(:disabled) {
    color: var(--down);
}
</style>
