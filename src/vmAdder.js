const React = require('react');

module.exports = (componentClass) => {
  return class NewVMComponent extends componentClass {
    static contextTypes = {
  	  reeventApp: React.PropTypes.object
  	};

    constructor(props) {
      super(props);
      this.disposables = [];
    }

    addDisposable(disposable) {
      this.disposables.push(disposable);
    }

    removeDisposables() {
      for (let disposable of this.disposables) {
        disposable();
      }
    }

    componentWillUnmount() {
      this.removeDisposables();
    }

    addStoreStateChange(store, callback) {
      let disposable = store.addStateChange(callback || this.onStateChange);
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
