import AppStore from 'event-flux/lib/AppStore';
import objectMerge from './utils/objectMerge';
import { serialize, deserialize } from 'json-immutable-bn';
import StoreProxyHandler from './utils/StoreProxyHandler';
import RendererClient from './RendererClient';
import { Emitter } from 'event-kit';
import { filterOneStore } from './utils/filterStore';
import loggerApply, { Log } from './utils/loggerApply';

class IDGenerator {
  count = 0;

  genID() {
    return ++this.count;
  }

  dispose(id) {
  }
}

export class RendererAppStore extends AppStore {
  emitter: Emitter;
  client: any;
  idGenerator = new IDGenerator();
  resolveMap = {};
  storeShape: any;
  storeProxyHandler = new StoreProxyHandler();

  storeResolve: () => void;
  winInitParams: any;
  log: Log;

  static innerStores;

  constructor(log: Log) {
    super();
    this.log = log;
  }

  asyncInit() {
    super.init();
    this.emitter = new Emitter();

    let filter = true;

    // 先初始化，防止由于promise的异步 漏掉某些消息
    this.client = new RendererClient(
      filter,
      this.handleStorePromise, 
      this.handleAction.bind(this), 
      this.handleResult.bind(this), 
      this.handleMessage.bind(this),
      this.handleWinMessage.bind(this),
      this.handleInitWindow.bind(this)
    );
    return new Promise((resolve) => {
      this.storeResolve = resolve;
    });
  }

  handleStorePromise = (state, store) => {
    this.handleStore(this.storeResolve, true, state, store);
  };

  handleStore(resolve, filter, state, store) {
    const storeData = deserialize(state);
    const initialState = storeData;
    this.state = initialState;

    const storeFilters = JSON.parse(store);
    let stores = this.storeProxyHandler.proxyStores(storeFilters, (action) => {
      let invokeId = this.idGenerator.genID();
      this.client.forward(invokeId, serialize(action));
      return new Promise((resolve, reject) => this.resolveMap[invokeId] = {resolve, reject});
    });
    this.stores = stores;
    this.initRenderStores();
    resolve();
  }

  handleAction(action) {
    action = deserialize(action);
    const { updated, deleted } = action.payload;
    // const withDeletions = filterObject(this.state, deleted);
    if (!this.state) return;
    this.state = objectMerge(this.state, updated, deleted);
    this.batchUpdater.requestUpdate();
  }

  handleResult(invokeId, error, result) {
    this.idGenerator.dispose(invokeId);
    let {resolve, reject} = this.resolveMap[invokeId];
    this.resolveMap[invokeId] = null;
    if (error) {
      reject(error);
    } else {
      // if (result !== undefined) result = JSON.parse(result);
      resolve(result);
    }
  }

  handleMessage(message) {
    this.emitter.emit('did-message', message);
  }

  handleWinMessage(senderId, message) {
    this.emitter.emit('did-win-message', {senderId, message});
  }

  handleInitWindow(params) {
    this.winInitParams = params;
    this.emitter.emit('did-init-window', params);
    this.log((logger) => logger("RendererAppStore", "init window", params))
  }

  observeInitWindow(callback) {
    if (this.winInitParams) {
      callback(this.winInitParams);
    } else {
      this.emitter.on('did-init-window', callback);
    }
  }

  sendWindowMessage(clientId, args) {
    this.client.sendWindowMessage(clientId, args);
  }

  onDidMessage(callback) {
    return this.emitter.on('did-message', callback);
  }

  onDidClose(callback) {
    return this.emitter.on('did-message', (message) => {
      if (message && message.action === 'did-close') callback();
    });
  }

  onDidWinMessage(callback) {
    return this.emitter.on('did-win-message', callback);
  }

  initRenderStores() {
    this.buildStores();
    this.initStores(this);
    this.startObserve();
  }

  getStore(key) {
    return this.stores[key]
  }

  setStore(key, store) {
    return this.stores[key] = store;
  }

  // 构建子Stores
  buildStores() {}
  // 初始化子Stores
  initStores(parent) {}
  // 开始监听子Store改变
  startObserve() {}
}

export default function buildRendererAppStore(stores, onChange, logger) {
  RendererAppStore.innerStores = stores;
  const storeShape = filterOneStore(RendererAppStore);
  const appStore = new RendererAppStore(loggerApply(logger));
  appStore.onDidChange(onChange);
  appStore.storeShape = storeShape;
  return appStore;
}