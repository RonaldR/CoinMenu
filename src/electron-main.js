// DEV
// import {enableLiveReload} from 'electron-compile';
// enableLiveReload();
//

const path = require('path');
import menubar from 'menubar';
const {app} = require('electron');

const menuBar = menubar({
    preloadWindow: true,
    width: 400,
    height: 320,
    dir: __dirname,
    icon: path.join(__dirname, 'icon.png'),
    index: path.join('file://', __dirname, '../dist/index.html'),
    tooltip: 'CoinMenu',
});

menuBar.on('show', () => {
  //menuBar.window.app.$children[0].$children[0].getCoins();

  menuBar.window.webContents.send('focussed', 'true');

  menuBar.window.setVibrancy('ultra-dark');
  // menuBar.window.setBackgroundColor("#000");
  menuBar.window.setOpacity(0.99);
});

menuBar.on('ready', () => {
  // DEV
  //console.log('app is ready')
  //menuBar.window.openDevTools();
});
