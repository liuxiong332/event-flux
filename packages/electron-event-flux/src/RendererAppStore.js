import AppStore from '../../event-flux/AppStore';
const { ipcRenderer, remote } = require('electron');
const { globalName } = require('./constants');
const objectMerge = require('./utils/object-merge');
const fillShape = require('./utils/fill-shape');
const setupStore = require('./setup-electron-store');

function storeEnhancer(onGetAction, filter) {
  const rendererId = process.guestInstanceId || remote.getCurrentWindow().id;
  const clientId = process.guestInstanceId ? `webview ${rendererId}` : `window ${rendererId}`;

  // Allows the main process to forward updates to this renderer automatically
  ipcRenderer.send(`${globalName}-register-renderer`, { filter: filter, clientId });

  // Get current from the electronEnhanced store in the browser through the global it creates
  let getStores = remote.getGlobal(globalName + 'Stores');
  const storeNames = getStores();

  let getInitialState = remote.getGlobal(globalName);
  if (!getInitialState) throw new Error('Could not find electronEnhanced store in main process');
  const storeData = JSON.parse(getInitialState());
  const initialState = filter ? fillShape(storeData, filter) : storeData;

  // Forward update to the main process so that it can forward the update to all other renderers
  const forwarder = (action) =>
      ipcRenderer.send(`${globalName}-renderer-dispatch`, clientId, JSON.stringify(action));

  // Dispatches from other processes are forwarded using this ipc message
  ipcRenderer.on(`${globalName}-browser-dispatch`, (event, stringifiedAction) => {
    const action = JSON.parse(stringifiedAction);
    onGetAction(action);
  });

  let stores = {};
  storeNames.forEach(name => {
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

class RendererAppStore extends AppStore {
  init() {
    super.init();
    let { initialState, stores } = storeEnhancer(this.handleAction);
    this.state = initialState;
    this.stores = stores;
  }

  handleAction = (action) => {
    const { updated, deleted } = action.payload;
    const withDeletions = filterObject(this.state, deleted);
    this.state = objectMerge(withDeletions, updated);
    if (this._init) {
      if (this._enableUpdate) {
        this.onChange(this.state);
      } else {
        this._needUpdate = true;
      }
    }
  }
}