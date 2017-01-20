
module.exports = (componentClass) => {
  return class NewVMComponent extends componentClass {
    constructor(props) {
      super(props);
      this.disposables = [];
    }

    addDisposable(disposable) {
      this.disposables.push(disposable);
    }

    componentWillUnmount() {
      for (let disposable of this.disposables) {
        disposable();
      }
    }

    onStateChange = (state) => {
      this.setState(state);
    };
  }
}
