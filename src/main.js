import Vue from 'vue';
import App from './App.vue';

import router from './router';
import store from './store';

// 3th party
import Vue2Filters from 'vue2-filters';
import VueClipboard from 'vue-clipboard2';
import VueAnalytics from 'vue-analytics';

Vue.config.productionTip = false;

Vue.use(Vue2Filters); // vue filters, using for displaying currency
Vue.use(VueClipboard); // A simple vuejs 2 binding for clipboard.js

const isProd = process.env.NODE_ENV === 'production';
Vue.use(VueAnalytics, {
    id: 'UA-7382261-5',
    router,
    autoTracking: {
        exception: true
    },
    debug: {
        enabled: !isProd,
        sendHitTask: isProd
    },
    set: [
        { field: 'anonymizeIp', value: true }
    ]
});

window.app = new Vue({
    el: '#app',
    router,
    store,
    render: h => h(App)
});

// TODO:
// fix empty, duplicate and none existing coins in localstorage list
