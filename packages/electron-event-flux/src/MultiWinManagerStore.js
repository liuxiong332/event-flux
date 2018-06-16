import StoreBase from './FluxStoreBase';
const { declareStoreMap } = require('./StoreDeclarer');

export class WinPackStore extends StoreBase {}

export default class MultiWinManagerStore extends StoreBase {

  addWin(winId) {
    console.log('add win', winId)
    this.winPackMapStore.add(winId);
  }

  deleteWin(winId) {
    this.winPackMapStore.delete(winId);
  }
}
MultiWinManagerStore.innerStores = { winPackMap: declareStoreMap(WinPackStore) };