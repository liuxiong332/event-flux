import StoreBase from './StoreBase';

export default class RouterInfo extends StoreBase {
  constructor(appStore, history) {
    super(appStore);
    this.history = history;
    this.entryCount = 0;
    let initLocation = history.getCurrentLocation();
    this.setLocation(initLocation);
    this.state = { location: initLocation };
    this.unlisten = history.listen((location, action) => {
      this.onLocationChange(location);
    });
  }

  setLocation(location) {
    this._location = location;
    this._pathname = location.pathname;
    this._query = location.query;
  }

  onLocationChange(location) {
    this.setLocation(location);
    this.setState({ location });
  }

  setHeaderData(headerData) {
    this.headerData = headerData;
  }

  push(pathParams, headerData) {
    ++this.entryCount;
    this.history.push(pathParams);
    this.headerData = headerData;
  }

  replace(pathParams) {
    this.history.replace(pathParams);
  }

  goBack() {
    --this.entryCount;
    this.history.goBack();
  }

  canGoBack() {
    return this.entryCount > 0;
  }

  isActive(pathname) {
    return this.pathname.indexOf(pathname) === 0;
  }

  get location() {
    return this._location;
  }

  get pathname() {
    return this._pathname;
  }

  get query() {
    return this._query;
  }

  dispose() {
    super.dispose();
    this.unlisten();
  }
}
