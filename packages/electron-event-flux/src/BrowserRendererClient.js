const { 
  renderDispatchName, renderRegisterName, mainDispatchName, mainInitName, mainReturnName, winMessageName, messageName 
} = require('./constants');

module.exports = class BrowserRendererClient {
  constructor(filter, callback, onGetAction, onGetResult, onGetMessage) {
    let clientId = window.clientId || 'mainClient';
    this.clientId = clientId;
        
    let mainWin = window.isMainClient ? window : window.opener;
    mainWin.postMessage({ action: renderRegisterName, clientId, data: { filter } }, '*');
    window.addEventListener('message', (event) => {
      let { action, error, data, invokeId } = event.data || {};
      if (action === mainInitName) {
        callback(data[0], data[1]);
      } else if (action === mainDispatchName) {
        onGetAction(data);
      } else if (action === mainReturnName) {
        onGetResult(invokeId, error, data);
      } else if (action === messageName) {
        onGetMessage(data);
      }
    });
    window.addEventListener('unload', () => {
      mainWin.postMessage({ action: 'close', clientId });
    });
  }

  // Forward update to the main process so that it can forward the update to all other renderers
  forward(invokeId, action) {
    let clientId = this.clientId;
    let mainWin = window.isMainClient ? window : window.opener;
    mainWin.postMessage({ action: renderDispatchName, data: action, invokeId, clientId }, '*');
  }

  sendMessage(args) {
    let mainWin = window.isMainClient ? window : window.opener;
    mainWin.postMessage({ action: messageName, data: args }, '*');
  }

  sendWindowMessage(clientId, args) {
    let mainWin = window.isMainClient ? window : window.opener;
    mainWin.postMessage({ action: winMessageName, clientId, data: args }, '*');
  }
}
