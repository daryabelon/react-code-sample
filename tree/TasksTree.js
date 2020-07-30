import { get } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { DndProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { connect } from 'react-redux';
import SortableTree from 'react-sortable-tree';
import { bindActionCreators } from 'redux';
import { changeTree, updateTask } from '../../../containers/tasks/actions';
import CustomScroll from '../../ui/CustomScroll';
import DropPreventArea from './DropPreventArea';
import NodeRenderer from './NodeRender';
import { addNodes, getNextSequents, getNodeById, getNodeKey, getNodeNeighbors, removeNodes } from './Service';

class TasksTree extends Component {
  constructor(props) {
    super(props);
    this.state = {
      draggedNode: null,
    };
    this.instanceKey = Math.random();
    this.sequents = [];
  }

  nodeRender = (data) => {
    const { draggedNode } = this.state;
    const { tree } = this.props;
    return <NodeRenderer {...data} tree={tree} draggedNode={draggedNode} />;
  };

  dragEvent = (event) => {
    let data = {};
    const { updateTaskAction, changeTreeAction } = this.props;
    const { node, treeData, treeIndex } = event;
    const nextParentId = get(event, 'nextParentNode.id');
    const { prev, next } = getNodeNeighbors(node.id, treeData, true);
    if (nextParentId && node.parent_id !== nextParentId) data = { parent_id: nextParentId };
    if (prev) data = { after_id: prev.id };
    if (next) data = { before_id: next.id };
    updateTaskAction(node.id, data)
      .then(() => {
        let updatedTree = treeData;
        if (this.sequents.length) {
          updatedTree = addNodes(this.sequents, treeData, node, treeIndex);
          this.sequents = [];
        }
        changeTreeAction(updatedTree);
      })
      .catch(() => {
        changeTreeAction(treeData);
      });
  };

  beginDragFunction = (fullNode) => {
    return new Promise((resolve) => {
      const { node } = fullNode;
      const { tree, changeTreeAction } = this.props;
      if (!node.is_sequent) return resolve();
      this.sequents = getNextSequents(node, tree);
      const updatedTree = removeNodes(this.sequents, tree);
      changeTreeAction(updatedTree).then(resolve());
    });
  };

  getTreeData = () => {
    const { tree, selectedTaskId } = this.props;
    if (!selectedTaskId) return tree;
    const { node } = getNodeById(selectedTaskId, tree);
    return [node];
  };

  render() {
    const { tree, changeTreeAction } = this.props;
    return (
      <DndProvider backend={HTML5Backend}>
        <DropPreventArea treeData={tree} key={this.instanceKey}>
          <CustomScroll>
            <SortableTree
              beginDragFunc={this.beginDragFunction}
              nodeContentRenderer={this.nodeRender}
              treeData={this.getTreeData()}
              rowHeight={() => 43}
              onMoveNode={this.dragEvent}
              onChange={(tree) => changeTreeAction(tree)}
              getNodeKey={getNodeKey}
              dndType={'yourNodeType'}
            />
          </CustomScroll>
        </DropPreventArea>
      </DndProvider>
    );
  }
}

TasksTree.propTypes = {
  selectedTaskId: PropTypes.number,
  tree: PropTypes.array,
  updateTaskAction: PropTypes.func,
  changeTreeAction: PropTypes.func,
};

const mapStateToProps = (state) => {
  return {
    selectedTaskId: state.tasks.selectedTaskId,
    tree: state.tasks.tree,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    updateTaskAction: bindActionCreators(updateTask, dispatch),
    changeTreeAction: bindActionCreators(changeTree, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TasksTree);
