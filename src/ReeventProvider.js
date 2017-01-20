const React = require('react');

module.exports = class ReeventProvider extends React.PureComponent {
  getChildContext() {
    return { reeventApp: this.reeventApp };
  }

  constructor(props, context) {
    super(props, context);
    this.reeventApp = props.reeventApp;
  }

  render() {
    return React.Children.only(this.props.children)
  }
}
