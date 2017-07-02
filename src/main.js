// DEV
// import {enableLiveReload} from 'electron-compile';
// enableLiveReload();
//

var path = require('path');

import menubar from 'menubar';

const menuBar = menubar({
    preloadWindow: true,
    width: 360,
    height: 320,
    dir: __dirname,
    icon: path.join(__dirname, 'IconTemplate.png'),
    index: path.join('file://', __dirname, 'index.html'),
    tooltip: 'Hi! I am CoinMenu',
});

menuBar.on('ready', () => {
   // DEV
  //  console.log('app is ready')
  //  menuBar.window.openDevTools();
});
