const { globalName, mainReturnName, renderDispatchName } = require('./constants');
const { ipcMain } = require('electron');

module.exports = class ElectronMainClient {
  constructor(callbacks) {
    let clients = {}; // webContentsId -> {webContents, filter, clientId, windowId, active}

    // Need to keep track of windows, as when a window refreshes it creates a new
    // webContents, and the old one must be unregistered
    let windowMap = {}; // windowId -> webContentsId
  
    // Cannot delete data, as events could still be sent after close
    // events when a BrowserWindow is created using remote
    let unregisterRenderer = (webContentsId) => {
      clients[webContentsId] = { active: false };
      callbacks.deleteWin(clients[webContentsId].clientId);
    };
    this.unregisterRenderer = unregisterRenderer;
  
    ipcMain.on(renderRegisterName, ({ sender }, { filter, clientId }) => {
      let webContentsId = sender.getId();
      clients[webContentsId] = {
        webContents: sender,
        filter,
        clientId,
        windowId: sender.getOwnerBrowserWindow().id,
        active: true
      };
      callbacks.addWin(clientId);
  
      if (!sender.isGuest()) { // For windowMap (not webviews)
        let browserWindow = sender.getOwnerBrowserWindow();
        if (windowMap[browserWindow.id] !== undefined) { // Occurs on window reload
          unregisterRenderer(windowMap[browserWindow.id]);
        }
        windowMap[browserWindow.id] = webContentsId;
  
        // Webcontents aren't automatically destroyed on window close
        browserWindow.on('closed', () => unregisterRenderer(webContentsId));
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
    this.clients = clients;
  }
  
  getForwardClients() {
    let clients = this.clients;
    let clientInfo = [];
    for (let webContentsId in clients) {
      if (!clients[webContentsId].active) continue;

      let webContents = clients[webContentsId].webContents;

      if (webContents.isDestroyed() || webContents.isCrashed()) {
        this.unregisterRenderer(webContentsId);
        continue;
      }
      clientInfo.push(clients[webContentsId]);
    }
    return clientInfo;
  }

  sendToRenderer(client, payload) {
    let webContents = client.webContents;
    webContents.send(mainDispatchName, payload);
  }
}