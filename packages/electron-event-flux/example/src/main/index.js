'use strict'

import { app, BrowserWindow } from 'electron'
import * as path from 'path'
import { format as formatUrl } from 'url'
import TodoStore from './store';
// import MultiWinStore from 'electron-event-flux/lib/MultiWinStore';
// import buildMultiWinAppStore from 'electron-event-flux/lib/MainAppStore';
import MultiWinStore from '../../../src/MultiWinStore';
import buildMultiWinAppStore from '../../../src/MainAppStore';
import { winManagerStoreName } from '../../../src/constants';
import ElectronWindowState from '../../../src/ElectronWindowState';
import storage from './storage';
import WindowManager from './WindowManager';

const electron = require('electron');

const isDevelopment = process.env.NODE_ENV !== 'production'

var appStore;

// global reference to mainWindow (necessary to prevent window from being garbage collected)

class MyMultiWinStore extends MultiWinStore {
  init() {
    this.clientUrlMap = {};
    this.clientStateMap = {};
    this.clientIds = [];

    let clients = storage.get('clients');
    if (!clients || clients.length === 0) {
      clients = [{ clientId: 'mainClient', url: '/', winState: { isMaximized: true } }];
    }
    app.on('ready', () => {
      clients.forEach(item => this.createElectronWin(item.url, item.clientId, item.winState));
    });

    let prevClientIds = [];
    this.disposable = this.stores[winManagerStoreName].onDidUpdate((state) => {
      if (!this.willQuit) return;

      let existClientIds = state.clientIds;
      if (prevClientIds.indexOf('mainClient') !== -1 && existClientIds.indexOf('mainClient') === -1) {
        // 主窗口被关闭
        this.willQuit = true;
        this.closeAllWindows();
      }

      prevClientIds = existClientIds;
      console.log('now clientIds:', existClientIds, this.clientIds);

      this.clientIds = this.clientIds.filter(id => existClientIds.indexOf(id) !== -1);
      this.saveClients(this.clientIds);
     });

    app.on('before-quit', () => {
      this.disposable.dispose();
    });
  }

  closeAllWindows() {
    global.appStore.mainClient.closeAllWindows();
  }

  saveClients(clientIds) {
    let clients = clientIds.map(id => ({ 
      clientId: id, url: this.clientUrlMap[id], winState: this.clientStateMap[id],
    }));
    storage.set('clients', clients);
  }

  saveWinState(clientId, winState) {
    this.clientStateMap[clientId] = winState;
    this.saveClients(this.clientIds || []);
  }

  createElectronWin(url, clientId, params) {
    let winState = new ElectronWindowState(null, params);

    let winInfo = createElectronWin(url, clientId, winState.state);
    if (!clientId) clientId = winInfo.clientId; 
    this.clientIds.push(clientId);

    this.clientUrlMap[clientId] = url;

    let win = winInfo.win;

    winState.onSave = (state) => {
      this.saveWinState(clientId, state);
    };
    this.clientStateMap[clientId] = winState.state;
    winState.manage(win);
  
    return win;
  }
}

global.appStore = buildMultiWinAppStore({ todo: TodoStore, multiWin: MyMultiWinStore }, { winTodo: TodoStore });

const windowManager = new WindowManager();

function createElectronWin(url, clientId, params) {
  // return createMainWindow(url, clientId, params);
  let win;
  // clientId = Math.random() * 1000 % 1000;
  // console.log('set bound params:', params)
  // win = createMainWindow(url, clientId, params);
  // return { win, clientId };
  if (clientId) {
    win = createMainWindow(url, clientId, params);
  } else {
    let winInfo = windowManager.getWin();
    clientId = winInfo.clientId;
    win = winInfo.window;
    
    global.appStore.mainClient.sendMessage(win, JSON.stringify({ url: '/' }));

    win.setBounds({ 
      x: parseInt(params.x), y: parseInt(params.y),
      width: params.width, height: params.height,     
    });

    win.setBounds({ 
      x: parseInt(params.x), y: parseInt(params.y),
      width: params.width, height: params.height,     
    });

    win.show();
    // setTimeout(() => {
    //   win.setBounds({ 
    //     x: parseInt(params.x), y: parseInt(params.y),
    //     width: params.width, height: params.height,     
    //   });
    // }, 0);
    
  }
  return { clientId, win };
}

let mainWindow;

function createMainWindow(url, clientId, params = {}) {
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

  window.on('closed', () => {
    mainWindow = null
  })

  // window.webContents.openDevTools();
  window.webContents.on('devtools-opened', () => {
    window.focus()
    setImmediate(() => {
      window.focus()
    })
  })

  return window
}

// quit application when all windows are closed
app.on('window-all-closed', () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) {
    mainWindow = createMainWindow()
  }
})

// create main BrowserWindow when electron is ready
// app.on('ready', () => {
//   // mainWindow = createMainWindow()
//   createElectronWin(null, 'mainWin');
// })
