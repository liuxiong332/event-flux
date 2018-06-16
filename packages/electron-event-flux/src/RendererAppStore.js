import AppStore from '../../event-flux/src/AppStore';
const { ipcRenderer, remote } = require('electron');
const { globalName } = require('./constants');
const objectMerge = require('./utils/object-merge');
const fillShape = require('./utils/fill-shape');
const { serialize, deserialize } = require('json-immutable');
const proxyStores = require('./utils/proxy-store');

function storeEnhancer(onGetAction, filter = true) {
  const rendererId = process.guestInstanceId || remote.getCurrentWindow().id;
  const clientId = process.guestInstanceId ? `webview ${rendererId}` : `window ${rendererId}`;

  // Allows the main process to forward updates to this renderer automatically
  ipcRenderer.send(`${globalName}-register-renderer`, { filter: filter, clientId });

  // Get current from the electronEnhanced store in the browser through the global it creates
  let getStores = remote.getGlobal(globalName + 'Stores');
  const storeFilters = getStores(clientId);
  const util = require('util')
  console.log(util.inspect(storeFilters, {showHidden: false, depth: null}))

  let getInitialState = remote.getGlobal(globalName);
  if (!getInitialState) throw new Error('Could not find electronEnhanced store in main process');
  const storeData = deserialize(getInitialState(clientId));
  const initialState = filter ? fillShape(storeData, filter) : storeData;

  // Forward update to the main process so that it can forward the update to all other renderers
  const forwarder = (action) =>
      ipcRenderer.send(`${globalName}-renderer-dispatch`, clientId, serialize(action));

  // Dispatches from other processes are forwarded using this ipc message
  ipcRenderer.on(`${globalName}-browser-dispatch`, (event, stringifiedAction) => {
    const action = JSON.parse(stringifiedAction);
    onGetAction(action);
  });

  let stores = proxyStores(storeFilters, forwarder);
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