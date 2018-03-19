const path = require('path');

import menubar from 'menubar';

const menuBar = menubar({
  preloadWindow: true,
  width: 500,
  height: 400,
  dir: __dirname,
  icon: path.join(__dirname, 'icon.png'),
  index: path.join('file://', __dirname, '../dist/index.html'),
  tooltip: 'CoinMenu',
});

// show event, trigger focussed to refresh the data
menuBar.on('show', () => {
  menuBar.window.webContents.send('focussed', 'true');
});

menuBar.on('ready', () => {
  // DEV
  // console.log('app is ready');
  // menuBar.window.openDevTools();
  menuBar.window.setResizable(false);

  // menuBar.window.setVibrancy('ultra-dark'); // electron transparency bug titlebarAppearsTransparent
  menuBar.window.setOpacity(0.99);
});
