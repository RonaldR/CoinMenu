<template>
    <main class="view settings-view">
        <header class="topbar">
            <div class="heading">
                <RouterLink to="/" class="icon-button" aria-label="Back to watchlist" title="Back (Esc)">
                    <AppIcon name="back" :size="16" />
                </RouterLink>
                <h1>Settings</h1>
            </div>
        </header>

        <section class="group" aria-labelledby="display-title">
            <h2 id="display-title" class="eyebrow">Display</h2>
            <div class="card rows">
                <div class="row">
                    <div><strong>Currency</strong><span>Prices, holdings and totals.</span></div>
                    <SegmentedControl v-model="settings.currency" :options="CURRENCIES" label="Currency" />
                </div>
                <div class="row">
                    <div><strong>Appearance</strong><span>Auto follows your system.</span></div>
                    <SegmentedControl v-model="settings.theme" :options="THEME_OPTIONS" label="Appearance" />
                </div>
                <div class="row">
                    <div><strong>Hide balances</strong><span>Mask amounts when sharing your screen.</span></div>
                    <ToggleSwitch v-model="settings.privacy" label="Hide balances" />
                </div>
            </div>
        </section>

        <section v-if="isDesktop" class="group" aria-labelledby="app-title">
            <h2 id="app-title" class="eyebrow">Menu bar</h2>
            <div class="card rows">
                <div v-if="supportsTrayTitle" class="row">
                    <div><strong>Show next to the icon</strong><span>Updates in the background.</span></div>
                    <SegmentedControl v-model="settings.trayMode" :options="TRAY_OPTIONS" label="Menu bar display" small />
                </div>
                <div v-if="supportsTrayTitle && settings.trayMode === 'coin'" class="row">
                    <div><strong>Coin</strong><span>Price shown in the menu bar.</span></div>
                    <select v-model="settings.trayCoinId" class="field select" aria-label="Menu bar coin">
                        <option v-for="option in trayCoinOptions" :key="option.id" :value="option.id">
                            {{ option.name }} ({{ option.symbol }})
                        </option>
                    </select>
                </div>
                <div v-if="supportsLaunchAtLogin" class="row">
                    <div><strong>Launch at login</strong><span>Start CoinMenu when you log in.</span></div>
                    <ToggleSwitch
                        :model-value="Boolean(launchAtLogin)"
                        label="Launch at login"
                        :disabled="launchAtLogin === null"
                        @update:model-value="updateLaunchAtLogin"
                    />
                </div>
            </div>
        </section>

        <section class="group" aria-labelledby="alerts-title">
            <h2 id="alerts-title" class="eyebrow">Price alerts</h2>
            <div class="card rows">
                <div v-for="alert in sortedAlerts" :key="alert.id" class="row alert-row">
                    <RouterLink :to="`/coin/${alert.coinId}`" class="alert-coin">
                        <CoinLogo :id="alert.coinId" :symbol="alert.symbol" :size="22" />
                        <div>
                            <strong>{{ alert.name }}</strong>
                            <span>
                                <AppIcon :name="alert.direction === 'above' ? 'arrowUp' : 'arrowDown'" :size="10" :stroke-width="2.5" />
                                {{ alert.direction }} {{ formatPrice(alert.target, alert.currency) }}
                            </span>
                        </div>
                    </RouterLink>
                    <button type="button" class="icon-button small" :aria-label="`Delete ${alert.symbol} alert`" @click="removeAlert(alert.id)">
                        <AppIcon name="x" :size="12" />
                    </button>
                </div>
                <p v-if="!alerts.length" class="empty">
                    No alerts yet. Open a coin and set a price to get notified when it crosses that level.
                </p>
            </div>
        </section>

        <section class="group" aria-labelledby="data-title">
            <h2 id="data-title" class="eyebrow">Your data</h2>
            <div class="card rows">
                <div class="row">
                    <div><strong>Backup</strong><span>Watchlist, holdings, alerts and settings as a JSON file.</span></div>
                    <div class="actions">
                        <button type="button" class="button" @click="exportBackup"><AppIcon name="download" :size="13" /> Export</button>
                        <button type="button" class="button" @click="importBackup"><AppIcon name="upload" :size="13" /> Import</button>
                    </div>
                </div>
                <div class="row">
                    <div><strong>Reset</strong><span>Remove everything and start over.</span></div>
                    <button type="button" class="button danger" @click="reset"><AppIcon name="trash" :size="13" /> Reset</button>
                </div>
                <p v-if="dataMessage" class="message" :class="dataMessage.tone" role="status">{{ dataMessage.text }}</p>
            </div>
            <p class="footnote">Everything stays on this device. CoinMenu has no account and no tracking.</p>
        </section>

        <section class="group shortcuts-group" aria-labelledby="keys-title">
            <h2 id="keys-title" class="eyebrow">Keyboard shortcuts</h2>
            <div class="card shortcuts">
                <div v-for="shortcut in SHORTCUTS" :key="shortcut.label">
                    <span>{{ shortcut.label }}</span>
                    <span class="keys"><kbd v-for="key in shortcut.keys" :key="key" class="kbd">{{ key }}</kbd></span>
                </div>
            </div>
        </section>

        <section class="group about" aria-labelledby="about-title">
            <h2 id="about-title" class="eyebrow">About</h2>
            <div class="card about-card">
                <div class="about-head">
                    <img src="@/assets/logo.svg" alt="">
                    <div>
                        <strong>CoinMenu <span>v{{ version }}</span></strong>
                        <span>A tiny, open-source crypto portfolio for your menu bar.</span>
                    </div>
                </div>
                <p>
                    Prices come from CoinPaprika and are for reference only; they can move quickly.
                    CoinMenu does not give financial advice.
                </p>
                <div class="links">
                    <a href="https://ko-fi.com/r_authentic" class="button" @click.prevent="openExternal('https://ko-fi.com/r_authentic')">
                        <AppIcon name="heart" :size="13" class="heart" /> Tip jar
                    </a>
                    <a href="https://github.com/RonaldR/CoinMenu" class="button" @click.prevent="openExternal('https://github.com/RonaldR/CoinMenu')">
                        <AppIcon name="star" :size="13" /> Star on GitHub
                    </a>
                    <a href="https://coinpaprika.com" class="button" @click.prevent="openExternal('https://coinpaprika.com')">
                        <AppIcon name="external" :size="13" /> CoinPaprika
                    </a>
                </div>
                <dl class="credits">
                    <div><dt>Created by</dt><dd>Ronald Runia</dd></div>
                    <div><dt>Designed by</dt><dd>Bob van Aubel</dd></div>
                </dl>
            </div>
        </section>

        <button v-if="isDesktop" type="button" class="button quit" @click="quitApp">
            <AppIcon name="power" :size="13" /> Quit CoinMenu
        </button>
    </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import AppIcon from '@/components/AppIcon.vue';
