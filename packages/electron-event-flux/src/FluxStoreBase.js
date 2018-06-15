import StoreBase from '../../event-flux/src/StoreBase';

export default class FluxStoreBase extends StoreBase {
  init() {
    this.buildStores && this.buildStores();
  }

  dispose() {
    super.dispose();
    this.disposeStores && this.disposeStores();
  }
}