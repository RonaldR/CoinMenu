<template>
    <main class="view home">
        <header class="topbar">
            <div class="brand">
                <img src="@/assets/logo.svg" alt="">
                <span>CoinMenu</span>
            </div>
            <div class="toolbar">
                <button
                    type="button"
                    class="icon-button"
                    :class="{ active: settings.privacy }"
                    :aria-pressed="settings.privacy"
                    aria-label="Hide balances"
                    title="Hide balances (P)"
                    @click="settings.privacy = !settings.privacy"
                >
                    <AppIcon :name="settings.privacy ? 'eyeOff' : 'eye'" :size="15" />
                </button>
                <SegmentedControl v-model="settings.currency" :options="CURRENCIES" label="Display currency" />
                <button
                    type="button"
                    class="icon-button"
                    aria-label="Refresh prices"
                    title="Refresh prices (R)"
                    :disabled="market.loading"
                    @click="refreshNow"
                >
                    <AppIcon name="refresh" :size="15" :class="{ spin: market.loading }" />
                </button>
                <RouterLink to="/settings" class="icon-button" aria-label="Settings" title="Settings">
                    <AppIcon name="settings" :size="15" />
                </RouterLink>
            </div>
        </header>

        <div v-if="market.error" class="banner" role="alert">
            <span>{{ market.error }}</span>
            <button type="button" :disabled="market.loading" @click="refreshNow">Try again</button>
        </div>

        <PortfolioSummary
            v-if="hasHoldings"
            :summary="summary"
            :allocation="allocation"
            :currency="settings.currency"
            :period="settings.period"
            :privacy="settings.privacy"
        />

        <MarketStrip :global="market.global" :currency="settings.currency" :rates="rates" />

        <section aria-labelledby="watchlist-title">
            <div class="list-head">
                <h2 id="watchlist-title">Watchlist <span>{{ coins.length }}</span></h2>
                <div class="toolbar list-tools">
                    <label class="filter">
                        <AppIcon name="search" :size="13" />
                        <input
                            ref="filterInput"
                            v-model="filter"
                            type="search"
                            placeholder="Filter"
                            aria-label="Filter watchlist"
                            @keydown.esc.prevent="filter = ''; filterInput.blur()"
                        >
                    </label>
                    <SegmentedControl v-model="settings.period" :options="PERIOD_OPTIONS" label="Change period" small />
                </div>
                <div class="toolbar list-actions">
                    <button
                        type="button"
                        class="icon-button"
                        :class="{ active: editing }"
                        :aria-pressed="editing"
                        :aria-label="editing ? 'Done editing' : 'Edit watchlist'"
                        :title="editing ? 'Done (E)' : 'Edit holdings and order (E)'"
                        @click="editing = !editing"
                    >
                        <AppIcon :name="editing ? 'check' : 'pencil'" :size="14" />
                    </button>
                    <button
                        type="button"
                        class="icon-button"
                        :class="{ active: adding }"
                        :aria-expanded="adding"
                        aria-label="Add coin"
                        title="Add coin (N)"
                        @click="adding = !adding"
                    >
                        <AppIcon name="plus" :size="15" />
                    </button>
                </div>
            </div>

            <CoinSearch v-if="adding" @select="onAddCoin" @close="adding = false" />
            <p v-if="editing" class="edit-hint">
                Type the amount you hold of each coin{{ reorderable ? ', drag rows to reorder' : '' }}.
                Add a buy price on a coin's page to track profit.
            </p>

            <CoinTable
                :entries="visibleEntries"
                :currency="settings.currency"
                :period="settings.period"
                :sort-key="settings.sortKey"
                :sort-direction="settings.sortDirection"
                :editing="editing"
                :reorderable="reorderable"
                :privacy="settings.privacy"
                @remove="onRemoveCoin"
            >
                <template #empty>
                    <template v-if="filter">No coins match “{{ filter }}”.</template>
                    <template v-else-if="!market.updatedAt && market.loading">Loading market data…</template>
                    <template v-else>
                        Your watchlist is empty.
                        <button type="button" class="link" @click="adding = true">Add a coin</button>
                    </template>
                </template>
            </CoinTable>
        </section>

        <PortfolioIntro v-if="!hasHoldings && coins.length && !editing" @add-holdings="startEditingHoldings" />

        <AppFooter />

        <Transition name="toast">
            <div v-if="undo" class="toast" role="status">
                Removed {{ undo.coin.name }}
                <button type="button" @click="undoRemove">Undo</button>
            </div>
        </Transition>
    </main>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref } from 'vue';
import { useRouter } from 'vue-router';

import AppFooter from '@/components/AppFooter.vue';
import AppIcon from '@/components/AppIcon.vue';
import CoinSearch from '@/components/CoinSearch.vue';
import CoinTable from '@/components/CoinTable.vue';
import MarketStrip from '@/components/MarketStrip.vue';
import PortfolioIntro from '@/components/PortfolioIntro.vue';
import PortfolioSummary from '@/components/PortfolioSummary.vue';
import SegmentedControl from '@/components/SegmentedControl.vue';
import { useHotkeys } from '@/composables/useHotkeys';
import { ensureTicker, market, rates, refreshNow } from '@/stores/market';
import { allocation, hasHoldings, sortedEntries, summary } from '@/stores/portfolio';
import { CURRENCIES, PERIODS, settings } from '@/stores/settings';
import { addCoin, coins, insertCoin, removeCoin } from '@/stores/watchlist';

