declare var requestIdleCallback: (callback: () => void, options?: { timeout: number }) => void;
 
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
      if (typeof requestIdleCallback !== "undefined") {
        requestIdleCallback(() => this.runUpdate());
      } else {
        setTimeout(() => this.runUpdate(), 0);
      }
    }
  }

  runUpdate() {
    this.runState = 'idle';
    this.appStore._sendUpdate();   //enable appStore update
  }
}