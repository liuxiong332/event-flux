import StoreBase from 'event-flux/lib/StoreBase';
const { winManagerStoreName, winManagerKey } = require('./constants');

export default class ActionRecordStore extends StoreBase {
  clientId: string;

  setAction(action) {
    this.appStores.multiWinStore.changeAction(this.clientId, action);
  }
}