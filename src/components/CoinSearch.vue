<template>
    <div class="coin-search" @keydown="onKeydown">
        <div class="search-field">
            <AppIcon name="search" :size="14" />
            <input
                ref="input"
                v-model="query"
                type="search"
                autocomplete="off"
                spellcheck="false"
                placeholder="Search by name or symbol, e.g. Solana or SOL"
                aria-label="Search coins to add"
                role="combobox"
                aria-autocomplete="list"
                :aria-expanded="showResults"
                aria-controls="coin-search-results"
                :aria-activedescendant="activeOptionId"
            >
            <AppIcon v-if="searching" name="refresh" :size="13" class="spin muted" />
            <button type="button" class="icon-button small" aria-label="Close search" @click="emit('close')">
                <AppIcon name="x" :size="14" />
            </button>
        </div>

        <ul v-if="showResults" id="coin-search-results" class="results" role="listbox" aria-label="Search results">
            <li
                v-for="(coin, index) in results"
                :id="`coin-option-${index}`"
                :key="coin.id"
                role="option"
                :aria-selected="index === activeIndex"
                :aria-disabled="isAdded(coin)"
                :class="{ active: index === activeIndex, added: isAdded(coin) }"
                @mousemove="activeIndex = index"
                @click="choose(coin)"
            >
                <CoinLogo :id="coin.id" :symbol="coin.symbol" :size="20" />
                <span class="name">{{ coin.name }}</span>
                <span class="symbol">{{ coin.symbol }}</span>
                <span class="meta">
                    <template v-if="isAdded(coin)"><AppIcon name="check" :size="12" /> Added</template>
                    <template v-else-if="coin.rank">#{{ coin.rank }}</template>
                </span>
            </li>
            <li v-if="!results.length" class="note">
                {{ searching ? 'Searching…' : error || 'No coins found.' }}
            </li>
        </ul>
    </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';

import AppIcon from '@/components/AppIcon.vue';
import CoinLogo from '@/components/CoinLogo.vue';
import { searchCoins } from '@/services/coinpaprika';
import { searchTickers } from '@/stores/market';
import { findCoin } from '@/stores/watchlist';

const emit = defineEmits(['select', 'close']);

const MAX_RESULTS = 12;
// With this many local matches the coin is almost certainly among them: skip the API call.
const ENOUGH_LOCAL_MATCHES = 6;

const input = ref(null);
const query = ref('');
const remoteResults = ref([]);
const searching = ref(false);
const error = ref('');
const activeIndex = ref(0);

const localResults = computed(() => searchTickers(query.value, MAX_RESULTS));
const results = computed(() => {
    const seen = new Set(localResults.value.map(coin => coin.id));
    const extra = remoteResults.value.filter(coin => !seen.has(coin.id));
    return [...localResults.value, ...extra].slice(0, MAX_RESULTS);
});
const showResults = computed(() => query.value.trim().length > 0);
const activeOptionId = computed(() => (results.value.length ? `coin-option-${activeIndex.value}` : undefined));

const isAdded = coin => Boolean(findCoin(coin.id));

watch(query, (value, _previous, onCleanup) => {
    remoteResults.value = [];
    error.value = '';
    searching.value = false;
    const text = value.trim();
    if (text.length < 2 || localResults.value.length >= ENOUGH_LOCAL_MATCHES) return;

    searching.value = true;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
        try {
            remoteResults.value = await searchCoins(text, { signal: controller.signal });
        } catch (requestError) {
            if (requestError.name !== 'AbortError') error.value = requestError.message;
        } finally {
            if (!controller.signal.aborted) searching.value = false;
        }
    }, 350);
    onCleanup(() => {
        clearTimeout(timer);
        controller.abort();
    });
});

watch(results, () => {
    activeIndex.value = Math.max(0, results.value.findIndex(coin => !isAdded(coin)));
});

function choose(coin) {
    if (!coin || isAdded(coin)) return;
    emit('select', coin);
    query.value = '';
    input.value?.focus();
}

function onKeydown(event) {
    const count = results.value.length;
    if (event.key === 'ArrowDown' && count) {
        activeIndex.value = (activeIndex.value + 1) % count;
    } else if (event.key === 'ArrowUp' && count) {
        activeIndex.value = (activeIndex.value - 1 + count) % count;
    } else if (event.key === 'Enter') {
        choose(results.value[activeIndex.value]);
    } else if (event.key === 'Escape') {
        if (query.value) query.value = '';
        else emit('close');
    } else {
        return;
    }
    event.preventDefault();
}

onMounted(() => input.value?.focus());
</script>

<style scoped>
.coin-search {
    position: relative;
    margin-bottom: 10px;
}

.search-field {
    display: flex;
    height: 38px;
    align-items: center;
    gap: 8px;
    padding: 0 6px 0 11px;
    border: 1px solid color-mix(in srgb, var(--accent) 45%, transparent);
    border-radius: var(--radius);
    background: var(--surface);
    box-shadow: 0 0 0 3px var(--accent-soft);
    color: var(--muted);
}

input {
    flex: 1;
    min-width: 0;
    border: 0;
    outline: none;
    background: transparent;
    color: var(--text);
    font-size: var(--field-size);
}

input::placeholder {
    color: var(--faint);
}

input::-webkit-search-cancel-button {
    display: none;
}

.results {
    position: absolute;
    z-index: 20;
    top: calc(100% + 6px);
    right: 0;
    left: 0;
    overflow: auto;
    max-height: 264px;
    padding: 4px;
    margin: 0;
    border: 1px solid var(--line-strong);
    border-radius: var(--radius);
    background: var(--overlay);
    box-shadow: var(--shadow);
    list-style: none;
}

li[role="option"] {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 7px 8px;
    border-radius: 7px;
    cursor: pointer;
}

li.active {
    background: var(--surface-2);
}

li.added {
    cursor: default;
    opacity: 0.6;
}

.name {
    overflow: hidden;
    font-size: 12px;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.symbol {
    color: var(--muted);
    font-size: 11px;
}

.meta {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-left: auto;
    color: var(--muted);
    font-size: 11px;
}

.note {
    padding: 14px 8px;
    color: var(--muted);
    font-size: 12px;
    text-align: center;
}
</style>
