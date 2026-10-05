<template>
    <section class="intro" aria-labelledby="intro-title">
        <div>
            <p class="eyebrow">Your portfolio</p>
            <p id="intro-title" class="title">Track what your crypto is worth</p>
            <p class="copy">Enter the amounts you hold to see your total value, daily change and allocation.</p>
        </div>
        <button type="button" class="button primary" @click="emit('add-holdings')">
            <AppIcon name="pencil" :size="13" /> Add holdings
        </button>
    </section>
</template>

<script setup>
import AppIcon from '@/components/AppIcon.vue';

const emit = defineEmits(['add-holdings']);
</script>

<style scoped>
.intro {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    margin: 16px 0 6px;
    padding: 15px 17px;
    border: 1px solid var(--hero-line);
    border-radius: var(--radius-l);
    background:
        radial-gradient(ellipse at 100% -20%, var(--hero-glow), transparent 55%),
        linear-gradient(125deg, var(--hero-from), var(--hero-to));
}

.title {
    margin: 7px 0 4px;
    font-size: 16px;
    font-weight: 700;
    letter-spacing: -0.01em;
}

.copy {
    max-width: 300px;
    margin: 0;
    color: var(--muted);
    font-size: 12px;
    line-height: 1.45;
}
</style>
