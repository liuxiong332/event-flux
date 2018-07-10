const { renderDispatchName, renderRegisterName, mainDispatchName, mainInitName } = require('./constants');

module.exports = class BrowserRendererClient {
  constructor(filter, callback, onGetAction) {
    let clientId = window.clientId || 'mainClient';
        
    let mainWin = window.isMainClient ? window : window.parent;
    mainWin.postMessage({ action: renderRegisterName, data: { filter, clientId } }, '*');
    window.addEventListener('message', (event) => {
      let { action, data } = event.data || {};
      if (action === mainInitName) {
        callback(data[0], data[1]);
      } else if (action === mainDispatchName) {
        onGetAction(data);
      }
    });
    window.addEventListener('unload', () => {
      mainWin.postMessage({ action: 'close' });
    });
  }

  // Forward update to the main process so that it can forward the update to all other renderers
  forward(action) {
    let mainWin = window.isMainClient ? window : window.parent;
    mainWin.postMessage({ action: renderDispatchName, data: action }, '*');
  }
}
