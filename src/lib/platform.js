// One place that knows whether CoinMenu runs inside Electron (through the preload bridge) or in a
// browser tab, so the rest of the app can call these helpers without checking.

const bridge = typeof window === 'undefined' ? undefined : window.coinMenu;

export const isDesktop = Boolean(bridge);
export const desktopPlatform = bridge?.platform ?? null;
export const supportsTrayTitle = desktopPlatform === 'darwin';
export const supportsLaunchAtLogin = isDesktop && desktopPlatform !== 'linux';

// Electron preloads the window hidden but reports it as visible; the main process announces the
// real state once the page has loaded, so assume hidden until then.
export const startsVisible = isDesktop ? false : typeof document === 'undefined' || document.visibilityState === 'visible';

export function openExternal(url) {
    if (bridge) return bridge.openExternal(url);
    window.open(url, '_blank', 'noopener,noreferrer');
    return Promise.resolve(true);
}

/** Calls back with `true`/`false` whenever the window or tab is shown or hidden. */
export function onVisibilityChange(callback) {
    const onDocumentChange = () => callback(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onDocumentChange);
    const stopBridge = bridge?.onVisibilityChange(callback);
    return () => {
        document.removeEventListener('visibilitychange', onDocumentChange);
        stopBridge?.();
    };
}

export function setTray(tray) {
    bridge?.setTray(tray);
}

let navigateHandler = () => {};

export function onNavigate(callback) {
    navigateHandler = callback;
    return bridge?.onNavigate(callback);
}

export function onRefreshRequest(callback) {
    return bridge?.onRefresh(callback);
}

export async function ensureNotificationPermission() {
    if (bridge || typeof Notification === 'undefined') return true;
    if (Notification.permission === 'default') await Notification.requestPermission();
    return Notification.permission === 'granted';
}

export function notify({ title, body, route }) {
    if (bridge) {
        bridge.notify({ title, body, route });
        return;
    }
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    const notification = new Notification(title, { body });
    notification.onclick = () => {
        window.focus();
        if (route) navigateHandler(route);
    };
}

export async function confirmAction({ message, detail, confirmLabel }) {
    if (bridge) return bridge.confirm({ message, detail, confirmLabel });
    return window.confirm(detail ? `${message}\n\n${detail}` : message);
}

export async function saveTextFile(name, content) {
    if (bridge) return bridge.saveFile({ name, content });
    const url = URL.createObjectURL(new Blob([content], { type: 'application/json' }));
    const link = Object.assign(document.createElement('a'), { href: url, download: name });
    link.click();
    URL.revokeObjectURL(url);
    return true;
}

export function openTextFile() {
    if (bridge) return bridge.openFile();
    return new Promise((resolve, reject) => {
        const input = Object.assign(document.createElement('input'), { type: 'file', accept: '.json,application/json' });
        input.addEventListener('change', () => {
            const [file] = input.files;
            if (!file) resolve(null);
            else file.text().then(resolve, reject);
        });
        input.click();
    });
}

export function getLaunchAtLogin() {
    return supportsLaunchAtLogin ? bridge.getLaunchAtLogin() : Promise.resolve(null);
}

export function setLaunchAtLogin(enabled) {
    return supportsLaunchAtLogin ? bridge.setLaunchAtLogin(enabled) : Promise.resolve(null);
}

export function quitApp() {
    bridge?.quit();
}
