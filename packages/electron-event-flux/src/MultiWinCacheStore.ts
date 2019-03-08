import MultiWinStore from './MultiWinStore';
import ElectronWindowState from './ElectronWindowState';
import { format as formatUrl } from 'url';
import * as path from 'path';
import { app, BrowserWindow, screen } from 'electron';

const isDevelopment = process.env.NODE_ENV !== 'production'

export class WindowManager {
  windows = [];
  winHandler: any;

  constructor(winHandler) {
    this.windows = [];
    this.winHandler = winHandler;
    app.whenReady().then(() => this.ensureWindows());
  }

  genClientId() {
    let clientId = 'win' + Math.floor(Math.random() * 10000);
    return clientId;
  }
  
  createWin(clientId) {
    return this.winHandler.createWindow(clientId);
  }

  ensureWindows() {
    if (!this.windows) return;
    while (this.windows.length < 1) {
      let clientId = this.genClientId()
      this.windows.push({ clientId, window: this.createWin(clientId) });
    }
  }

  getWin() {
    if (!this.windows) return null;
    let winInfo = this.windows.shift();
    this.ensureWindows();
    return winInfo;
  }

  dispose() {
    this.windows.forEach(({ window }) => {
      if (!window.isDestroyed()) {
        window.close()
      }
    });
    this.windows = null;
  }
}

class MultiWinCacheStore extends MultiWinStore {
  clientInfoMap = {};
  clientStateMap = {};
  clientIds = [];
  createWins = [];
  willQuit = false;
  windowManager: WindowManager;

  static createWindow;

  init() {
    let clients = this.getStorage().get('clients');
    if (!clients || clients.length === 0) {
      clients = this.getDefaultClients();
    }
    this.windowManager = new WindowManager(this);

    app.whenReady().then(() => {
      clients.forEach(item => this.createElectronWin(item.url, item.clientId, item.parentId, item.winState));
    });
  }

  getDefaultClients() {
    return [{ clientId: 'mainClient', url: '/', winState: { isMaximized: true } }];
  }

  getStorage() {
    console.error('You need inherit MultiWinCacheStore and implement getStorage');
    return null;
  }

  onDidWinClose(clientId) {
    // this._appStore.mainClient.sendMessageByClientId(clientId, { action: 'did-close' });
  }

  closeAllWindows() {
    // this._appStore.mainClient.closeAllWindows();
    this.windowManager.dispose();
    this.createWins.slice().forEach(window => {
      if (!window.isDestroyed()) {
        window.close();
      }
    });
    this.namedWinIdMap = {};
    this.clientNamedWinIdMap = {};
  }

  saveClients(clientIds) {
    let clients = clientIds.map(id => ({ 
      clientId: id, ...this.clientInfoMap[id], winState: this.clientStateMap[id],
    }));
    this.getStorage().set('clients', clients);
  }

  saveWinState(clientId, winState) {
    this.clientStateMap[clientId] = winState;
    this.saveClients(this.clientIds || []);
  }

  createWin(url, parentClientId, params) {
    if (params && params.x == null && params.y == null) {
      if (parentClientId) {
        let window = this._appStore.mainClient.getWindowByClientId(parentClientId);
        let bounds = params.useContentSize ? window.getContentBounds() : window.getBounds();
        params.x = bounds.x + bounds.width / 2 - params.width / 2;
        params.y = bounds.y + bounds.height / 2 - params.height / 2;
      } else {
        let screenSize = screen.getPrimaryDisplay().size;
        params.x = screenSize.width / 2 - params.width / 2;
        params.y = screenSize.height / 2 - params.height / 2;
      }
    }
    let clientId;
    try {
      clientId = this.createElectronWin(url, clientId, parentClientId, params);
    } catch(err) {
      console.error(err, err.stack);
    }
     return clientId;
  }

