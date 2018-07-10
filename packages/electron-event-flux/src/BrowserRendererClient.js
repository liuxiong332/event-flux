const { renderDispatchName, renderRegisterName, mainDispatchName, mainInitName, mainReturnName } = require('./constants');

module.exports = class BrowserRendererClient {
  constructor(filter, callback, onGetAction, onGetResult) {
    let clientId = window.clientId || 'mainClient';
        
    let mainWin = window.isMainClient ? window : window.parent;
    mainWin.postMessage({ action: renderRegisterName, data: { filter, clientId } }, '*');
    window.addEventListener('message', (event) => {
      let { action, data, invokeId } = event.data || {};
      if (action === mainInitName) {
        callback(data[0], data[1]);
      } else if (action === mainDispatchName) {
        onGetAction(data);
      } else if (action === mainReturnName) {
        onGetResult(invokeId, data);
      }
    });
    window.addEventListener('unload', () => {
      mainWin.postMessage({ action: 'close' });
    });
  }

  // Forward update to the main process so that it can forward the update to all other renderers
  forward(invokeId, action) {
    let mainWin = window.isMainClient ? window : window.parent;
    mainWin.postMessage({ action: renderDispatchName, data: action, invokeId }, '*');
  }
}
