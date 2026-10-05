import { createRouter, createWebHashHistory } from 'vue-router';

import CoinView from './views/CoinView.vue';
import HomeView from './views/HomeView.vue';
import SettingsView from './views/SettingsView.vue';

export default createRouter({
    history: createWebHashHistory(),
    routes: [
        { path: '/', name: 'home', component: HomeView, meta: { depth: 0 } },
        { path: '/coin/:id', name: 'coin', component: CoinView, props: true, meta: { depth: 1 } },
        { path: '/settings', name: 'settings', component: SettingsView, meta: { depth: 1 } },
        { path: '/about', redirect: '/settings' },
        { path: '/:pathMatch(.*)*', redirect: '/' },
    ],
    scrollBehavior: () => ({ top: 0 }),
});
