// DEV
// import {enableLiveReload} from 'electron-compile';
// enableLiveReload();
//

import menubar from 'menubar';

const menuBar = menubar({
    preloadWindow: true,
    width: 360,
    height: 320,
    dir: '.'
});

menuBar.on('ready', () => {
   // DEV
  //  console.log('app is ready')
  //  menuBar.window.openDevTools();
});
