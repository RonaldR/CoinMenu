<template>
    <footer class="footer">
        <span class="status" :class="status.tone" role="status">
            <i></i>{{ status.text }}
        </span>
        <a href="https://coinpaprika.com" @click.prevent="openExternal('https://coinpaprika.com')">
            Prices by CoinPaprika
            <AppIcon name="external" :size="10" />
        </a>
    </footer>
</template>

<script setup>
import { computed } from 'vue';

import AppIcon from '@/components/AppIcon.vue';
import { useNow } from '@/composables/useNow';
import { formatRelativeTime } from '@/lib/format';
import { openExternal } from '@/lib/platform';
import { market } from '@/stores/market';

const now = useNow();

const status = computed(() => {
    if (market.loading) return { tone: 'busy', text: 'Updating prices…' };
    if (market.error && market.updatedAt) {
        return { tone: 'stale', text: `Offline · prices from ${formatRelativeTime(market.updatedAt, now.value)}` };
    }
    if (market.error) return { tone: 'stale', text: 'Prices unavailable' };
    if (market.updatedAt) return { tone: 'live', text: `Updated ${formatRelativeTime(market.updatedAt, now.value)}` };
    return { tone: 'busy', text: 'Waiting for prices…' };
});
</script>

<style scoped>
.footer {
    display: flex;
    min-height: 40px;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-top: 8px;
    border-top: 1px solid var(--line);
    color: var(--faint);
    font-size: 10px;
}

.status {
    display: inline-flex;
    align-items: center;
    gap: 7px;
}

.status i {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--up);
}

.status.live i {
    box-shadow: 0 0 0 3px var(--up-soft);
}

.status.busy i {
    background: var(--warning);
    animation: pulse 1s ease-in-out infinite alternate;
}

.status.stale i {
    background: var(--down);
}

a {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    transition: color 0.15s;
}

a:hover {
    color: var(--text-2);
}

@keyframes pulse {
    to {
        opacity: 0.35;
    }
}
</style>
