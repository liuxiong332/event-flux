module.exports = class StoreList {
  constructor(size, builder, observer) {
    this.length = 0;
    this.storeArray = [];
    this.disposables = [];
    this.builder = builder;
    this.observer = observer;
    if (size) this.setSize(size);
  }

  setSize(count) {
    if (this.length === count) return;
    if (this.length < count) {
      for (let i = this.length; i < count; ++i) {
        let newStore = this.builder();
        this.storeArray.push(newStore);
        this.disposables.push(this.observer(newStore, i));
      }
    } else {
      for (let i = count; i < this.length; ++i) {
        this.disposables[i].dispose();
        this.storeArray[i].dispose();
      }
      this.disposables.splice(count, this.length - count);
      this.storeArray.splice(count, this.length - count);
    }
    this.length = count;
  }

  dispose() {
    this.setSize(0);
  }

  forEach(callback) { return this.storeArray.forEach(callback); }
  map(callback) { return this.storeArray.map(callback); }
  filter(callback) { return this.storeArray.filter(callback); }
  get(index) { return this.storeArray[index]; }
  slice(begin, end) { return this.storeArray.slice(begin, end); }
}