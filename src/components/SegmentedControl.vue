<template>
    <div class="segmented" :class="{ small }" role="group" :aria-label="label">
        <button
            v-for="option in normalizedOptions"
            :key="option.value"
            type="button"
            :class="{ active: modelValue === option.value }"
            :aria-pressed="modelValue === option.value"
            :title="option.title"
            @click="emit('update:modelValue', option.value)"
        >
            {{ option.label }}
        </button>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    modelValue: { type: String, default: null },
    /** Plain strings, or `{ value, label, title }` objects. */
    options: { type: Array, required: true },
    label: { type: String, required: true },
    small: { type: Boolean, default: false },
});
const emit = defineEmits(['update:modelValue']);

const normalizedOptions = computed(() => props.options.map(option => (
    typeof option === 'string' ? { value: option, label: option } : option
)));
</script>

<style scoped>
.segmented {
    display: inline-flex;
    flex: 0 0 auto;
    gap: 2px;
    padding: 2px;
    border: 1px solid var(--line);
    border-radius: 9px;
    background: var(--surface);
}

button {
    min-width: 36px;
    height: 24px;
    padding: 0 8px;
    border: 0;
    border-radius: 6px;
    background: transparent;
    color: var(--muted);
    font-size: 11px;
    font-weight: 650;
    transition: color 0.15s, background-color 0.15s;
}

button:hover {
    color: var(--text);
}

button.active {
    background: var(--surface-3);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.18);
    color: var(--text);
}

.small button {
    min-width: 32px;
    height: 22px;
    padding: 0 6px;
    font-size: 10px;
}
</style>