  createElectronWin(url, clientId, parentId, params) {
    let winState = new ElectronWindowState(null, params, null);

    let winInfo = this.getElectronWin(url, clientId, parentId, winState.state);
    if (!clientId) clientId = winInfo.clientId; 
    this.clientIds.push(clientId);

    this.clientInfoMap[clientId] = {url, parentId};

    let win = winInfo.win;

    winState.onSave = (state) => {
      this.saveWinState(clientId, state);
    };
    this.clientStateMap[clientId] = winState.state;
    winState.manage(win);
    this.createWins.push(win);

    this.saveClients(this.clientIds);   // Save clients into Storage
  
    win.on('closed', () => {
      let winIndex = this.createWins.indexOf(win);
      this.createWins.splice(winIndex, 1);

      let winId = this.clientNamedWinIdMap[clientId];
      if (winId) {
        this.clientNamedWinIdMap[clientId] = undefined;
        this.namedWinIdMap[winId] = undefined;
      }

      if (this.willQuit) return;
      if (clientId === 'mainClient') {
        this.willQuit = true;
        this._appStore.willQuit = true;
        return this.closeAllWindows();
      }
      this.onDidWinClose && this.onDidWinClose({ clientId });
      let index = this.clientIds.indexOf(clientId);
      if (index !== -1) {
        this.clientIds.splice(index, 1);
      }
      this.saveClients(this.clientIds);
    });
    return clientId;
  }

  getElectronWin(url, clientId, parentId, params) {
    // return createMainWindow(url, clientId, params);
    let win;
    if (clientId) {
      win = this.createMainWindow(url, clientId, parentId, params);
    } else {
      let winInfo = this.windowManager.getWin();
      clientId = winInfo.clientId;
      win = winInfo.window;
      
      this._appStore.mainClient.sendMessage(win, { action: 'change-props', url, parentId });
  
      let setBoundsFunc = params.useContentSize ? 'setContentBounds' : 'setBounds';

      let x = parseInt(params.x) || 0;
      let y = parseInt(params.y) || 0;
      let width = parseInt(params.width), height = parseInt(params.height);
      win[setBoundsFunc]({ 
        x, y, width, height,
      });
  
      win[setBoundsFunc]({ 
        x, y, width, height,
      });
  
      setTimeout(() => {
        win[setBoundsFunc]({x, y, width, height})
        win.show();
      }, 0);
    }
    return { clientId, win };
  }

  createWindow(clientId, url = 'empty', parentId = '', params) {
    if (params == null) {
      params = {
        x: 0, y: 0,
        width: 1280, height: 800, 
        useContentSize: true,
      };
    }
    const window = new BrowserWindow({ 
      show: false,
      x: parseInt(params.x), y: parseInt(params.y),
      width: params.width, height: params.height, 
      useContentSize: params.useContentSize,
    });

    if (isDevelopment) {
      window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}?url=${url}&clientId=${clientId}&parentId=${parentId}`);
      // window.webContents.openDevTools();
    }
    else {
      window.loadURL(formatUrl({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file',
        slashes: true,
        query: { url: url, clientId, parentId },
      }));
    }

    // window.webContents.openDevTools();
    window.webContents.on('devtools-opened', () => {
      window.focus();
      setImmediate(() => {
        window.focus();
      });
    });

    return window;
  }

  createMainWindow(url, clientId, parentId, params: any = {}) {
    let window = this.createWindow(clientId, url, parentId, params);
    window.on('ready-to-show', function() {
      window.show();
    });
    return window;
  }

  actionChanged(clientId, action) {
    if (this.clientInfoMap[clientId]) {
      this.clientInfoMap[clientId].url = action;
      this.saveClients(this.clientIds);
    }
  }

  activeWindow(clientId) {
    const win = this._appStore.mainClient.getWindowByClientId(clientId);
    if (win) {
      win.moveTop();
      // win && win.minimize();
      win.focus();
    }
  }
}

export default MultiWinCacheStore;