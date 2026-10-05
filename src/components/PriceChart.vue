<template>
    <div ref="root" class="price-chart" :class="trend" :style="{ height: `${height}px` }">
        <svg
            v-if="width && coordinates.length > 1"
            :width="width"
            :height="height"
            :viewBox="`0 0 ${width} ${height}`"
            role="img"
            tabindex="0"
            :aria-label="description"
            @pointermove="onPointerMove"
            @pointerleave="activeIndex = null"
            @keydown="onKeydown"
            @blur="activeIndex = null"
        >
            <defs>
                <linearGradient :id="gradientId" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stop-color="currentColor" stop-opacity="0.16" />
                    <stop offset="1" stop-color="currentColor" stop-opacity="0" />
                </linearGradient>
            </defs>
            <path :d="areaPath(coordinates, height)" :fill="`url(#${gradientId})`" />
            <path :d="linePath(coordinates)" class="line" />

            <g v-if="!active" class="extremes">
                <text v-for="mark in extremes" :key="mark.kind" :x="mark.x" :y="mark.y" :text-anchor="mark.anchor">
                    {{ mark.kind === 'high' ? 'High' : 'Low' }} {{ formatPrice(mark.price, currency) }}
                </text>
            </g>

            <template v-if="active">
                <line class="crosshair" :x1="active.x" :x2="active.x" y1="0" :y2="height" />
                <circle class="dot" :cx="active.x" :cy="active.y" r="4" />
            </template>
            <circle v-else class="dot" :cx="lastPoint.x" :cy="lastPoint.y" r="4" />
        </svg>

        <div v-if="active" class="tooltip" :class="{ below: active.y < height / 2 }" :style="{ left: `${tooltipLeft}px` }">
            <strong>{{ formatPrice(points[activeIndex][1], currency) }}</strong>
            <span>{{ formatPointDate(points[activeIndex][0]) }}</span>
        </div>

        <div v-if="!width || coordinates.length < 2" class="state">
            <span v-if="loading" class="shimmer"></span>
            <span v-else-if="error">{{ error }}</span>
            <span v-else>No price history yet.</span>
        </div>
    </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue';

import { areaPath, linePath, nearestIndex, scalePoints } from '@/lib/chart';
import { formatDate, formatPrice } from '@/lib/format';

const props = defineProps({
    /** `[timestamp, price]` pairs in the display currency, oldest first. */
    points: { type: Array, required: true },
    currency: { type: String, required: true },
    range: { type: String, required: true },
    loading: { type: Boolean, default: false },
    error: { type: String, default: '' },
    height: { type: Number, default: 176 },
});
const emit = defineEmits(['hover']);

const INSET_X = 6;
const INSET_Y = 22;
const TOOLTIP_HALF_WIDTH = 64;

const root = ref(null);
const width = ref(0);
const activeIndex = ref(null);
const gradientId = `chart-${useId()}`;
let resizeObserver;

const coordinates = computed(() => scalePoints(props.points.map(([, price]) => price), {
    width: width.value,
    height: props.height,
    insetX: INSET_X,
    insetY: INSET_Y,
    xs: props.points.map(([time]) => time),
}));
const lastPoint = computed(() => coordinates.value[coordinates.value.length - 1]);
const active = computed(() => (activeIndex.value === null ? null : coordinates.value[activeIndex.value] ?? null));
const tooltipLeft = computed(() => Math.min(
    Math.max(active.value.x, TOOLTIP_HALF_WIDTH),
    width.value - TOOLTIP_HALF_WIDTH,
));

const trend = computed(() => {
    const { points } = props;
    if (points.length < 2) return 'flat';
    return points[points.length - 1][1] >= points[0][1] ? 'up' : 'down';
});

