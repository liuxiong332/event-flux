import StoreBase from '../../event-flux/src/StoreBase';

const IS_WINDOW_STORE = '@@__FLUX_WIN_STORE__@@';

export default class WindowStoreBase extends StoreBase {
}

WindowStoreBase.prototype[IS_WINDOW_STORE] = true;