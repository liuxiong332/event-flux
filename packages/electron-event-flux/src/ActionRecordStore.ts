import StoreBase from 'event-flux/lib/StoreBase';

export default class ActionRecordStore extends StoreBase {
  init() {
    // for browser, use pathname forever
    if (typeof window === 'object') {   
      this.setState({ action: window.location.pathname });
    } else {
      this.setState({ action: '/empty' });
    }
  }

  setAction(action) {
    this.setState({ action });
  }
}