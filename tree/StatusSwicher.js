import { find } from 'lodash';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { Button, Dropdown, Icon } from 'semantic-ui-react';

class StatusSwitcher extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { value: 2, title: 'Not started', className: 'grey-status' };
    this.availableStatus = [
      { title: 'Note', value: 1, className: 'default-state' },
      { title: 'Open', value: 2, className: 'open-state' },
      { title: 'Hold', value: 3, className: 'on-hold-state' },
      { title: 'Active', value: 4, className: 'active-state' },
      { title: 'Review', value: 5, className: 'review-state' },
      { title: 'Reopen', value: 6, className: 're-open-state' },
      { title: 'Done', value: 7, className: 'done-state' },
    ];
  }

  componentDidMount() {
    this.setDefaultValue();
  }

  componentDidUpdate(prevProps) {
    const { value } = this.props;
    if (prevProps.value !== value) {
      this.setDefaultValue();
    }
  }

  setDefaultValue = () => {
    const { value } = this.props;
    const elem = find(this.availableStatus, { value: value });
    this.setState({ ...elem });
  };

  stateButton = () => {
    const { title, className } = this.state;
    return (
      <div>
        <Button className={`task-status-button ${className}`}>
          {title}
          <Icon className="task-status-button__icon" size="small" name="chevron down" />
        </Button>
      </div>
    );
  };

  getOptions = () => {
    return this.availableStatus.map((status) => {
      return { key: status.title, text: status.title, value: status.value };
    });
  };

  handleChange = (e, { value }) => {
    const { onChange } = this.props;
    const elem = find(this.availableStatus, { value: value });
    this.setState({ ...elem }, () => {
      onChange(value);
    });
  };

  render() {
    return (
      <Dropdown
        className="task-details__status-dropdown"
        pointing="top left"
        icon={null}
        floating
        onChange={this.handleChange}
        trigger={this.stateButton()}
        options={this.getOptions()}
      />
    );
  }
}

StatusSwitcher.propTypes = {
  value: PropTypes.number,
  onChange: PropTypes.func,
};

export default StatusSwitcher;
