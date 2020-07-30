import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Dropdown } from 'semantic-ui-react';

class SelectStatusDropdown extends Component {
  render() {
    const { changeSwitcher } = this.props;
    return (
      <Dropdown className="switch-select" simple icon="angle down">
        <Dropdown.Menu>
          <Dropdown.Item
            label={
              <label>
                <span>User</span>{' '}
                <input type="checkbox" defaultChecked={true} onChange={(event) => changeSwitcher(event, 'user')} />
                <span className="checkmark" />
              </label>
            }
          />
          <Dropdown.Item
            label={
              <label>
                State
                <input type="checkbox" defaultChecked={true} onChange={(event) => changeSwitcher(event, 'state')} />
                <span className="checkmark" />
              </label>
            }
          />
          <Dropdown.Item
            label={
              <label>
                Progress
                <input type="checkbox" defaultChecked={true} onChange={(event) => changeSwitcher(event, 'progress')} />
                <span className="checkmark" />
              </label>
            }
          />
          <Dropdown.Item
            label={
              <label>
                Deadline
                <input type="checkbox" defaultChecked={true} onChange={(event) => changeSwitcher(event, 'deadline')} />
                <span className="checkmark" />
              </label>
            }
          />
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}

SelectStatusDropdown.propTypes = {
  changeSwitcher: PropTypes.func,
};

export default SelectStatusDropdown;
