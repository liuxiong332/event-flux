const { globalName, mainDispatchName, mainReturnName, renderDispatchName, renderRegisterName } = require('./constants');
const { ipcMain } = require('electron');
const findIndex = require('lodash/findIndex');

module.exports = class ElectronMainClient {
  constructor(callbacks) {
    let clientInfos = []; // webContentsId -> {webContents, filter, clientId, windowId, active}

    // Need to keep track of windows, as when a window refreshes it creates a new
    // webContents, and the old one must be unregistered
  
    // Cannot delete data, as events could still be sent after close
    // events when a BrowserWindow is created using remote
    let unregisterRenderer = (clientId) => {
      let existIndex = findIndex(clientInfos, (item) => item.clientId === clientId);
      if (existIndex !== -1) {
        clientInfos.splice(existIndex, 1);
        callbacks.deleteWin(clientId);
      }
    };
    this.unregisterRenderer = unregisterRenderer;
  
    ipcMain.on(renderRegisterName, ({ sender }, { filter, clientId }) => {
      let existIndex = findIndex(clientInfos, (item) => item.clientId === clientId);
      if (existIndex !== -1) {
        unregisterRenderer(clientId);        
      }
  
      clientInfos.push({
        webContents: sender,
        filter,
        clientId,
        window: sender.getOwnerBrowserWindow(),
        active: true
      });
      callbacks.addWin(clientId);

      if (!sender.isGuest()) { // For windowMap (not webviews)
        let browserWindow = sender.getOwnerBrowserWindow();
        
        // Webcontents aren't automatically destroyed on window close
        browserWindow.on('closed', () => unregisterRenderer(clientId));
      }
    });
  
    // Give renderers a way to sync the current state of the store, but be sure we don't
    // expose any remote objects. In other words, we need to rely exclusively on primitive
    // data types, Arrays, or Buffers. Refer to:
    // https://github.com/electron/electron/blob/master/docs/api/remote.md#remote-objects
  
    global[globalName + 'Stores'] = function(clientId) {
      return callbacks.getStores(clientId);
    }
  
    global[globalName] = (clientId) => {
      return callbacks.getInitStates(clientId);
    }
  
    ipcMain.on(renderDispatchName, (event, clientId, stringifiedAction) => {
      let result = callbacks.handleRendererMessage(stringifiedAction);
      // ipcMain.send(mainReturnName, result);
    });
    this.clientInfos = clientInfos;
  }
  
  getForwardClients() {
    return this.clientInfos;
  }

  sendToRenderer(client, payload) {
    let webContents = client.webContents;
    if (webContents.isDestroyed() || webContents.isCrashed()) {
      return this.unregisterRenderer(client.clientId);
    }
    webContents.send(mainDispatchName, payload);
  }

  closeAllWindows() {
    this.clientInfos.forEach(client => client.window.close());
  }
}