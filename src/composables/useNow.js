import { onBeforeUnmount, ref } from 'vue';

/** A timestamp that ticks every `interval` ms, for "updated 3 minutes ago" style labels. */
export function useNow(interval = 30_000) {
    const now = ref(Date.now());
    const timer = setInterval(() => {
        now.value = Date.now();
    }, interval);
    onBeforeUnmount(() => clearInterval(timer));
    return now;
}
