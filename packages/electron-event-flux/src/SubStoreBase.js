import StoreBase from 'event-flux/lib/StoreBase';

class SubIdGenerator {
  constructor() {
    this.count = 0;
    this.prefix = Math.random().toString(36).slice(2, 5);
  }

  genId() {
    this.count += 1;
    return this.prefix + this.count;
  }
}

// The StoreBase that can subscribe and unsubscribe
export default class SubStoreBase extends StoreBase {
  constructor() {
    super();
    this.subMap = {};
    this.idGenerator = new SubIdGenerator(); 
  }

  unsubscribe(subId) {
    let dispose = this.subMap[subId];
    if (!dispose) console.error(`The subId ${subId} isnot subscribed`);
    dispose && dispose.dispose();
    this.subMap[subId] = null;
  }

  genSubId(dispose) {
    let id = this.idGenerator.genId();
    this.subMap[id] = dispose;
    return id;
  }

  dispose() {
    super.dispose();
    let subMap = this.subMap;
    Object.keys(subMap).forEach(key => subMap[key] && subMap[key].dispose());
  }
}
