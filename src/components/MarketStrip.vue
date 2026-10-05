<template>
    <dl class="market-strip">
        <div>
            <dt>Market cap</dt>
            <dd>
                {{ formatCompactMoney(inCurrency(global?.market_cap_usd), currency) }}
                <span v-if="Number.isFinite(global?.market_cap_change_24h)" :class="global.market_cap_change_24h >= 0 ? 'up' : 'down'">
                    {{ formatPercent(global.market_cap_change_24h) }}
                </span>
            </dd>
        </div>
        <div>
            <dt>24h volume</dt>
            <dd>{{ formatCompactMoney(inCurrency(global?.volume_24h_usd), currency) }}</dd>
        </div>
        <div>
            <dt>BTC dominance</dt>
            <dd>{{ formatPercent(global?.bitcoin_dominance_percentage, { signed: false }) }}</dd>
        </div>
    </dl>
</template>

<script setup>
import { formatCompactMoney, formatPercent } from '@/lib/format';
import { convert } from '@/lib/portfolio';

const props = defineProps({
    global: { type: Object, default: null },
    currency: { type: String, required: true },
    rates: { type: Object, required: true },
});

// Global figures are only published in USD.
const inCurrency = usd => convert(usd, 'USD', props.currency, props.rates);
</script>

<style scoped>
.market-strip {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    margin: 0 0 14px;
    padding: 0 2px;
}

.market-strip > div {
    display: flex;
    min-width: 0;
    align-items: baseline;
    gap: 6px;
}

dt {
    color: var(--muted);
    font-size: 11px;
}

dd {
    display: flex;
    gap: 5px;
    margin: 0;
    color: var(--text-2);
    font-size: 11px;
    font-variant-numeric: tabular-nums;
    font-weight: 650;
    white-space: nowrap;
}

dd span {
    font-weight: 600;
}
</style>
