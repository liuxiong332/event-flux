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

    onDidUpdateStore(store, callback) {
      let disposable = store.onDidUpdate(callback || this.storeUpdated);
      this.addDisposable(disposable);
      return disposable;
    }

    observeStore(store, callback) {
      let disposable = store.observe(callback || this.storeUpdated);
      this.addDisposable(disposable);
      return disposable;
    }

    storeUpdated = (state) => {
      this.setState(state);
    };
  }
}
