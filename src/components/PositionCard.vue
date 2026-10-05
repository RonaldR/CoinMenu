<template>
    <section class="card position" aria-labelledby="position-title">
        <h2 id="position-title" class="eyebrow">Your position</h2>
        <div class="inputs">
            <label>
                <span>Amount</span>
                <span class="input-wrap">
                    <input
                        v-model="amountDraft"
                        class="field"
                        :class="{ invalid: Number.isNaN(parseDecimal(amountDraft)) }"
                        inputmode="decimal"
                        placeholder="0"
                        @change="saveAmount"
                        @keydown.enter="$event.target.blur()"
                    >
                    <em>{{ coin.symbol }}</em>
                </span>
            </label>
            <label>
                <span>Average buy price</span>
                <span class="input-wrap">
                    <input
                        ref="costInput"
                        v-model="costDraft"
                        class="field"
                        :class="{ invalid: Number.isNaN(parseDecimal(costDraft)) }"
                        inputmode="decimal"
                        placeholder="Optional"
                        @change="saveCost"
                        @keydown.enter="$event.target.blur()"
                    >
                    <em>{{ currency }}</em>
                </span>
            </label>
        </div>
        <dl class="figures">
            <div>
                <dt>Value</dt>
                <dd>{{ privacy ? MASK : formatMoney(value, currency) }}</dd>
            </div>
            <div>
                <dt>Profit / loss</dt>
                <dd v-if="profit" :class="profit.profit >= 0 ? 'up' : 'down'">
                    {{ privacy ? MASK : formatMoney(profit.profit, currency, { signed: true }) }}
                    <small>{{ formatPercent(profit.percent) }}</small>
                </dd>
                <dd v-else class="muted">Add a buy price</dd>
            </div>
        </dl>
    </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

import { formatInput, formatMoney, formatPercent, MASK, parseDecimal } from '@/lib/format';
import { convert, holdingValue, profitOf } from '@/lib/portfolio';
import { setCostBasis, setHolding } from '@/stores/watchlist';

const props = defineProps({
    coin: { type: Object, required: true },
    ticker: { type: Object, default: null },
    currency: { type: String, required: true },
    rates: { type: Object, required: true },
    privacy: { type: Boolean, default: false },
});

const value = computed(() => holdingValue(props.coin, props.ticker, props.currency));
const profit = computed(() => profitOf(props.coin, props.ticker, props.currency, props.rates));

// A buy price is stored in the currency it was typed in and shown converted to the current one.
const displayedCost = computed(() => convert(
    props.coin.costBasis,
    props.coin.costCurrency || props.currency,
    props.currency,
    props.rates,
));

// Converted prices get cents (or 6 significant digits below 1) instead of a long FX tail.
const costToDraft = cost => formatInput(cost, cost >= 1 ? { maximumFractionDigits: 2 } : { maximumSignificantDigits: 6 });

const costInput = ref(null);
const amountDraft = ref('');
const costDraft = ref('');
watch(() => props.coin.holding, (amount) => {
    amountDraft.value = formatInput(amount);
}, { immediate: true });
// Exchange rates move on every refresh; never rewrite the field while someone is typing in it.
watch(displayedCost, (cost) => {
    if (document.activeElement !== costInput.value) costDraft.value = costToDraft(cost);
}, { immediate: true });

function saveAmount() {
    const amount = parseDecimal(amountDraft.value);
    if (!Number.isNaN(amount)) setHolding(props.coin, amount);
    amountDraft.value = formatInput(props.coin.holding);
}

function saveCost() {
    const cost = parseDecimal(costDraft.value);
    if (!Number.isNaN(cost)) setCostBasis(props.coin, cost, props.currency);
    costDraft.value = costToDraft(displayedCost.value);
}
</script>

<style scoped>
.position {
    display: grid;
    align-content: start;
    gap: 12px;
    padding: 14px;
}

.inputs {
    display: grid;
    gap: 8px;
}

label {
    display: grid;
    gap: 4px;
    color: var(--muted);
    font-size: 11px;
}

.input-wrap {
    position: relative;
    display: block;
}

.input-wrap .field {
    padding-right: 42px;
}

.field.invalid {
    border-color: var(--down);
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

.figures {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    padding-top: 10px;
    margin: 0;
    border-top: 1px solid var(--line);
}

dt {
    color: var(--muted);
    font-size: 11px;
}

dd {
    margin: 3px 0 0;
    font-size: 13px;
    font-variant-numeric: tabular-nums;
    font-weight: 650;
}

dd small {
    display: block;
    margin-top: 1px;
    font-size: 11px;
    font-weight: 600;
}

dd.muted {
    font-size: 12px;
    font-weight: 500;
}
</style>
