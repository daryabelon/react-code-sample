import { find, get } from 'lodash';
import moment from 'moment';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import RoundedAvatar from '../ui/RoundedAvatar';
import TaskStatusSwitcher from './TaskStateSwitcher';

class TaskActivity extends Component {
  getUsername = (creator_id, organisation) => {
    const users = get(organisation, 'users', []);
    return get(find(users, { id: creator_id }), 'name', '-');
  };

  renderSwitch = (switcher, renderer) => (switcher ? renderer() : null);

  renderAvatar = () => {
    const { node, organisation } = this.props;
    const { creator_id } = node;
    return (
      <RoundedAvatar
        name={this.getUsername(creator_id, organisation)}
        containerClassName="owner-pic"
        textClassName="owner-pic-text"
      />
    );
  };

  renderDeadline = () => {
    const { node } = this.props;
    const deadline = node.deadline ? moment(node.deadline).format('D MMM YYYY') : '-';
    return <div className="task-deadline red-active">{deadline}</div>;
  };

  renderProgress = () => {
    const { node } = this.props;
    const { progress } = node;
    return <div className="task-done red-active">{`${progress || 0}%`}</div>;
  };

  renderState = () => {
    const { node } = this.props;
    return <TaskStatusSwitcher node={node} />;
  };

  render() {
    const { switches } = this.props;
    const { user, progress, deadline, state } = switches;

    return (
      <div className="task-activity-info">
        {this.renderSwitch(user, this.renderAvatar)}
        {this.renderSwitch(state, this.renderState)}
        {this.renderSwitch(progress, this.renderProgress)}
        {this.renderSwitch(deadline, this.renderDeadline)}
      </div>
    );
  }
}

TaskActivity.propTypes = {
  node: PropTypes.object.isRequired,
  organisation: PropTypes.object.isRequired,
  switches: PropTypes.object.isRequired,
};
const mapStateToProps = (state) => {
  return {
    organisation: state.shared.organisation,
    switches: state.tasks.switches,
  };
};
export default connect(mapStateToProps)(TaskActivity);
