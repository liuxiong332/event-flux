import AppStore from 'event-flux/lib/AppStore';
const objectMerge = require('./utils/object-merge');
const fillShape = require('./utils/fill-shape');
const { serialize, deserialize } = require('json-immutable');
const proxyStores = require('./utils/proxy-store');
const ElectronRendererClient = window.process ? require('./ElectronRendererClient') : require('./BrowserRendererClient');

export default class RendererAppStore extends AppStore {
  init() {
    super.init();
    let filter = true;
    return new Promise((resolve) => {
      this.client = new ElectronRendererClient(filter, (state, store) => {
        const storeData = deserialize(state);
        const initialState = filter ? fillShape(storeData, filter) : storeData;
        this.state = initialState;

        const storeFilters = JSON.parse(store);
        let stores = proxyStores(storeFilters, (action) => this.client.forward(serialize(action)));
        this.stores = stores;
        resolve();
      }, this.handleAction.bind(this));
    });
  }

  handleAction(action) {
    action = JSON.parse(action);
    const { updated, deleted } = action.payload;
    // const withDeletions = filterObject(this.state, deleted);
    if (!this.state) return;
    this.state = objectMerge(this.state, updated, deleted);
    this.sendUpdate();
  }
}