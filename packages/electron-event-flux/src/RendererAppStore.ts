import AppStore from 'event-flux/lib/AppStore';
import objectMerge from './utils/objectMerge';
import fillShape from './utils/fillShape';
import { serialize, deserialize } from 'json-immutable';
import proxyStores from './utils/proxyStore';
import RendererClient from './RendererClient';
import { Emitter } from 'event-kit';
import BrowserRendererClient from './BrowserRendererClient';

class IDGenerator {
  count = 0;

  genID() {
    return ++this.count;
  }

  dispose(id) {
  }
}

export default class RendererAppStore extends AppStore {
  emitter: Emitter;
  client: any;
  idGenerator = new IDGenerator();
  resolveMap = {};

  asyncInit() {
    super.init();
    this.emitter = new Emitter();

    let filter = true;
    return new Promise((resolve) => {
      this.client = new RendererClient(
        filter,
        this.handleStore.bind(this, resolve, filter), 
        this.handleAction.bind(this), 
        this.handleResult.bind(this), 
        this.handleMessage.bind(this),
        this.handleWinMessage.bind(this)
      );
    });
  }

  handleStore(resolve, filter, state, store) {
    const storeData = deserialize(state);
    const initialState = filter ? fillShape(storeData, filter) : storeData;
    this.state = initialState;

    const storeFilters = JSON.parse(store);
    let stores = proxyStores(storeFilters, (action) => {
      let invokeId = this.idGenerator.genID();
      this.client.forward(invokeId, serialize(action));
      return new Promise((resolve, reject) => this.resolveMap[invokeId] = {resolve, reject});
    });
    this.stores = stores;
    resolve();
  }

  handleAction(action) {
    action = deserialize(action);
    const { updated, deleted } = action.payload;
    // const withDeletions = filterObject(this.state, deleted);
    if (!this.state) return;
    this.state = objectMerge(this.state, updated, deleted);
    this.sendUpdate();
  }

  handleResult(invokeId, error, result) {
    this.idGenerator.dispose(invokeId);
    let {resolve, reject} = this.resolveMap[invokeId];
    if (error) {
      reject(error);
     } else {
      // if (result !== undefined) result = JSON.parse(result);
      resolve(result);
     }
    this.resolveMap[invokeId] = null;
  }

  handleMessage(message) {
    this.emitter.emit('did-message', message);
  }

  handleWinMessage(senderId, message) {
    this.emitter.emit('did-win-message', {senderId, message});
  }

  sendWindowMessage(clientId, args) {
    this.client.sendWindowMessage(clientId, args);
  }

  onDidMessage(callback) {
    return this.emitter.on('did-message', callback);
  }

  onDidWinMessage(callback) {
    return this.emitter.on('did-win-message', callback);
  }
}