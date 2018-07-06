import StoreBase from '../../event-flux/src/StoreBase';
const { declareStoreMap } = require('./StoreDeclarer');

export class WinPackStore extends StoreBase {}

export default class MultiWinManagerStore extends StoreBase {
  constructor() {
    super();
    this.state = { clientIds: [] };
  }

  addWin(winId) {
    this.setState({ clientIds: [ ...this.state.clientIds, winId ] });
    this.winPackMapStore.add(winId);
  }

  deleteWin(winId) {
    let { clientIds } = this.state;
    let index = clientIds.indexOf(winId);
    if (index !== -1) this.setState({ 
      clientIds: [ ...clientIds.slice(0, index), ...clientIds.slice(index + 1) ]
    });
    this.winPackMapStore.delete(winId);
  }
}
MultiWinManagerStore.innerStores = { winPackMap: declareStoreMap(WinPackStore) };