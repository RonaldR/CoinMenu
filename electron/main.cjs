const fs = require('node:fs/promises');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { Menu, Notification, app, dialog, ipcMain, session, shell } = require('electron');
const { menubar } = require('menubar');

const DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;
const PROJECT_URL = 'https://github.com/RonaldR/CoinMenu';
const INDEX_URL = DEV_SERVER_URL || pathToFileURL(path.join(__dirname, '../dist/index.html')).href;
const MAX_IMPORT_BYTES = 1024 * 1024;
const supportsTrayTitle = process.platform === 'darwin';
const supportsLoginItems = process.platform !== 'linux';

if (!app.requestSingleInstanceLock()) {
    app.quit();
} else {
    start();
}

function start() {
    // Registered before menubar's own ready listener, so it is in place before the page loads.
    app.on('ready', identifyImageRequests);
    app.on('web-contents-created', (_event, contents) => guardNavigation(contents));

    const menuBar = menubar({
        index: INDEX_URL,
        // macOS tints "*Template.png" icons to match light and dark menu bars.
        icon: path.join(__dirname, 'assets', 'trayTemplate.png'),
        tooltip: 'CoinMenu',
        preloadWindow: true,
        showDockIcon: Boolean(DEV_SERVER_URL),
        browserWindow: {
            width: 560,
            height: 600,
            resizable: false,
            backgroundColor: '#0e1218',
            webPreferences: {
                preload: path.join(__dirname, 'preload.cjs'),
                contextIsolation: true,
                nodeIntegration: false,
                sandbox: true,
            },
        },
    });

    const send = (channel, payload) => {
        const window = menuBar.window;
        if (window && !window.isDestroyed()) window.webContents.send(channel, payload);
    };

    const showRoute = async (route) => {
        await menuBar.showWindow();
        if (route) send('coinmenu:navigate', route);
    };

    // menubar hides its window on blur. Native dialogs steal focus, so keep the window pinned
    // while one is open to stop the dialog from disappearing together with the window.
    const withPinnedWindow = async (task) => {
        const window = menuBar.window;
        const wasPinned = window.isAlwaysOnTop();
        window.setAlwaysOnTop(true);
        try {
            return await task(window);
        } finally {
            if (!window.isDestroyed()) window.setAlwaysOnTop(wasPinned);
        }
    };

    const buildTrayMenu = () => Menu.buildFromTemplate([
        { label: 'Open CoinMenu', click: () => showRoute() },
        { label: 'Refresh Prices', click: () => send('coinmenu:refresh') },
        { label: 'Settings…', click: () => showRoute('/settings') },
        { type: 'separator' },
        ...(supportsLoginItems ? [{
            label: 'Launch at Login',
            type: 'checkbox',
            checked: app.getLoginItemSettings().openAtLogin,
            click: item => app.setLoginItemSettings({ openAtLogin: item.checked }),
        }, { type: 'separator' }] : []),
        { label: 'Quit CoinMenu', accelerator: 'CommandOrControl+Q', click: () => app.quit() },
    ]);

    menuBar.on('ready', () => {
        // Linux tray icons rarely emit click events, so the menu is the way in there.
        if (process.platform === 'linux') {
            menuBar.tray.setContextMenu(buildTrayMenu());
        } else {
            menuBar.tray.on('right-click', () => menuBar.tray.popUpContextMenu(buildTrayMenu()));
        }
    });

    // Closing the popup (⌘W, Alt+F4) must not quit a menu bar app. The page also runs the
    // background refreshes, alerts and menu bar title, so a fresh hidden one takes its place.
    let quitting = false;
    app.on('before-quit', () => {
        quitting = true;
    });
    app.on('window-all-closed', () => {});
    menuBar.on('after-close', () => {
        if (!quitting) menuBar.createWindow().catch(console.error);
    });

    // A preloaded, hidden window still reports itself as visible, so tell the page the real state.
    menuBar.on('before-load', () => {
        menuBar.window.webContents.on('did-finish-load', () => send('coinmenu:visibility', menuBar.window.isVisible()));
    });
    menuBar.on('after-show', () => send('coinmenu:visibility', true));
    menuBar.on('after-hide', () => send('coinmenu:visibility', false));
    app.on('second-instance', () => showRoute());

    ipcMain.handle('coinmenu:open-external', (_event, url) => openExternal(url));

    ipcMain.on('coinmenu:set-tray', (_event, { title = '', tooltip = '' } = {}) => {
        if (!menuBar.tray) return;
        if (supportsTrayTitle) menuBar.tray.setTitle(String(title).slice(0, 40), { fontType: 'monospacedDigit' });
        menuBar.tray.setToolTip(String(tooltip).slice(0, 120) || 'CoinMenu');
    });

    ipcMain.on('coinmenu:notify', (_event, { title, body, route } = {}) => {
        if (!Notification.isSupported()) return;
        const notification = new Notification({ title: String(title), body: String(body ?? '') });
        notification.on('click', () => showRoute(typeof route === 'string' ? route : undefined));
        notification.show();
    });

    ipcMain.handle('coinmenu:confirm', (_event, { message, detail, confirmLabel = 'OK' } = {}) => (
        withPinnedWindow(async (window) => {
            const { response } = await dialog.showMessageBox(window, {
                type: 'warning',
                message: String(message),
                detail: detail ? String(detail) : undefined,
                buttons: [String(confirmLabel), 'Cancel'],
                defaultId: 1,
                cancelId: 1,
            });
            return response === 0;
        })
    ));

    ipcMain.handle('coinmenu:save-file', (_event, { name, content } = {}) => (
        withPinnedWindow(async (window) => {
            const { canceled, filePath } = await dialog.showSaveDialog(window, {
                defaultPath: path.join(app.getPath('downloads'), path.basename(String(name))),
                filters: [{ name: 'JSON', extensions: ['json'] }],
            });
            if (canceled || !filePath) return false;
            await fs.writeFile(filePath, String(content), 'utf8');
            return true;
        })
    ));

    ipcMain.handle('coinmenu:open-file', () => (
        withPinnedWindow(async (window) => {
            const { canceled, filePaths } = await dialog.showOpenDialog(window, {
                properties: ['openFile'],
                filters: [{ name: 'JSON', extensions: ['json'] }],
            });
            if (canceled || !filePaths[0]) return null;
            const { size } = await fs.stat(filePaths[0]);
            if (size > MAX_IMPORT_BYTES) throw new Error('That file is too large to be a CoinMenu backup.');
            return fs.readFile(filePaths[0], 'utf8');
        })
    ));

    ipcMain.handle('coinmenu:get-launch-at-login', () => (
        supportsLoginItems ? app.getLoginItemSettings().openAtLogin : null
    ));

    ipcMain.handle('coinmenu:set-launch-at-login', (_event, enabled) => {
        if (!supportsLoginItems) return null;
        app.setLoginItemSettings({ openAtLogin: Boolean(enabled) });
        return app.getLoginItemSettings().openAtLogin;
    });

    ipcMain.on('coinmenu:quit', () => app.quit());
}

// Keeps every window on the app itself: links open in the default browser instead.
function guardNavigation(contents) {
    contents.setWindowOpenHandler(({ url }) => {
        openExternal(url);
        return { action: 'deny' };
    });
    contents.on('will-navigate', (event, url) => {
        if (url.split('#')[0] === INDEX_URL.split('#')[0]) return;
        event.preventDefault();
        openExternal(url);
    });
}

// Pages loaded from disk send no Referer, and CoinPaprika's image CDN refuses requests without
// one, so coin logos name the project instead.
function identifyImageRequests() {
    session.defaultSession.webRequest.onBeforeSendHeaders(
        { urls: ['https://static.coinpaprika.com/*'] },
        ({ requestHeaders }, callback) => callback({ requestHeaders: { ...requestHeaders, Referer: PROJECT_URL } }),
    );
}

async function openExternal(target) {
    try {
        const url = new URL(target);
        if (url.protocol !== 'https:') return false;
        await shell.openExternal(url.href);
        return true;
    } catch {
        return false;
    }
}