// Label only the extremes; the hover layer carries every other value.
const extremes = computed(() => {
    const { points } = props;
    if (points.length < 3) return [];
    let high = 0;
    let low = 0;
    points.forEach(([, price], index) => {
        if (price > points[high][1]) high = index;
        if (price < points[low][1]) low = index;
    });
    const place = (index, kind) => {
        const { x, y } = coordinates.value[index];
        const anchor = x < width.value * 0.2 ? 'start' : x > width.value * 0.8 ? 'end' : 'middle';
        return { kind, price: points[index][1], x, y: kind === 'high' ? y - 9 : y + 16, anchor };
    };
    return high === low ? [] : [place(high, 'high'), place(low, 'low')];
});

const description = computed(() => {
    const { points } = props;
    if (points.length < 2) return 'Price chart';
    const [first, last] = [points[0][1], points[points.length - 1][1]];
    return `Price over ${props.range}, from ${formatPrice(first, props.currency)} to ${formatPrice(last, props.currency)}. `
        + 'Use the arrow keys to read individual prices.';
});

function formatPointDate(time) {
    if (activeIndex.value === props.points.length - 1) return 'Now';
    return props.range === '24h'
        ? formatDate(time, { weekday: 'short', hour: 'numeric', minute: '2-digit' })
        : formatDate(time, { day: 'numeric', month: 'short', year: 'numeric' });
}

function onPointerMove(event) {
    const bounds = event.currentTarget.getBoundingClientRect();
    activeIndex.value = nearestIndex(coordinates.value, event.clientX - bounds.left);
}

function onKeydown(event) {
    const last = props.points.length - 1;
    const current = activeIndex.value ?? last;
    const moves = { ArrowLeft: current - 1, ArrowRight: current + 1, Home: 0, End: last };
    if (event.key === 'Escape') {
        activeIndex.value = null;
        return;
    }
    if (!(event.key in moves)) return;
    event.preventDefault();
    activeIndex.value = Math.min(Math.max(moves[event.key], 0), last);
}

watch(activeIndex, index => emit('hover', index === null ? null : props.points[index]));
watch(() => props.points, () => {
    activeIndex.value = null;
});

onMounted(() => {
    resizeObserver = new ResizeObserver(([entry]) => {
        width.value = Math.round(entry.contentRect.width);
    });
    resizeObserver.observe(root.value);
});

onBeforeUnmount(() => resizeObserver?.disconnect());
</script>

<style scoped>
.price-chart {
    position: relative;
    width: 100%;
}

svg {
    display: block;
    overflow: visible;
    outline: none;
    touch-action: pan-y;
}

svg:focus-visible {
    border-radius: 8px;
    box-shadow: 0 0 0 2px var(--accent-soft);
}

.flat {
    color: var(--muted);
}

.line {
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 2;
}

.extremes text {
    fill: var(--muted);
    font-size: 10px;
    font-variant-numeric: tabular-nums;
    font-weight: 550;
}

.crosshair {
    stroke: var(--line-strong);
    stroke-width: 1;
}

.dot {
    fill: currentColor;
    stroke: var(--bg);
    stroke-width: 2;
}

/* Sits in the half of the plot away from the hovered point, so it never covers it. */
.tooltip {
    position: absolute;
    top: 0;
    display: grid;
    min-width: 112px;
    gap: 1px;
    padding: 6px 9px;
    border: 1px solid var(--line-strong);
    border-radius: 8px;
    background: var(--overlay);
    box-shadow: var(--shadow);
    pointer-events: none;
    text-align: center;
    transform: translateX(-50%);
}

.tooltip.below {
    top: auto;
    bottom: 0;
}

.tooltip strong {
    font-size: 12px;
    font-variant-numeric: tabular-nums;
}

.tooltip span {
    color: var(--muted);
    font-size: 10px;
}

.state {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    color: var(--muted);
    font-size: 12px;
}

.shimmer {
    width: 100%;
    height: 60%;
    border-radius: 10px;
    background: linear-gradient(90deg, var(--surface) 0%, var(--surface-2) 50%, var(--surface) 100%);
    background-size: 200% 100%;
    animation: shimmer 1.4s ease-in-out infinite;
}

@keyframes shimmer {
    from {
        background-position: 100% 0;
    }

    to {
        background-position: -100% 0;
    }
}
</style>
