import AppStoreBase from './AppStoreBase';

export default class AppStore extends AppStoreBase {
  constructor() {
    super();
  }

  loadInClient(history) {
    return this;
  }

  loadInServer(req, history) {
    return this;
  } 
}
