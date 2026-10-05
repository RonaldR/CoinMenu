<template>
    <svg
        class="sparkline"
        :class="trend"
        :width="width"
        :height="height"
        :viewBox="`0 0 ${width} ${height}`"
        role="img"
        :aria-label="label"
    >
        <defs>
            <linearGradient :id="gradientId" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stop-color="currentColor" stop-opacity="0.22" />
                <stop offset="1" stop-color="currentColor" stop-opacity="0" />
            </linearGradient>
        </defs>
        <template v-if="coordinates.length > 1">
            <path :d="areaPath(coordinates, height)" :fill="`url(#${gradientId})`" />
            <path :d="linePath(coordinates)" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </template>
        <line v-else x1="2" :x2="width - 2" :y1="height / 2" :y2="height / 2" class="placeholder" />
    </svg>
</template>

<script setup>
import { computed, useId } from 'vue';

import { areaPath, linePath, scalePoints } from '@/lib/chart';

const props = defineProps({
    points: { type: Array, default: () => [] },
    width: { type: Number, default: 64 },
    height: { type: Number, default: 24 },
    label: { type: String, default: 'Price trend' },
    /** Overrides the color the curve itself implies, e.g. to match an authoritative % change. */
    direction: { type: String, default: null, validator: value => ['up', 'down'].includes(value) },
});

const gradientId = `spark-${useId()}`;
const coordinates = computed(() => scalePoints(props.points, {
    width: props.width,
    height: props.height,
    insetX: 1,
    insetY: 2,
}));
const trend = computed(() => {
    if (props.points.length < 2) return 'flat';
    if (props.direction) return props.direction;
    return props.points[props.points.length - 1] >= props.points[0] ? 'up' : 'down';
});
</script>

<style scoped>
.sparkline {
    display: block;
    overflow: visible;
}

.flat {
    color: var(--faint);
}

.placeholder {
    stroke: var(--line-strong);
    stroke-width: 1;
}
</style>
