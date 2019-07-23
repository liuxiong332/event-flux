const { 
  mainInitName, renderRegisterName, renderDispatchName, mainDispatchName, mainReturnName, winMessageName, messageName
} = require('./constants');
const { ipcRenderer, remote } = require('electron');

export default class ElectronRendererClient {
  clientId: any;

  constructor(filter, callback, onGetAction, onGetResult, onGetMessage, onGetWinMessage, onInitWindow) {
    let clientId = (window as any).clientId;
    if (!clientId) {
      const rendererId = (process as any).guestInstanceId || remote.getCurrentWindow().id;
      clientId = (process as any).guestInstanceId ? `webview ${rendererId}` : `window ${rendererId}`;
    }
    this.clientId = clientId;
    
    // Allows the main process to forward updates to this renderer automatically
    ipcRenderer.send(renderRegisterName, { filter: filter, clientId });
  
    // Dispatches from other processes are forwarded using this ipc message
    ipcRenderer.on(mainInitName, (event, storeFilters, stateData) => {
      callback(stateData, storeFilters);
    });
    ipcRenderer.on(mainDispatchName, (event, stringifiedAction) => {
      onGetAction(stringifiedAction);
    });
    ipcRenderer.on(mainReturnName, (event, invokeId, error, result) => {
      onGetResult(invokeId, error, result);
    });
    ipcRenderer.on(messageName, (event, params) => {
      onGetMessage(params);
    });
    ipcRenderer.on(winMessageName, (event, senderId, params) => {
      onGetWinMessage(senderId, params);
    });

    ipcRenderer.on("__INIT_WINDOW__", (event, params) => {
      onInitWindow(params);
    });
  }

  // Forward update to the main process so that it can forward the update to all other renderers
  forward(invokeId, action) {
    ipcRenderer.send(renderDispatchName, this.clientId, invokeId, action);
  }

  sendMessage(args) {
    ipcRenderer.send(messageName, args);
  }

  sendWindowMessage(clientId, args) {
    ipcRenderer.send(winMessageName, clientId, args);
  }
}
