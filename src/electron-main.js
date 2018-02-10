// DEV
// import {enableLiveReload} from 'electron-compile';
// enableLiveReload();
//

const path = require('path');
import menubar from 'menubar';
const {app} = require('electron');

const menuBar = menubar({
    preloadWindow: true,
    width: 380,
    height: 320,
    dir: __dirname,
    icon: path.join(__dirname, 'IconTemplate.png'),
    index: path.join('file://', __dirname, '../dist/index.html'),
    tooltip: 'CoinMenu',
});

menuBar.on('ready', () => {
  // DEV
  //console.log('app is ready')
  //menuBar.window.openDevTools();

  // focussed event listener, to refresh on focus.
  app.on('browser-window-focus', () => {
    menuBar.window.webContents.send('focussed', 'true');
  });
});
