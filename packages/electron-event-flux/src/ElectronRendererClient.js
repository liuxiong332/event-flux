const { globalName, renderRegisterName, renderDispatchName, mainDispatchName, mainReturnName } = require('./constants');
const { ipcRenderer, remote } = require('electron');
const { serialize, deserialize } = require('json-immutable');

module.exports = class ElectronRendererClient {
  constructor(filter, callback, onGetAction, onGetResult, onGetMessage) {
    let clientId = window.clientId;
    if (!clientId) {
      const rendererId = process.guestInstanceId || remote.getCurrentWindow().id;
      clientId = process.guestInstanceId ? `webview ${rendererId}` : `window ${rendererId}`;
    }
    this.clientId = clientId;
    
    // Allows the main process to forward updates to this renderer automatically
    ipcRenderer.send(renderRegisterName, { filter: filter, clientId });
  
    // Get current from the electronEnhanced store in the browser through the global it creates
    let getStores = remote.getGlobal(globalName + 'Stores');
    const storeFilters = getStores(clientId);
    // const util = require('util')
    // console.log(util.inspect(storeFilters, {showHidden: false, depth: null}))
  
    let getInitialState = remote.getGlobal(globalName);
    if (!getInitialState) throw new Error('Could not find electronEnhanced store in main process');
    const stateData = getInitialState(clientId);
  
    callback(stateData, storeFilters);
    
    // Dispatches from other processes are forwarded using this ipc message
    ipcRenderer.on(mainDispatchName, (event, stringifiedAction) => {
      onGetAction(stringifiedAction);
    });
    ipcRenderer.on(mainReturnName, (event, invokeId, result) => {
      onGetResult(invokeId, result);
    });
    ipcRenderer.on('message', (event, params) => {
      onGetMessage(params);
    });
  }

  // Forward update to the main process so that it can forward the update to all other renderers
  forward(invokeId, action) {
    ipcRenderer.send(renderDispatchName, this.clientId, invokeId, action);
  }
}
