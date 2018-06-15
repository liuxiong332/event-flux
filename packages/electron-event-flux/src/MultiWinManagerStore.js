import StoreBase from './FluxStoreBase';

class MultiWinManagerStore extends StoreBase {
  constructor() {
    super();
    this.winIds = [];
  }

  addWin(winId) {
    this.winIds.push(winId);
  }

  deleteWin(winId) {
    let index = this.winIds.indexOf(winId);
    if (index !== -1) this.winIds.splice(index, 1);
  }
}