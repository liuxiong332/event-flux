import AppStore from 'event-flux/lib/AppStore';
const objectMerge = require('./utils/object-merge');
const fillShape = require('./utils/fill-shape');
const { serialize, deserialize } = require('json-immutable');
const proxyStores = require('./utils/proxy-store');
const RendererClient = require('./RendererClient');

class IDGenerator {
  constructor() {
    this.count = 0;
  }

  genID() {
    return ++this.count;
  }

  dispose(id) {
  }
}

export default class RendererAppStore extends AppStore {
  init(onMessage) {
    super.init();
    this.onMessage = onMessage;

    this.idGenerator = new IDGenerator();
    this.resolveMap = {};

    let filter = true;
    return new Promise((resolve) => {
      this.client = new RendererClient(filter, (state, store) => {
        const storeData = deserialize(state);
        const initialState = filter ? fillShape(storeData, filter) : storeData;
        this.state = initialState;

        const storeFilters = JSON.parse(store);
        let stores = proxyStores(storeFilters, (action) => {
          let invokeId = this.idGenerator.genID();
          this.client.forward(invokeId, serialize(action));
          return new Promise((resolve) => this.resolveMap[invokeId] = resolve);
        });
        this.stores = stores;
        resolve();
      }, this.handleAction.bind(this), this.handleResult.bind(this), this.handleMessage.bind(this));
    });
  }

  handleAction(action) {
    action = deserialize(action);
    const { updated, deleted } = action.payload;
    // const withDeletions = filterObject(this.state, deleted);
    if (!this.state) return;
    this.state = objectMerge(this.state, updated, deleted);
    this.sendUpdate();
  }

  handleResult(invokeId, result) {
    this.idGenerator.dispose(invokeId);
    if (result !== undefined) result = JSON.parse(result);
    this.resolveMap[invokeId](result);
  }

  handleMessage(message) {
    this.onMessage && this.onMessage(message);
  }
}