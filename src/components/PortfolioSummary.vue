<template>
    <section class="summary" aria-label="Portfolio summary">
        <div class="figures">
            <div>
                <p class="eyebrow">Portfolio value</p>
                <div class="balance">{{ !priced ? '—' : privacy ? MASK : formatMoney(summary.value, currency) }}</div>
                <div v-if="priced" class="delta" :class="tone(summary.change)">
                    <AppIcon :name="summary.change >= 0 ? 'arrowUp' : 'arrowDown'" :size="12" :stroke-width="2.5" />
                    <span v-if="!privacy">{{ formatMoney(Math.abs(summary.change), currency) }}</span>
                    <span>({{ formatPercent(summary.changePercent) }})</span>
                    <span class="muted">{{ PERIOD_LABELS[period] }}</span>
                </div>
                <div v-else class="delta muted">Waiting for prices…</div>
            </div>
            <div v-if="summary.profit !== null" class="profit">
                <p class="eyebrow">Profit / loss</p>
                <strong :class="tone(summary.profit)">{{ privacy ? MASK : formatMoney(summary.profit, currency, { signed: true }) }}</strong>
                <span :class="tone(summary.profit)">{{ formatPercent(summary.profitPercent) }}</span>
            </div>
        </div>

        <div v-if="allocation.length" class="allocation">
            <div class="bar" role="img" :aria-label="allocationLabel">
                <span
                    v-for="slice in allocation"
                    :key="slice.key"
                    :style="{ flexGrow: slice.share, background: slotColor(slice) }"
                ></span>
            </div>
            <ul class="legend">
                <li v-for="slice in allocation" :key="slice.key">
                    <i :style="{ background: slotColor(slice) }"></i>
                    {{ slice.symbol }}
                    <span>{{ formatShare(slice.share) }}</span>
                </li>
            </ul>
        </div>
    </section>
</template>

<script setup>
import { computed } from 'vue';

import AppIcon from '@/components/AppIcon.vue';
import { formatMoney, formatPercent, MASK } from '@/lib/format';

const props = defineProps({
    summary: { type: Object, required: true },
    allocation: { type: Array, required: true },
    currency: { type: String, required: true },
    period: { type: String, required: true },
    privacy: { type: Boolean, default: false },
});
const PERIOD_LABELS = { '1h': 'past hour', '24h': 'past 24h', '7d': 'past 7 days' };

// Holdings are known before prices load; until then there is no value to show.
const priced = computed(() => props.summary.holdings > 0);
const tone = value => (value >= 0 ? 'up' : 'down');
const slotColor = slice => `var(--slot-${slice.slot ?? 'other'})`;
const formatShare = share => `${share < 1 ? share.toFixed(1) : Math.round(share)}%`;

const allocationLabel = computed(() => `Allocation: ${props.allocation
    .map(slice => `${slice.symbol} ${formatShare(slice.share)}`)
    .join(', ')}`);
</script>

<style scoped>
.summary {
    position: relative;
    overflow: hidden;
    margin: 14px 0 12px;
    padding: 15px 17px 14px;
    border: 1px solid var(--hero-line);
    border-radius: var(--radius-l);
    background:
        radial-gradient(ellipse at 100% -20%, var(--hero-glow), transparent 55%),
        linear-gradient(125deg, var(--hero-from), var(--hero-to));
}

.figures {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
}

.balance {
    margin: 6px 0 7px;
    font-size: 30px;
    font-weight: 720;
    letter-spacing: -0.03em;
    line-height: 1.05;
}

.delta {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    font-weight: 600;
}

.delta .muted {
    font-weight: 500;
}

.profit {
    display: grid;
    justify-items: end;
    gap: 3px;
    text-align: right;
}

.profit strong {
    margin-top: 4px;
    font-size: 15px;
    font-variant-numeric: tabular-nums;
}

.profit span {
    font-size: 11px;
    font-weight: 600;
}

.allocation {
    margin-top: 14px;
}

.bar {
    display: flex;
    overflow: hidden;
    height: 6px;
    gap: 2px;
    border-radius: 4px;
}

.bar span {
    min-width: 3px;
    flex-basis: 0;
}

.legend {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 14px;
    padding: 0;
    margin: 9px 0 0;
    color: var(--text-2);
    font-size: 11px;
    font-weight: 600;
    list-style: none;
}

.legend li {
    display: inline-flex;
    align-items: center;
    gap: 5px;
}

.legend i {
    width: 8px;
    height: 8px;
    border-radius: 2px;
}

.legend span {
    color: var(--muted);
    font-variant-numeric: tabular-nums;
    font-weight: 500;
}

</style>
