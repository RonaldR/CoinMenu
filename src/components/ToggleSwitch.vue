<template>
    <button
        type="button"
        class="toggle"
        role="switch"
        :aria-checked="modelValue"
        :aria-label="label"
        :disabled="disabled"
        @click="emit('update:modelValue', !modelValue)"
    >
        <span class="thumb"></span>
    </button>
</template>

<script setup>
defineProps({
    modelValue: { type: Boolean, required: true },
    label: { type: String, required: true },
    disabled: { type: Boolean, default: false },
});
const emit = defineEmits(['update:modelValue']);
</script>

<style scoped>
.toggle {
    position: relative;
    width: 34px;
    height: 20px;
    flex: 0 0 auto;
    padding: 0;
    border: 0;
    border-radius: 999px;
    background: var(--surface-3);
    transition: background-color 0.2s var(--ease);
}

.toggle[aria-checked="true"] {
    background: var(--accent-strong);
}

.toggle:disabled {
    opacity: 0.5;
}

.thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #ffffff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    transition: transform 0.2s var(--ease);
}

.toggle[aria-checked="true"] .thumb {
    transform: translateX(14px);
}
</style>
