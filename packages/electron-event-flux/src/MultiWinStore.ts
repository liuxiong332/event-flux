import StoreBase from './StoreBase';
const { winManagerStoreName } = require('./constants');

function genBrowserUrl(url = '', clientId: string, parentId: string) {
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
  // namedWinId to clientId map
  namedWinIdMap: { [winId: string]: string } = {};
  // clientId to namedWinId map
  clientNamedWinIdMap: { [winId: string]: string } = {};

  init() {
    this.appStores[winManagerStoreName].observe((state) => {
      this.setState({ clientIds: state.clientIds });
    });

    if (typeof window === 'object') {
      window.addEventListener("message", (event) => {
        let { action, clientId } = event.data || {} as any;
        if (action === 'close') {
          let winId = this.clientNamedWinIdMap[clientId];
          if (winId) {
            delete this.clientNamedWinIdMap[clientId]
            delete this.namedWinIdMap[winId];
          }
        }
      });
      window.addEventListener("beforeunload", (event) => {
        this.closeAllWindows();
      });
    }
  }

  createWin(url: string, parentClientId: string, params: any) {
    let clientId;
    if (typeof window === 'object') {
      clientId = this.genClientId();
      let win = this.createBrowserWin(genBrowserUrl(url, clientId, parentClientId), clientId, params);
      (this._appStore! as any).mainClient.addWin(clientId, win);
    } else {
      try {
        clientId = this.createElectronWin(url, clientId, parentClientId, params);
      } catch(err) {
        console.error(err, err.stack);
      }
    }
    return clientId;
  }

  // Create new win if the specific winId is not exists
  createOrOpenWin(winId: string, url: string, parentClientId: string, params: any) {
    if (!this.namedWinIdMap[winId]) {
      let clientId = this.createWin(url, parentClientId, params);
      this.namedWinIdMap[winId] = clientId;
      this.clientNamedWinIdMap[clientId] = winId;
      return clientId;
    } else {
      let clientId = this.namedWinIdMap[winId];
      this.changeClientAction(clientId, url);
      this.activeWindow(clientId);
      return clientId;
    }
  }
  
  sendWinMsg(winId: string, message: any) {
    this._appStore.mainClient.sendMessageByClientId(winId, message);
  }

  genClientId(): string {
    let clientId = 'win' + Math.floor(Math.random() * 10000);
    if (this.state.clientIds.indexOf(clientId) !== -1) {
      return this.genClientId();
    }
    return clientId;
  }

  closeAllWindows() {
    this._appStore.mainClient.closeAllWindows();
    this.namedWinIdMap = {};
    this.clientNamedWinIdMap = {};
  }

  createBrowserWin(url, clientId, params: any = {}) {
    if (!params.width) params.width = 400;
    if (!params.height) params.height = 400;
    let featureStr = Object.keys(params).map(key => `${key}=${params[key]}`).join(',');
    let childWin = window.open(url, "newwindow", featureStr + ", toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no, titlebar=no");
    return childWin;
  }

  createElectronWin(url, clientId, parentClientId, params) {
    console.error('Please provide the createElectronWin');
  }

  actionChanged(clientId, action) {
    
  }

  changeClientAction(clientId, url) {
    this._appStore.mainClient.changeClientAction(clientId, { url });
  }

  getWinRootStore(clientId) {
    return this.appStores[winManagerStoreName].winPackMapStore.get(clientId);
  }

  activeWindow(clientId) {}
}