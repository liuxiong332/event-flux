const { renderRegisterName, renderDispatchName, mainDispatchName, mainInitName } = require('./constants');

module.exports = class ElectronMainClient {
  constructor(callbacks) {
    this.clients = {};
    this.clientIds = [];
    window.isMainClient = true;

    this.addWin('mainClient', window);
  }
  
  addWin(clientId, window) {
    window.addEventListener("message", (event) => {
      let { action, data } = JSON.parse(event.data);
      if (action === renderDispatchName) {
        callbacks.handleRendererMessage(data);
      } else if (action === 'close') {       // Child window has closed
        let index = this.clientIds.indexOf(clientId);
        if (index !== -1) this.clientIds.splice(index, 1);
        this.clients[clientId] = null;
        this.callbacks.deleteWin(clientId);
      } else if (action === renderRegisterName) {
        let { filter, clientId } = data;
        callbacks.addWin(clientId);
        this.clients[clientId] = window;
        this.clientIds.push(clientId);
        window.postMessage(JSON.stringify({
          action: mainInitName,
          data: [callbacks.getStores(clientId), callbacks.getInitStates(clientId)],
        }));
      }
    });
  }

  getForwardClients() {
    return this.clientIds;
  }

  sendToRenderer(clientId, payload) {
    let window = this.clients[clientId];
    window && window.postMessage(JSON.stringify({ action: mainDispatchName, data: payload }));
  }
}