const PERIOD_OPTIONS = PERIODS.map(period => ({ value: period, label: period.toUpperCase() }));
const UNDO_TIMEOUT = 6000;

const router = useRouter();
const filterInput = ref(null);
const filter = ref('');
const editing = ref(false);
const adding = ref(false);
const undo = ref(null);
let undoTimer;

const visibleEntries = computed(() => {
    const query = filter.value.trim().toLowerCase();
    if (!query) return sortedEntries.value;
    return sortedEntries.value.filter(({ coin }) => (
        coin.name.toLowerCase().includes(query) || coin.symbol.toLowerCase().includes(query)
    ));
});
const reorderable = computed(() => editing.value && !settings.sortKey && !filter.value.trim());

function onAddCoin(coin) {
    if (addCoin(coin)) ensureTicker(coin.id);
}

function onRemoveCoin(coin) {
    const index = removeCoin(coin);
    clearTimeout(undoTimer);
    undo.value = { coin: { ...coin }, index };
    undoTimer = setTimeout(() => {
        undo.value = null;
    }, UNDO_TIMEOUT);
}

function undoRemove() {
    insertCoin(undo.value.coin, undo.value.index);
    clearTimeout(undoTimer);
    undo.value = null;
}

async function startEditingHoldings() {
    editing.value = true;
    await nextTick();
    document.querySelector('.holding-input')?.focus();
}

useHotkeys({
    '/': () => filterInput.value.focus(),
    n: () => {
        adding.value = true;
    },
    e: () => {
        editing.value = !editing.value;
    },
    r: () => refreshNow(),
    p: () => {
        settings.privacy = !settings.privacy;
    },
    c: () => {
        settings.currency = CURRENCIES[(CURRENCIES.indexOf(settings.currency) + 1) % CURRENCIES.length];
    },
    1: () => {
        settings.period = '1h';
    },
    2: () => {
        settings.period = '24h';
    },
    3: () => {
        settings.period = '7d';
    },
    'mod+,': () => router.push('/settings'),
    escape: () => {
        if (adding.value) adding.value = false;
        else if (editing.value) editing.value = false;
        else filter.value = '';
    },
});

onBeforeUnmount(() => clearTimeout(undoTimer));
</script>

<style scoped>
.brand {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: -0.01em;
}

.brand img {
    width: 18px;
    height: 25px;
}

.banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: 12px;
    padding: 8px 8px 8px 12px;
    border: 1px solid color-mix(in srgb, var(--down) 30%, transparent);
    border-radius: var(--radius);
    background: var(--down-soft);
    color: var(--text-2);
    font-size: 12px;
}

.banner button,
.link {
    padding: 4px 6px;
    border: 0;
    background: none;
    color: var(--accent);
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
}

.list-head {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto auto;
    align-items: center;
    gap: 6px;
    margin-bottom: 8px;
}

h2 {
    margin: 0;
    font-size: 14px;
    font-weight: 700;
    white-space: nowrap;
}

h2 span {
    margin-left: 2px;
    color: var(--faint);
    font-weight: 600;
}

.filter {
    display: flex;
    width: 110px;
    height: 30px;
    align-items: center;
    gap: 6px;
    padding: 0 9px;
    border: 1px solid var(--line);
    border-radius: 8px;
    background: var(--surface);
    color: var(--faint);
    transition: border-color 0.15s, box-shadow 0.15s, width 0.2s var(--ease);
}

.filter:focus-within {
    width: 140px;
    border-color: color-mix(in srgb, var(--accent) 55%, transparent);
    box-shadow: 0 0 0 3px var(--accent-soft);
}

.filter input {
    width: 100%;
    min-width: 0;
    border: 0;
    outline: none;
    background: none;
    color: var(--text);
    font-size: var(--field-size);
}

.filter input::placeholder {
    color: var(--faint);
}

/* Phones: title and buttons on top, a full-width filter with the period underneath. */
@media (max-width: 480px) {
    .list-head {
        grid-template-areas:
            "title actions"
            "tools tools";
        grid-template-columns: minmax(0, 1fr) auto;
        row-gap: 10px;
    }

    h2 {
        grid-area: title;
    }

    .list-actions {
        grid-area: actions;
    }

    .list-tools {
        grid-area: tools;
    }

    .filter,
    .filter:focus-within {
        width: auto;
        flex: 1;
    }
}

.edit-hint {
    margin: 0 0 8px;
    padding: 8px 11px;
    border-radius: var(--radius);
    background: var(--accent-soft);
    color: var(--text-2);
    font-size: 11px;
    line-height: 1.45;
}

.toast {
    position: fixed;
    z-index: 30;
    bottom: 16px;
    left: 50%;
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 8px 8px 8px 14px;
    border: 1px solid var(--line-strong);
    border-radius: 10px;
    background: var(--overlay);
    box-shadow: var(--shadow);
    font-size: 12px;
    transform: translateX(-50%);
}

.toast button {
    padding: 4px 9px;
    border: 0;
    border-radius: 6px;
    background: var(--accent-soft);
    color: var(--accent);
    font-size: 12px;
    font-weight: 650;
}

.toast-enter-active,
.toast-leave-active {
    transition: opacity 0.2s, transform 0.2s var(--ease);
}

.toast-enter-from,
.toast-leave-to {
    opacity: 0;
    transform: translate(-50%, 8px);
}
</style>
