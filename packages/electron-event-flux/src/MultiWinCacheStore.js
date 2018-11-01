import MultiWinStore from './MultiWinStore';
import ElectronWindowState from './ElectronWindowState';
 
import { app, BrowserWindow } from 'electron';

const isDevelopment = process.env.NODE_ENV !== 'production'

class WindowManager {
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

global.windowManager = new WindowManager();

class MultiWinCacheStore extends MultiWinStore {
  init() {
    this.clientUrlMap = {};
    this.clientStateMap = {};
    this.clientIds = [];

    let clients = this.getStorage().get('clients');
    if (!clients || clients.length === 0) {
      clients = [{ clientId: 'mainClient', url: '/', winState: { isMaximized: true } }];
    }
    app.on('ready', () => {
      clients.forEach(item => this.createElectronWin(item.url, item.clientId, item.winState));
    });
  }

  getStorage() {
    console.error('You need inherit MultiWinCacheStore and implement getStorage');
    return null;
  }

  closeAllWindows() {
    this._appStore.mainClient.closeAllWindows();
  }

  saveClients(clientIds) {
    let clients = clientIds.map(id => ({ 
      clientId: id, url: this.clientUrlMap[id], winState: this.clientStateMap[id],
    }));
    this.getStorage().set('clients', clients);
  }

  saveWinState(clientId, winState) {
    this.clientStateMap[clientId] = winState;
    this.saveClients(this.clientIds || []);
  }

  createElectronWin(url, clientId, params) {
    let winState = new ElectronWindowState(null, params);

    let winInfo = this.getElectronWin(url, clientId, winState.state);
    if (!clientId) clientId = winInfo.clientId; 
    this.clientIds.push(clientId);

    this.clientUrlMap[clientId] = url;

    let win = winInfo.win;

    winState.onSave = (state) => {
      this.saveWinState(clientId, state);
    };
    this.clientStateMap[clientId] = winState.state;
    winState.manage(win);

    this.saveClients(this.clientIds);   // Save clients into Storage
  
    win.on('closed', () => {
      if (this.willQuit) return;
      if (clientId === 'mainClient') {
        this.willQuit = true;
        return this.closeAllWindows();
      }
      let index = this.clientIds.indexOf(clientId);
      if (index !== -1) {
        this.clientIds.splice(index, 1);
      }
      this.saveClients(this.clientIds);
    });
    return win;
  }

  getElectronWin(url, clientId, params) {
    // return createMainWindow(url, clientId, params);
    let win;
    if (clientId) {
      win = this.createMainWindow(url, clientId, params);
    } else {
      let winInfo = global.windowManager.getWin();
      clientId = winInfo.clientId;
      win = winInfo.window;
      
      this._appStore.mainClient.sendMessage(win, JSON.stringify({ url: '/' }));
  
      let setBoundsFunc = params.useContentSize ? 'setContentBounds' : 'setBounds';
      win[setBoundsFunc]({ 
        x: parseInt(params.x), y: parseInt(params.y),
        width: params.width, height: params.height,     
      });
  
      win[setBoundsFunc]({ 
        x: parseInt(params.x), y: parseInt(params.y),
        width: params.width, height: params.height,     
      });
  
      win.show();
    }
    return { clientId, win };
  }

  createMainWindow(url, clientId, params = {}) {
    const window = new BrowserWindow({ 
      show: false,
      x: parseInt(params.x), y: parseInt(params.y),
      width: params.width, height: params.height, 
      useContentSize: params.useContentSize,
    });
  
    // if (params.isMaximized) window.maximize();
    // if (params.isFullScreen) window.setFullScreen(true);
  
    window.on('ready-to-show', function() {
      window.show();
    });
  
    if (isDevelopment) {
      // window.webContents.openDevTools()
    }
  
    if (isDevelopment) {
      console.log('port:', process.env.ELECTRON_WEBPACK_WDS_PORT)
      window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}?url=${url}&clientId=${clientId}`);
    }
    else {
      window.loadURL(formatUrl({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file',
        slashes: true,
        query: { windowParams: JSON.stringify(params) }
      }));
    }

    // window.webContents.openDevTools();
    window.webContents.on('devtools-opened', () => {
      window.focus()
      setImmediate(() => {
        window.focus()
      })
    })
  
    return window
  }
}

export default MultiWinCacheStore;