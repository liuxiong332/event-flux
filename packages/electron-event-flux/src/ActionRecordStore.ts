import StoreBase from './StoreBase';
const { winManagerStoreName, winManagerKey } = require('./constants');

export default class ActionRecordStore extends StoreBase {
  clientId: string = '';

  setAction(action: string) {
    // this.appStores.multiWinStore.actionChanged(this.clientId, action);
  }
}