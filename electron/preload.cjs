const { contextBridge, ipcRenderer } = require('electron');

function subscribe(channel, callback) {
    const listener = (_event, payload) => callback(payload);
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.removeListener(channel, listener);
}

// The only surface the renderer gets: every call maps to one allow-listed IPC channel.
contextBridge.exposeInMainWorld('coinMenu', {
    platform: process.platform,
    openExternal: url => ipcRenderer.invoke('coinmenu:open-external', url),
    setTray: tray => ipcRenderer.send('coinmenu:set-tray', tray),
    notify: notification => ipcRenderer.send('coinmenu:notify', notification),
    confirm: options => ipcRenderer.invoke('coinmenu:confirm', options),
    saveFile: file => ipcRenderer.invoke('coinmenu:save-file', file),
    openFile: () => ipcRenderer.invoke('coinmenu:open-file'),
    getLaunchAtLogin: () => ipcRenderer.invoke('coinmenu:get-launch-at-login'),
    setLaunchAtLogin: enabled => ipcRenderer.invoke('coinmenu:set-launch-at-login', enabled),
    quit: () => ipcRenderer.send('coinmenu:quit'),
    onVisibilityChange: callback => subscribe('coinmenu:visibility', callback),
    onNavigate: callback => subscribe('coinmenu:navigate', callback),
    onRefresh: callback => subscribe('coinmenu:refresh', callback),
});
