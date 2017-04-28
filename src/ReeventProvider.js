const React = require('react');
import PropTypes from 'prop-types';

module.exports = class ReeventProvider extends React.PureComponent {
  static childContextTypes = {
    reeventApp: PropTypes.object
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
