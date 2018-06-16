'use strict'

import { app, BrowserWindow } from 'electron'
import * as path from 'path'
import { format as formatUrl } from 'url'
import './store';

const isDevelopment = process.env.NODE_ENV !== 'production'

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow

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
  let count = 0;
  createMainWindow({ id: count++ });
  global.createMainWindow = () => createMainWindow({ id: count++ });
})
