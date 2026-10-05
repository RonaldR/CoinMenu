<template>
    <span class="coin-logo" :style="{ '--size': `${size}px`, '--hue': hue }" aria-hidden="true">
        <img v-if="id && !failed" :src="logoUrl(id)" alt="" loading="lazy" draggable="false" @error="failed = true">
        <span v-else class="monogram">{{ symbol.slice(0, 1) }}</span>
    </span>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

import { logoUrl } from '@/services/coinpaprika';

const props = defineProps({
    id: { type: String, default: null },
    symbol: { type: String, required: true },
    size: { type: Number, default: 24 },
});

const failed = ref(false);
watch(() => props.id, () => {
    failed.value = false;
});

// Coins without a logo get a monogram in a hue derived from their symbol, so it stays stable.
const hue = computed(() => [...props.symbol].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) % 360, 7));
</script>

<style scoped>
.coin-logo {
    display: inline-grid;
    overflow: hidden;
    width: var(--size);
    height: var(--size);
    flex: 0 0 var(--size);
    place-items: center;
    border-radius: 50%;
    background: var(--surface-2);
}

img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.monogram {
    display: grid;
    width: 100%;
    height: 100%;
    place-items: center;
    background: hsl(var(--hue) 55% 45%);
    color: #ffffff;
    font-size: calc(var(--size) * 0.45);
    font-weight: 700;
}
</style>
