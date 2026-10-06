<template>
    <table class="coin-table">
        <thead>
            <tr>
                <th
                    v-for="column in columns"
                    :key="column.key"
                    :class="column.className"
                    :aria-sort="column.sort && sortKey === column.sort ? (sortDirection === 'asc' ? 'ascending' : 'descending') : undefined"
                >
                    <button
                        v-if="column.sort && !editing"
                        type="button"
                        class="sort"
                        :class="{ active: sortKey === column.sort }"
                        :title="`Sort by ${column.title}`"
                        @click="toggleSort(column.sort)"
                    >
                        {{ column.label }}
                        <AppIcon
                            v-if="sortKey === column.sort"
                            :name="sortDirection === 'asc' ? 'arrowUp' : 'arrowDown'"
                            :size="10"
                            :stroke-width="2.5"
                        />
                    </button>
                    <template v-else>{{ column.label }}</template>
                </th>
            </tr>
        </thead>
        <TransitionGroup tag="tbody" name="rows" @dragover="onDragOver" @drop="onDrop">
            <CoinRow
                v-for="(entry, index) in entries"
                :key="coinKey(entry.coin)"
                :data-index="index"
                :class="{ 'drop-before': dropIndex === index && dragIndex > index, 'drop-after': dropIndex === index && dragIndex < index }"
                :coin="entry.coin"
                :ticker="entry.ticker"
                :currency="currency"
                :period="period"
                :editing="editing"
                :reorderable="reorderable"
                :privacy="privacy"
                @dragstart="onDragStart(index, $event)"
                @dragend="resetDrag"
                @remove="emit('remove', $event)"
            />
            <tr v-if="!entries.length" key="empty" class="empty">
                <td :colspan="columns.length"><slot name="empty"></slot></td>
            </tr>
        </TransitionGroup>
    </table>
</template>

<script setup>
import { computed, ref } from 'vue';

import AppIcon from '@/components/AppIcon.vue';
import CoinRow from '@/components/CoinRow.vue';
import { toggleSort } from '@/stores/settings';
import { coinKey, moveCoin } from '@/stores/watchlist';

const props = defineProps({
    entries: { type: Array, required: true },
    currency: { type: String, required: true },
    period: { type: String, required: true },
    sortKey: { type: String, default: null },
    sortDirection: { type: String, default: 'asc' },
    editing: { type: Boolean, default: false },
    /** Dragging only makes sense while the list shows the user's own, unfiltered order. */
    reorderable: { type: Boolean, default: false },
    privacy: { type: Boolean, default: false },
});
const emit = defineEmits(['remove']);

const columns = computed(() => [
    { key: 'coin', label: 'Coin', title: 'market cap rank', sort: 'rank', className: 'col-coin' },
    { key: 'chart', label: props.period === '7d' ? '7D' : '24H', className: 'col-chart' },
    { key: 'holding', label: 'Holdings', title: 'value of your holdings', sort: 'value', className: 'col-holding' },
    { key: 'price', label: 'Price', title: 'price', sort: 'price', className: 'col-price' },
    { key: 'change', label: props.period, title: `${props.period} change`, sort: 'change', className: 'col-change' },
]);

const dragIndex = ref(null);
const dropIndex = ref(null);

function onDragStart(index, event) {
    // Images, links and selected text start native drags too; only the row (via its grip) counts.
    if (!props.reorderable || !event.target.matches?.('tr')) return;
    dragIndex.value = index;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(index));
}

function onDragOver(event) {
    if (dragIndex.value === null) return;
    const row = event.target.closest?.('tr[data-index]');
    if (!row) return;
    event.preventDefault();
    dropIndex.value = Number(row.dataset.index);
}

function onDrop(event) {
    event.preventDefault();
    if (dragIndex.value !== null && dropIndex.value !== null) moveCoin(dragIndex.value, dropIndex.value);
    resetDrag();
}

function resetDrag() {
    dragIndex.value = null;
    dropIndex.value = null;
}
</script>

<style scoped>
.coin-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
}

th {
    height: 30px;
    padding: 0 5px;
    color: var(--faint);
    font-size: 10px;
    font-weight: 650;
    letter-spacing: 0.06em;
    text-align: left;
    text-transform: uppercase;
}

th:first-child {
    padding-left: 4px;
}

th:last-child {
    padding-right: 4px;
}

.col-coin {
    width: 31%;
}

.col-chart {
    width: 15%;
    text-align: center;
}

.col-holding {
    width: 19%;
}

.col-price {
    width: 19%;
}

.col-change {
    width: 16%;
}

.col-holding,
.col-price,
.col-change {
    text-align: right;
}

/*
 * Phones drop the sparkline and size the figures to their content instead of a fixed share,
 * so amounts never run into each other; the coin column gets whatever is left.
 */
@media (max-width: 480px) {
    .coin-table {
        table-layout: auto;
    }

    .col-chart {
        display: none;
    }

    .col-coin {
        width: 100%;
    }

    .col-holding,
    .col-price,
    .col-change {
        width: auto;
    }
}

.sort {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 0;
    border: 0;
    background: none;
    color: inherit;
    font: inherit;
    letter-spacing: inherit;
    text-transform: inherit;
}

.sort:hover,
.sort.active {
    color: var(--text-2);
}

.empty td {
    padding: 28px 12px;
    border-top: 1px solid var(--line);
    color: var(--muted);
    text-align: center;
}

.drop-before :deep(td) {
    box-shadow: inset 0 2px 0 var(--accent);
}

.drop-after :deep(td) {
    box-shadow: inset 0 -2px 0 var(--accent);
}

.rows-move {
    transition: transform 0.35s var(--ease);
}
</style>
