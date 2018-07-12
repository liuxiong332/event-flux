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
import storage from './storage';
const ElectronWindowState = require('./ElectronWindowState');

const isDevelopment = process.env.NODE_ENV !== 'production'

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow

function createElectronWin(url, clientId, params) {
  return createMainWindow(url, clientId, params);
}

function createMainWindow(url, clientId, params = {}) {
  console.log('window state:', params)
  const window = new BrowserWindow({ 
    show: true,
    x: params.x, y: params.y,
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

  window.webContents.on('devtools-opened', () => {
    window.focus()
    setImmediate(() => {
      window.focus()
    })
  })

  return window
}

class MyMultiWinStore extends MultiWinStore {
  init() {
    this.clientUrlMap = {};
    this.clientStateMap = {};

    let clients = storage.get('clients');
    if (!clients || clients.length === 0) {
      clients = [{ clientId: 'mainClient', url: '/', winState: { isMaximized: true } }];
    }
    app.on('ready', () => {
      clients.forEach(item => this.createElectronWin(item.url, item.clientId, item.winState));
    });

    this.disposable = this.stores[winManagerStoreName].onDidUpdate((state) => {
      this.setState({ clientIds: state.clientIds });
      this.saveClients(state.clientIds);
    });

    app.on('before-quit', () => {
      this.disposable.dispose();
    });
  }

  saveClients(clientIds) {
    let clients = clientIds.map(id => ({ 
      clientId: id, url: this.clientUrlMap[id], winState: this.clientStateMap[id],
    }));
    storage.set('clients', clients);
  }

  saveWinState(clientId, winState) {
    this.clientStateMap[clientId] = winState;
    this.saveClients(this.state.clientIds || []);
  }

  createElectronWin(url, clientId, params) {
    this.clientUrlMap[clientId] = url;
    let winState = new ElectronWindowState(null, params, (state) => {
      this.saveWinState(clientId, state);
    });
    this.clientStateMap[clientId] = winState.state;
    console.log('win state:', winState.state);
    let win = createElectronWin(url, clientId, winState.state);
    winState.manage(win);
    return win;
  }
}

const appStore = buildMultiWinAppStore({ todo: TodoStore, multiWin: MyMultiWinStore }, { winTodo: TodoStore });

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
