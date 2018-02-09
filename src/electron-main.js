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
    //icon: path.join(__dirname, 'IconTemplate.png'),
    index: path.join('file://', __dirname, '../dist/index.html'),
    tooltip: 'Hi! I am CoinMenu',
});

menuBar.on('ready', () => {
   // DEV
    console.log('app is ready')
    menuBar.window.openDevTools();
});

/*
const {app, BrowserWindow} = require('electron')

let win = null;

app.on('ready', function () {

  // Initialize the window to our specified dimensions
  win = new BrowserWindow({width: 1000, height: 600});

  // Specify entry point to default entry point of vue.js
  win.loadURL('http://localhost:8080');

  // Remove window once app is closed
  win.on('closed', function () {
  win = null;
  });

});
//create the application window if the window variable is null
app.on('activate', () => {
  if (win === null) {
  createWindow()
  }
})
//quit the app once closed
app.on('window-all-closed', function () {
  if (process.platform != 'darwin') {
  app.quit();
  }
});
*/
