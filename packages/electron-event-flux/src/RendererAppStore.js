import AppStore from '../../event-flux/src/AppStore';
const { ipcRenderer, remote } = require('electron');
const { globalName } = require('./constants');
const objectMerge = require('./utils/object-merge');
const fillShape = require('./utils/fill-shape');
const { serialize, deserialize } = require('json-immutable');
const isEmpty = require('lodash/isEmpty');

/* Gen proxy for the storePath such as [todoMapStore, todoStore] 
  forwardStore standard for the forward path
*/
function genProxy(storePath, forwardStore, forwarder) {
  return new Proxy(forwarder, {
    get: function(target, propName) {
      if (!propName) return;
      if (forwardStore && forwardStore[propName]) return forwardStore[name];
      return function(...args) {
        forwarder({ store: storePath, method: propName, args });
      };
    }
  })
}

function proxyStores(parentStore, storeFilters, forwarder) {
  if (isEmpty(storeFilters)) return null;
  let stores = {};
  for (let name in storeFilters) {
    let { type, filters } = storeFilters[name];
    let names;
    if (type === 'Store') {
      names = [...parentStore, name];
    } else if (type === 'StoreList') {
      names = [...parentStore, { name, type: 'List' }];
    } else if (type === 'StoreMap') {
      names = [...parentStore, { name, type: 'Map' }];
    }
    let childStores = proxyStores(names, filters, forwarder);
    stores[name] = genProxy(names, childStores, forwarder);
  }
  return stores;
}

function storeEnhancer(onGetAction, filter = true) {
  const rendererId = process.guestInstanceId || remote.getCurrentWindow().id;
  const clientId = process.guestInstanceId ? `webview ${rendererId}` : `window ${rendererId}`;

  // Allows the main process to forward updates to this renderer automatically
  ipcRenderer.send(`${globalName}-register-renderer`, { filter: filter, clientId });

  // Get current from the electronEnhanced store in the browser through the global it creates
  let getStores = remote.getGlobal(globalName + 'Stores');
  const storeFilters = getStores();

  let getInitialState = remote.getGlobal(globalName);
  if (!getInitialState) throw new Error('Could not find electronEnhanced store in main process');
  const storeData = deserialize(getInitialState());
  const initialState = filter ? fillShape(storeData, filter) : storeData;

  // Forward update to the main process so that it can forward the update to all other renderers
  const forwarder = (action) =>
      ipcRenderer.send(`${globalName}-renderer-dispatch`, clientId, serialize(action));

  // Dispatches from other processes are forwarded using this ipc message
  ipcRenderer.on(`${globalName}-browser-dispatch`, (event, stringifiedAction) => {
    const action = JSON.parse(stringifiedAction);
    onGetAction(action);
  });

  let stores = {};
  storeFilters.forEach(name => {
    stores[name] = new Proxy(forwarder, {
      get: function(target, propName) {
        if (!propName) return;
        return function(...args) {
          forwarder({ store: name, method: propName, args });
        };
      }
    })
  });
  return { stores, initialState };
}

export default class RendererAppStore extends AppStore {
  init() {
    super.init();
    let { initialState, stores } = storeEnhancer(this.handleAction.bind(this));
    this.state = initialState;
    this.stores = stores;
  }

  handleAction(action) {
    const { updated, deleted } = action.payload;
    // const withDeletions = filterObject(this.state, deleted);
    this.state = objectMerge(this.state, updated, deleted);
    const util = require('util')
    console.log(util.inspect(this.state, {showHidden: false, depth: null}))
    this.sendUpdate();
  }
}