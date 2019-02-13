export default class BatchUpdateHost {
  appStore: any;
  tasks = [];
  runState = 'idle';

  constructor(appStore) {
    this.appStore = appStore;
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
    setTimeout(() => this.runTasks(), 20);
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