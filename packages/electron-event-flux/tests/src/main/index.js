'use strict'

import { app, BrowserWindow } from 'electron'
import * as path from 'path'
import { format as formatUrl } from 'url'
import TodoStore from './store';
// import MultiWinStore from 'electron-event-flux/lib/MultiWinStore';
// import buildMultiWinAppStore from 'electron-event-flux/lib/MainAppStore';
import MultiWinStore from '../../../src/MultiWinStore';
import buildMultiWinAppStore from '../../../src/MainAppStore';

const isDevelopment = process.env.NODE_ENV !== 'production'

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow

function createElectronWin(url, clientId) {
  return createMainWindow({ url, clientId });
}

function createMainWindow(params) {
  const window = new BrowserWindow({ show: false });

  window.on('ready-to-show', function() {
    window.show();
  });

  if (isDevelopment) {
    window.webContents.openDevTools()
  }

  if (isDevelopment) {
    console.log('port:', process.env.ELECTRON_WEBPACK_WDS_PORT)
    window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}?windowParams=${JSON.stringify(params)}`)
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
  createElectronWin(url, clientId) {
    createElectronWin(url, clientId);
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
app.on('ready', () => {
  // mainWindow = createMainWindow()
  createElectronWin(null, 'mainWin');
})
