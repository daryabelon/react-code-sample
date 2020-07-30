import { get } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { Input } from 'semantic-ui-react';
import { changeTree, createTask, updateTask } from '../../../containers/tasks/actions';
import GlobalModal from '../../ui/GlobalModal';
import {
  changeNode,
  changeNodeById,
  createNewTask,
  deleteNode,
  moveNodeToPervNeighbor,
  MoveNodeToPrevParent,
  validateTaskName,
} from './Service';

class NodeInplaceEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: get(props, 'node.name', ''),
    };
    this._isRequest = false;
  }

  changeName = (e) => {
    this.setState({ name: e.target.value });
  };

  onEnter = () => {
    const { node } = this.props;
    return node.isEdit ? this.updateTask() : this.saveNewTask();
  };

  saveNewTask = () => {
    const { name } = this.state;
    const { path, tree, node, createTaskAction, changeTreeAction } = this.props;
    if (this._isRequest) return;
    this._isRequest = true;

    if (!node.isNew && !validateTaskName(name)) {
      return this.escapeCreating();
    }

    let updatedTree = deleteNode(tree, path);

    const parentTaskId = path[path.length - 2];
    createTaskAction({ name: name, parent_id: parentTaskId }).then((node) => {
      this._isRequest = false;
      updatedTree = createNewTask({ treeData: updatedTree, parentKey: parentTaskId, node: node });
      updatedTree = createNewTask({ treeData: updatedTree, parentKey: parentTaskId });
      changeTreeAction(updatedTree);
    });
  };

  escapeCreating = () => {
    const { tree, path, node, changeTreeAction } = this.props;
    if (node.isNew) {
      const updatedTree = changeNode(tree, path, null);
      changeTreeAction(updatedTree);
    }
  };

  cancelEdit = () => {
    const { tree, node, changeTreeAction } = this.props;
    if (node.isEdit) {
      const newNode = { ...node, isEdit: false };
      const updatedTree = changeNodeById(tree, node.id, newNode);
      changeTreeAction(updatedTree);
    }
  };

  onClose = () => {
    const { node } = this.props;
    return node.isEdit ? this.cancelEdit() : this.escapeCreating();
  };

  moveNodeRight = () => {
    const { tree, node, changeTreeAction } = this.props;
    const updatedTree = moveNodeToPervNeighbor(node, tree);
    changeTreeAction(updatedTree);
  };

  moveNodeLeft = () => {
    const { tree, node, changeTreeAction } = this.props;
    const updatedTree = MoveNodeToPrevParent(node, tree);
    changeTreeAction(updatedTree);
  };

  updateTask = () => {
    if (this._isRequest) return;
    this._isRequest = true;
    const { updateTaskAction, changeTreeAction, node, tree } = this.props;
    const { name } = this.state;
    updateTaskAction(node.id, { name }).then(() => {
      const newNode = { ...node, name, isEdit: false };
      return changeTreeAction(changeNodeById(tree, node.id, newNode));
    });
  };

  onKeyPress = (e) => {
    switch (e.keyCode) {
      case 27:
        this.escapeCreating();
        break;
      case 16:
        this.moveNodeLeft();
        break;
      case 13:
        this.onEnter();
        break;
      case 9:
        e.preventDefault();
        this.moveNodeRight();
        break;
      default:
        return e;
    }
  };

  render() {
    const { name } = this.state;
    return (
      <div className="task-input-parent">
        <GlobalModal close={this.onClose}>
          <Input
            className="task-create-inline clickable"
            placeholder="Add task name"
            value={name}
            onChange={this.changeName}
            autoFocus
            onKeyDown={this.onKeyPress}
          />
        </GlobalModal>
      </div>
    );
  }
}

NodeInplaceEditor.propTypes = {
  path: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])).isRequired,
  node: PropTypes.object,
  tree: PropTypes.array,
  onSelectTask: PropTypes.func,
  updateTree: PropTypes.func,
  createTaskAction: PropTypes.func,
  changeTreeAction: PropTypes.func,
  updateTaskAction: PropTypes.func,
};

const mapDispatchToProps = (dispatch) => {
  return {
    createTaskAction: bindActionCreators(createTask, dispatch),
    changeTreeAction: bindActionCreators(changeTree, dispatch),
    updateTaskAction: bindActionCreators(updateTask, dispatch),
  };
};

export default withRouter(connect(null, mapDispatchToProps)(NodeInplaceEditor));
