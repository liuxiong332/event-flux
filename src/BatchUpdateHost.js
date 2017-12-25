export default class BatchUpdateHost {
  constructor(appStore) {
    this.appStore = appStore;
    this.tasks = [];
    this.runState = 'idle';
  }

  addTask(task) {
    // this.tasks.push(task);
    if (this.runState === 'idle') {
      this.appStore.disableUpdate();   //disable appStore update    
      this.runLoop();
    }
    task();
  }

  runLoop() {
    this.runState = 'prepare';
    setTimeout(() => this.runTasks(), 0);
    // if (requestAnimationFrame) {
    //   requestAnimationFrame(() => this.runTasks());
    // } else {
             
    // }
  }

  runTasks() {
    this.runState = 'idle';
    this.appStore.enableUpdate();   //enable appStore update
  }
}