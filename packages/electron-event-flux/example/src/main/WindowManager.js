import { app, BrowserWindow } from 'electron'

const isDevelopment = process.env.NODE_ENV !== 'production'

export default class WindowManager {
  constructor() {
    this.windows = [];
    app.on('ready', () => this.ensureWindows());
  }

  genClientId() {
    let clientId = 'win' + Math.floor(Math.random() * 10000);
    return clientId;
  }
  
  createWin(clientId) {
    const window = new BrowserWindow({ 
      show: false,
      x: 0, y: 0,
      width: 1280, height: 800, 
      useContentSize: true,
      backgroundColor: '#FFF',
    });

    if (isDevelopment) {
      window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}?url=/&clientId=${clientId}`);
    }
    else {
      window.loadURL(formatUrl({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file',
        slashes: true,
        query: { windowParams: JSON.stringify(params) }
      }));
    }
    return window;
  }

  ensureWindows() {
    while (this.windows.length < 2) {
      let clientId = this.genClientId()
      this.windows.push({ clientId, window: this.createWin(clientId) });
    }
  }

  getWin() {
    let win = this.windows.shift();
    this.ensureWindows();
    return win;
  }

  dispose() {
    this.windows.forEach(win => win.close());
    this.windows = null;
  }
}