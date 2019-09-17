export default class BatchUpdateHost {
  appStore: any;
  runState = 'idle';

  constructor(appStore: any) {
    this.appStore = appStore;
  }

  // The AppStore need to update the state
  requestUpdate() {
    if (this.runState === 'idle') {
      this.runState = 'prepare';
      // Collect all of the update request and update AppStore After 20ms
      setTimeout(() => this.runUpdate(), 20);
    }
  }

  runUpdate() {
    this.runState = 'idle';
    this.appStore._sendUpdate();   //enable appStore update
  }
}