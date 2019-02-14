import StoreBase from './MainStoreBase';
import { declareStoreMap } from './StoreDeclarer';

export class WinPackStore extends StoreBase {
  getSubStores: Function;

  destroy() {
    (this.getSubStores() || []).map(store => {
      store.destroy && store.destroy();
    });
  }
}

export default class MultiWinManagerStore extends StoreBase {
  winPackMapStore: any;
  
  constructor() {
    super();
    this.state = { clientIds: [] };
  }

  addWin(winId) {
    let { clientIds } = this.state;
    if (clientIds.indexOf(winId) === -1) {
      this.emitter.emit('did-add-win', winId);
      this.setState({ clientIds: [ ...clientIds, winId ] });
      this.winPackMapStore.add(winId, (store) => {
        store.clientId = winId;
      });
    }
  }

  deleteWin(winId) {
    let { clientIds } = this.state;
    let index = clientIds.indexOf(winId);
    if (index !== -1) {
      this.emitter.emit('did-remove-win', winId);
      this.setState({ 
        clientIds: [ ...clientIds.slice(0, index), ...clientIds.slice(index + 1) ]
      });
    }
    if (!this._appStore.willQuit) {
      this.winPackMapStore.get(winId).destroy();
    }
    this.winPackMapStore.delete(winId);
  }

  getClienIds() {
    return this.state.clientIds;
  }

  onDidAddWin(callback) {
    return this.emitter.on('did-add-win', callback);
  }

  onDidRemoveWin(callback) {
    return this.emitter.on('did-remove-win', callback);
  }
}

MultiWinManagerStore.innerStores = {
  winPackMap: declareStoreMap(WinPackStore, {
    defaultFilter: true, storeDefaultFilter: true 
  })
};