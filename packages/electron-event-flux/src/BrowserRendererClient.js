const { renderDispatchName, renderRegisterName, mainDispatchName, mainInitName } = require('./constants');

module.exports = class BrowserRendererClient {
  constructor(filter, callback, onGetAction) {
    let clientId = window.clientId;
        
    let mainWin = window.isMainClient ? window : window.parent;
    mainWin.postMessage(JSON.stringify({ action: renderRegisterName, data: { filter, clientId } }));
    window.addEventListener('message', (event) => {
      let { action, data } = JSON.parse(event.data);
      if (action === mainInitName) {
        callback(data[0], data[1]);
      } else if (action === mainDispatchName) {
        onGetAction(data);
      }
    });
  }

  // Forward update to the main process so that it can forward the update to all other renderers
  forward(action) {
    let mainWin = window.isMainClient ? window : window.parent;
    mainWin.postMessage(JSON.stringify({ action: renderDispatchName, data: action }));
  }
}
