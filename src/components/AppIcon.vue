<template>
    <svg
        class="app-icon"
        :width="size"
        :height="size"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        :stroke-width="strokeWidth"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
    >
        <path v-for="(path, index) in ICONS[name]" :key="index" :d="path" />
    </svg>
</template>

<script>
// Path data adapted from Lucide (ISC licence), trimmed to the icons CoinMenu uses.
const ICONS = {
    plus: ['M5 12h14', 'M12 5v14'],
    x: ['M18 6 6 18', 'm6 6 12 12'],
    check: ['M20 6 9 17l-5-5'],
    back: ['m15 18-6-6 6-6'],
    refresh: ['M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8', 'M21 3v5h-5'],
    settings: ['M20 7h-9', 'M14 17H5', 'M17 14a3 3 0 1 0 0 6 3 3 0 1 0 0-6', 'M7 4a3 3 0 1 0 0 6 3 3 0 1 0 0-6'],
    eye: ['M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z', 'M12 9a3 3 0 1 0 0 6 3 3 0 1 0 0-6'],
    eyeOff: [
        'M10.73 5.08A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a13.2 13.2 0 0 1-1.67 2.68',
        'M6.61 6.61A13.5 13.5 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.39-1.61',
        'M14.12 14.12a3 3 0 1 1-4.24-4.24',
        'm2 2 20 20',
    ],
    search: ['M11 4a7 7 0 1 0 0 14 7 7 0 1 0 0-14', 'm20 20-3.5-3.5'],
    pencil: ['M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z'],
    trash: ['M3 6h18', 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6', 'M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'],
    grip: ['M9 6h.01', 'M15 6h.01', 'M9 12h.01', 'M15 12h.01', 'M9 18h.01', 'M15 18h.01'],
    bell: ['M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9', 'M10.3 21a1.94 1.94 0 0 0 3.4 0'],
    external: ['M15 3h6v6', 'M10 14 21 3', 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6'],
    star: ['M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z'],
    heart: ['M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z'],
    download: ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'm7 10 5 5 5-5', 'M12 15V3'],
    upload: ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'm17 8-5-5-5 5', 'M12 3v12'],
    power: ['M12 2v10', 'M18.4 6.6a9 9 0 1 1-12.77.04'],
    arrowUp: ['m5 12 7-7 7 7', 'M12 19V5'],
    arrowDown: ['M12 5v14', 'm19 12-7 7-7-7'],
    sort: ['m7 15 5 5 5-5', 'm7 9 5-5 5 5'],
};
</script>

<script setup>
defineProps({
    name: { type: String, required: true, validator: name => name in ICONS },
    size: { type: [Number, String], default: 16 },
    strokeWidth: { type: [Number, String], default: 2 },
});
</script>

<style scoped>
.app-icon {
    display: block;
    flex: 0 0 auto;
}
</style>
