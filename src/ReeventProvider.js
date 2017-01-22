const React = require('react');

module.exports = class ReeventProvider extends React.PureComponent {
  static childContextTypes = {
    reeventApp: React.PropTypes.object
  };

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
