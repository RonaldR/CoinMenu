import { createApp } from 'vue';

import App from './App.vue';
import router from './router';
import { startBackgroundTasks } from './stores/background';
import { startThemeSync } from './theme';
import './styles.css';

startThemeSync();
startBackgroundTasks(router);

createApp(App).use(router).mount('#app');
