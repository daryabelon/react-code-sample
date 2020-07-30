import { get, merge } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { changeTree, sequentTasks } from '../../../containers/tasks/actions';
import { changeNodeById, getExpandedDepth, getNodeById, getNodeNeighbors } from './Service';

class TaskLine extends Component {
  constructor(props) {
    super(props);
    this._isRequest = false;
  }

  clickAssignNodes = (node, tree) => {
    if (this._isRequest) return;
    this._isRequest = true;
    const { sequentTasksAction, changeTreeAction } = this.props;
    const { next } = getNodeNeighbors(node.id, tree);
    if (next.is_sequent && get(getNodeNeighbors(next.id, tree), 'next.is_sequent')) return;

    const is_sequent = this.generateSequentValue(node, next);
    const ids = this.generateIds(node, next);

    const data = is_sequent ? { idSequents: ids } : { idNonSequents: ids };

    sequentTasksAction(data)
      .then(() => {
        this._isRequest = false;
        const newNext = merge({}, next, { is_sequent });
        let updatedTree = changeNodeById(tree, next.id, newNext);

        if (!node.is_sequent) {
          const newNode = merge({}, node, { is_sequent });
          updatedTree = changeNodeById(updatedTree, node.id, newNode);
        }

        return changeTreeAction(updatedTree);
      })
      .catch(() => {
        this._isRequest = false;
      });
  };

  generateIds = (node, next) => {
    if (node.is_sequent && get(next, 'is_sequent')) return [next.id];
    return [node.id, next.id];
  };

  generateSequentValue = (node, next) => {
    if (node.is_sequent && !next.is_sequent) return 1;
    if (!node.is_sequent || !next.is_sequent) return 1;
    return 0;
  };

  renderLine = (node, tree) => {
    const { next } = getNodeNeighbors(node.id, tree);
    if (!next) return null;
    const parentNodeId = get(getNodeById(node.id, tree), 'parentNode.id', null);
    if (!parentNodeId) {
      if (node.is_sequent && !next.is_sequent) return null;
      if (!node.is_sequent && !next.is_sequent) return null;
      if (!node.is_sequent && next.is_sequent) return null;
    }
    const border = node.is_sequent && next.is_sequent ? 'task-line-solid' : 'task-line-dashed';
    const multi = getExpandedDepth(node);
    return (
      <div
        style={{ height: 45 * multi - 13 }}
        key={`${node.id} `}
        className={`task-line ${border}`}
        onClick={() => this.clickAssignNodes(node, tree)}
      />
    );
  };

  render() {
    const { node, tree } = this.props;
    return this.renderLine(node, tree);
  }
}

TaskLine.propTypes = {
  tree: PropTypes.array,
  node: PropTypes.object,
  sequentTasksAction: PropTypes.func,
  changeTreeAction: PropTypes.func,
};

const mapDispatchToProps = (dispatch) => {
  return {
    sequentTasksAction: bindActionCreators(sequentTasks, dispatch),
    changeTreeAction: bindActionCreators(changeTree, dispatch),
  };
};

export default connect(null, mapDispatchToProps)(TaskLine);
