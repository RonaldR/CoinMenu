import { ref, watchEffect } from 'vue';

import { settings } from '@/stores/settings';

/** Keeps `<html data-theme>` on "dark" or "light", resolving the "system" setting live. */
export function startThemeSync() {
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const systemTheme = ref(query.matches ? 'dark' : 'light');
    query.addEventListener('change', (event) => {
        systemTheme.value = event.matches ? 'dark' : 'light';
    });

    watchEffect(() => {
        document.documentElement.dataset.theme = settings.theme === 'system' ? systemTheme.value : settings.theme;
    });
}
