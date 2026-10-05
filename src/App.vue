<template>
    <RouterView v-slot="{ Component, route }">
        <Transition :name="transitionName" mode="out-in">
            <component :is="Component" :key="route.path" />
        </Transition>
    </RouterView>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

// Going deeper slides in from the right, going back slides in from the left.
const transitionName = ref('fade');
useRouter().beforeEach((to, from) => {
    const delta = (to.meta.depth ?? 0) - (from.meta.depth ?? 0);
    transitionName.value = delta > 0 ? 'forward' : delta < 0 ? 'backward' : 'fade';
});
</script>

<style>
.fade-enter-active,
.fade-leave-active,
.forward-enter-active,
.forward-leave-active,
.backward-enter-active,
.backward-leave-active {
    transition: opacity 0.14s ease, transform 0.18s var(--ease);
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.forward-enter-from,
.backward-leave-to {
    opacity: 0;
    transform: translateX(14px);
}

.forward-leave-to,
.backward-enter-from {
    opacity: 0;
    transform: translateX(-14px);
}
</style>
