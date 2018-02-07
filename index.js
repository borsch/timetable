const { app, BrowserWindow } = require('electron');
const url = require('url');
const path = require('path');

let browser_window;

app.on('ready', () => {
    browser_window = new BrowserWindow({
        width: 1000,
        height: 600,
        devTools: true
    });

    browser_window.loadURL(url.format ({
        pathname: path.join(__dirname, `src/views/index.html`),
        protocol: 'file:',
        slashes: true
    }));

    // open js console, inspectror, network and so on..
    //browser_window.webContents.openDevTools();

    browser_window.on('closed', () => {
        browser_window = null
    });
});

app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (browser_window === null) {
    createWindow()
  }
});