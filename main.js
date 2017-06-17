// DEV
// import {enableLiveReload} from 'electron-compile';
// enableLiveReload();
//

import menubar from 'menubar';

const menuBar = menubar({
    preloadWindow: true,
    width: 360,
    height: 320,
});

menuBar.on('ready', () => {
   // DEV
  //  menuBar.window.openDevTools();
});
