import Vue from 'vue';
import App from './App.vue';

import router from './router';
import store from './store';

// 3th party
import Vue2Filters from 'vue2-filters';
import VueClipboard from 'vue-clipboard2';

Vue.config.productionTip = false;

Vue.use(Vue2Filters); // vue filters, using for displaying currency
Vue.use(VueClipboard); // A simple vuejs 2 binding for clipboard.js

window.app = new Vue({
    el: '#app',
    router,
    store,
    render: h => h(App)
});


// TODO:
// fix empty, duplicate and none existing coins in localstorage list