import CoinLogo from '@/components/CoinLogo.vue';
import SegmentedControl from '@/components/SegmentedControl.vue';
import ToggleSwitch from '@/components/ToggleSwitch.vue';
import { useHotkeys } from '@/composables/useHotkeys';
import { formatPrice } from '@/lib/format';
import {
    confirmAction,
    getLaunchAtLogin,
    isDesktop,
    openExternal,
    openTextFile,
    quitApp,
    saveTextFile,
    setLaunchAtLogin,
    supportsLaunchAtLogin,
    supportsTrayTitle,
} from '@/lib/platform';
import { alerts, removeAlert } from '@/stores/alerts';
import { createBackup, resetAllData, restoreBackup } from '@/stores/backup';
import { tickerById } from '@/stores/market';
import { CURRENCIES, settings } from '@/stores/settings';
import { coins } from '@/stores/watchlist';

const THEME_OPTIONS = [
    { value: 'dark', label: 'Dark' },
    { value: 'light', label: 'Light' },
    { value: 'system', label: 'Auto' },
];
const TRAY_OPTIONS = [
    { value: 'icon', label: 'Nothing' },
    { value: 'value', label: 'Value', title: 'Portfolio value' },
    { value: 'change', label: '24h %', title: 'Portfolio change over 24 hours' },
    { value: 'coin', label: 'Coin', title: 'Price of one coin' },
];
const SHORTCUTS = [
    { label: 'Add a coin', keys: ['N'] },
    { label: 'Edit holdings', keys: ['E'] },
    { label: 'Filter watchlist', keys: ['/'] },
    { label: 'Refresh prices', keys: ['R'] },
    { label: 'Hide balances', keys: ['P'] },
    { label: 'Switch currency', keys: ['C'] },
    { label: 'Period or chart range', keys: ['1', '2', '3', '4'] },
    { label: 'Open settings', keys: [/Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl', ','] },
    { label: 'Go back or close', keys: ['Esc'] },
];

const version = __APP_VERSION__;
const router = useRouter();
const launchAtLogin = ref(null);
const dataMessage = ref(null);

const sortedAlerts = computed(() => [...alerts.value].sort((a, b) => a.name.localeCompare(b.name) || b.target - a.target));

const trayCoinOptions = computed(() => {
    const options = coins.value.filter(coin => coin.id);
    // Keep the current choice selectable even after it left the watchlist.
    if (settings.trayCoinId && !options.some(coin => coin.id === settings.trayCoinId)) {
        const ticker = tickerById(settings.trayCoinId);
        if (ticker) options.unshift({ id: ticker.id, name: ticker.name, symbol: ticker.symbol });
    }
    return options;
});

async function updateLaunchAtLogin(enabled) {
    launchAtLogin.value = await setLaunchAtLogin(enabled);
}

async function exportBackup() {
    try {
        const saved = await saveTextFile(`coinmenu-backup-${new Date().toISOString().slice(0, 10)}.json`, createBackup());
        if (saved) dataMessage.value = { tone: 'up', text: 'Backup saved.' };
    } catch (error) {
        dataMessage.value = { tone: 'down', text: error.message };
    }
}

async function importBackup() {
    try {
        const text = await openTextFile();
        if (text === null) return;
        const confirmed = await confirmAction({
            message: 'Replace your current data with this backup?',
            detail: 'Your watchlist, holdings, alerts and settings will be overwritten.',
            confirmLabel: 'Replace',
        });
        if (!confirmed) return;
        const restored = restoreBackup(text);
        dataMessage.value = { tone: 'up', text: `Restored ${restored.coins} coins and ${restored.alerts} alerts.` };
    } catch (error) {
        dataMessage.value = { tone: 'down', text: error.message };
    }
}

async function reset() {
    const confirmed = await confirmAction({
        message: 'Reset CoinMenu?',
        detail: 'This removes your watchlist, holdings, alerts and settings. Export a backup first if you want to keep them.',
        confirmLabel: 'Reset',
    });
    if (!confirmed) return;
    resetAllData();
    dataMessage.value = { tone: 'up', text: 'CoinMenu has been reset.' };
}

useHotkeys({ escape: () => router.push('/') });

onMounted(async () => {
    launchAtLogin.value = await getLaunchAtLogin();
});
</script>

<style scoped>
.settings-view {
    padding-bottom: 16px;
}

.heading {
    display: flex;
    align-items: center;
    gap: 10px;
}

h1 {
    margin: 0;
    font-size: 14px;
    font-weight: 700;
}

.group {
    margin-top: 18px;
}

.group > .eyebrow {
    margin: 0 0 8px 2px;
}

.rows {
    padding: 0 14px;
}

.row {
    display: flex;
    min-height: 54px;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 10px 0;
}

.row + .row {
    border-top: 1px solid var(--line);
}

.row strong,
.alert-coin strong {
    display: block;
    font-size: 12px;
    font-weight: 650;
}

.row span {
    display: block;
    margin-top: 2px;
    color: var(--muted);
    font-size: 11px;
}

.select {
    width: auto;
    max-width: 220px;
    cursor: pointer;
}

.actions {
    display: flex;
    gap: 6px;
}

.alert-row {
    min-height: 46px;
}

.alert-coin {
    display: flex;
    align-items: center;
    gap: 10px;
}

.alert-coin span {
    display: inline-flex;
    align-items: center;
    gap: 3px;
}

.alert-coin:hover strong {
    color: var(--accent);
}

.empty {
    margin: 0;
    padding: 16px 0;
    color: var(--muted);
    font-size: 12px;
    line-height: 1.5;
}

.message {
    margin: 0;
    padding: 0 0 12px;
    font-size: 12px;
}

.footnote {
    margin: 8px 2px 0;
    color: var(--faint);
    font-size: 11px;
}

.shortcuts {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 20px;
    padding: 6px 14px;
}

.shortcuts > div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 6px 0;
    color: var(--text-2);
    font-size: 11px;
}

.keys {
    display: flex;
    gap: 3px;
}

/* Phones and tablets without a keyboard have no use for shortcuts. */
@media (hover: none) and (pointer: coarse) {
    .shortcuts-group {
        display: none;
    }
}

.about-card {
    padding: 14px;
}

.about-head {
    display: flex;
    align-items: center;
    gap: 12px;
}

.about-head img {
    width: 24px;
    height: 34px;
}

.about-head strong {
    display: block;
    font-size: 15px;
}

.about-head strong span {
    margin-left: 4px;
    color: var(--muted);
    font-size: 11px;
    font-weight: 500;
}

.about-head div > span {
    color: var(--muted);
    font-size: 12px;
}

.about-card p {
    margin: 12px 0;
    color: var(--text-2);
    font-size: 12px;
    line-height: 1.55;
}

.links {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.heart {
    color: var(--down);
}

.credits {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    padding-top: 12px;
    margin: 14px 0 0;
    border-top: 1px solid var(--line);
}

.credits dt {
    color: var(--faint);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
}

.credits dd {
    margin: 4px 0 0;
    font-size: 12px;
}

.quit {
    width: 100%;
    margin: 18px 0 16px;
    color: var(--muted);
}

.quit:hover {
    color: var(--down);
}
</style>
