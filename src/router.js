import Vue from 'vue';
import Router from 'vue-router';

import Home from './views/Home.vue';
import About from './views/About.vue';

Vue.use(Router);

export default new Router({
    routes: [
        {
            path: '/',
            name: 'home',
            component: Home,
        },
        {
            path: '/about',
            name: 'about',
            component: About,
        },
    ],
    scrollBehavior(to, from, savedPosition) {
    // scrolls to top on route change
        if (savedPosition) {
            return savedPosition;
        }
        return { x: 0, y: 0 };
    },
});
