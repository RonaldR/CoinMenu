import menubar from 'menubar';

const menuBar = menubar({
    preloadWindow: true,
    width: 360,
    height: 320,
});

menuBar.on('ready', () => {
    // menuBar.window.openDevTools();
});
