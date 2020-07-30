import { find } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { changeTree, updateTask } from '../../containers/tasks/actions';
import { variables } from '../../utils';
import { getStateOptions } from '../../utils/getStateOptions';
import Dropdown from '../ui/Dropdown';
import { changeNodeById } from './tree/Service';

class TaskStateSwitcher extends Component {
  updateTaskState = (option) => {
    const { value } = option;
    const { updateTaskAction, changeTreeAction, node, tree } = this.props;
    updateTaskAction(node.id, { state: value }).then(() => {
      const newNode = { ...node, state: value };
      return changeTreeAction(changeNodeById(tree, node.id, newNode));
    });
  };

  render() {
    const { node } = this.props;
    const selected = find(variables.states, { value: Number(node.state) });
    const { value } = selected;
    return (
      <div className="task-switch">
        <Dropdown
          options={getStateOptions(value, variables.states)}
          optionKey="title"
          onChange={this.updateTaskState}
          defaultValue={selected}
          className={`dropdown-task-state dropdown-task-state__size ${selected.className}`}
          position="left"
          needDropdownImage={true}
        />
      </div>
    );
  }
}

TaskStateSwitcher.propTypes = {
  node: PropTypes.object.isRequired,
  tree: PropTypes.array.isRequired,
  updateTaskAction: PropTypes.func.isRequired,
  changeTreeAction: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  return {
    tree: state.tasks.tree,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    updateTaskAction: bindActionCreators(updateTask, dispatch),
    changeTreeAction: bindActionCreators(changeTree, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TaskStateSwitcher);
