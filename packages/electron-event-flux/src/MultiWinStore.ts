import StoreBase from 'event-flux/lib/StoreBase';
const { winManagerStoreName } = require('./constants');

function genBrowserUrl(url = '', clientId, parentId) {
  let genUrl = new URL(url, location.href);
  if (genUrl.search) {
    genUrl.search += `&clientId=${clientId}`;
  } else {
    genUrl.search = `?clientId=${clientId}`;
  }
  genUrl.search += '&isSlave=1';
  if (parentId) genUrl.search += `&parentId=${parentId}`;
  return genUrl.toString();
}

export default class MultiWinStore extends StoreBase {
  init() {
    this.appStores[winManagerStoreName].observe((state) => {
      this.setState({ clientIds: state.clientIds });
    });

    if (typeof window === 'object') {
      window.addEventListener("beforeunload", (event) => {
        this.closeAllWindows();
      });
    }
  }

  createWin(url, parentClientId, params) {
    let clientId;
    if (typeof window === 'object') {
      clientId = this.genClientId();
      let win = this.createBrowserWin(genBrowserUrl(url, clientId, parentClientId), params);
      this._appStore.mainClient.addWin(clientId, win);
    } else {
      try {
        clientId = this.createElectronWin(url, clientId, parentClientId, params);
      } catch(err) {
        console.error(err, err.stack);
      }
    }
    return clientId;
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

  createBrowserWin(url, params: any = {}) {
    if (!params.width) params.width = 400;
    if (!params.height) params.height = 400;
    let featureStr = Object.keys(params).map(key => `${key}=${params[key]}`).join(',');
    return window.open(url, "newwindow", featureStr + ", toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no, titlebar=no");
  }

  createElectronWin(url, clientId, parentClientId, params) {
    console.error('Please provide the createElectronWin');
  }

  changeAction(clientId, action) {
    
  }

  getWinRootStore(clientId) {
    this.appStores[winManagerStoreName].winPackMapStore.get(clientId);
  }
}