import StoreBase from 'event-flux/lib/StoreBase';
const { winManagerStoreName } = require('./constants');

function genBrowserUrl(url = '', clientId) {
  let genUrl = new URL(url, location.href);
  if (genUrl.search) {
    genUrl.search += `&clientId=${clientId}`;
  } else {
    genUrl.search = `?clientId=${clientId}`;
  }
  genUrl.search += '&isSlave=1';
  return genUrl.toString();
}

export default class MultiWinStore extends StoreBase {
  init() {
    this.stores[winManagerStoreName].observe((state) => {
      this.setState({ clientIds: state.clientIds });
    });
  }

  createWin(url, clientId, params) {
    clientId = clientId || this.genClientId();
    if (typeof window === 'object') {
      let win = this.createBrowserWin(genBrowserUrl(url, clientId), params);
      return this._appStore.mainClient.addWin(clientId, win);
    }
    return this.createElectronWin(url, clientId, params);
  }

  genClientId() {
    let clientId = 'win' + Math.floor(Math.random() * 10000);
    if (this.state.clientIds.indexOf(clientId) !== -1) {
      return this.genClientId();
    }
    return clientId;
  }

  closeAllWindows() {
    this._appStore.mainClient.closeAllWindows();
  }

  createBrowserWin(url, params = {}) {
    if (!params.width) params.width = 400;
    if (!params.height) params.height = 400;
    let featureStr = Object.keys(params).map(key => `${key}=${params[key]}`).join(',');
    return window.open(url, "newwindow", featureStr + ", toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no, titlebar=no");
  }

  createElectronWin(url, clientId, params) {
    console.error('Please provide the createElectronWin');
  }
}