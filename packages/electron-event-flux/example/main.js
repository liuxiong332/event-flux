const {app, ipcMain, BrowserWindow} = require('electron');
const url = require('url');
const path = require('path');

const store = require('./store');

app.on('ready', () => {

  const screen = require('electron').screen;

  const loadFileUrl = (wnd, params = {}) => {
    let targetUrl = url.format({
      protocol: 'file',
      pathname: require.resolve('./index.html'),
      slashes: true,
      query: {windowParams: JSON.stringify(params)}
    });

    wnd.loadURL(targetUrl);
  }


  const numWindows = 3;
  const windowSize = {width: 500, height: 500};
  const screenSize = screen.getPrimaryDisplay().size;
  const padding = 10;

  const top = 0.5 * screenSize.height - windowSize.height;
  const left = 0.5 * (screenSize.width - (numWindows * (padding + windowSize.width) - padding));
  // Create the browser window.
  const windows = Array(numWindows).fill().map((_, index) => {
    const win = new BrowserWindow({
      width: windowSize.width,
      height: windowSize.height,
      x: left + (windowSize.width + padding) * index,
      y: top,
      show: true,
    });
    loadFileUrl(win, {id: index});
    return win;
  });
});




// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
