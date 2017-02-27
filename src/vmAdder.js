const React = require('react');
const { CompositeDisposable } = require('event-kit');

module.exports = (componentClass) => {
  return class NewVMComponent extends componentClass {
    static contextTypes = {
  	  reeventApp: React.PropTypes.object
  	};

    constructor(props) {
      super(props);
      this.disposables = new CompositeDisposable();
    }

    addDisposable(disposable) {
      this.disposables.add(disposable);
    }

    componentWillUnmount() {
      this.disposables.dispose();
    }

    addStoreStateChange(store, callback) {
      let disposable = store.addStateChange(callback || this.onStateChange);
      this.addDisposable(disposable);
      return disposable;
    }

    addStoreEvent(store, event, callback) {
      let disposable = store._emitter.on(event, callback);
      this.addDisposable(disposable);
      return disposable;
    }

    observeStore(store, callback) {
      let disposable = store.observeState(callback || this.onStateChange);
      this.addDisposable(disposable);
      return disposable;
    }

    onStateChange = (state) => {
      this.setState(state);
    };
  }
}
