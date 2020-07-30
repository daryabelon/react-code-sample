import { last } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { changeSelectedTaskId, changeTree } from '../../../containers/tasks/actions';
import PortalModal from '../../ui/GlobalPortal';
import TasksDetails from '../modals/TasksDetails';
import TaskActivity from '../TaskActivity';
import NodeCheckbox from './NodeCheckbox';
import NodeDotButton from './NodeDotButton';
import NodeDotButtonWrapper from './NodeDotButtonWrapper';
import NodeExpandedButton from './NodeExpandedButton';
import NodeInplaceEditor from './NodeInplaceEditor';
import { changeNodeById, createNewTask } from './Service';
import TaskLine from './TaskLine';

class NodeRenderer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpenTaskDetails: false,
      task: null,
    };
  }

  createNew = () => {
    const { path, tree, changeTreeAction } = this.props;
    changeTreeAction(createNewTask({ treeData: tree, parentKey: last(path) }));
  };

  toggleTaskDetails = (bool) => {
    const { node } = this.props;
    this.setState({ isOpenTaskDetails: bool, task: node });
  };

  toggleEdit = (val = false) => {
    const { changeTreeAction, node, tree } = this.props;
    const newNode = { ...node, isEdit: val };
    this.toggleTaskDetails(val);
    return changeTreeAction(changeNodeById(tree, node.id, newNode));
  };

  render() {
    const { isOpenTaskDetails, task } = this.state;
    const {
      connectDragSource,
      connectDragPreview,
      isDragging,
      node,
      path,
      tree,
      changeSelectedTaskIdAction,
    } = this.props;
    const { canDrag } = this.props;
    const { isEdit, isNew } = node;
    return (
      <div className={`rst__rowWrapper rst__rtl ${isDragging ? 'dragging' : ''}`}>
        <TaskLine node={node} tree={tree} />
        {connectDragPreview(
          <div className="rst__row rst__rtl">
            <NodeCheckbox node={node} />
            <NodeDotButtonWrapper
              canDrag={canDrag}
              connectDragSource={connectDragSource}
              connectDragPreview={connectDragPreview}
              tree={tree}
              node={node}
            >
              <div>
                <NodeDotButton onClick={() => changeSelectedTaskIdAction(node.id)} />
              </div>
            </NodeDotButtonWrapper>
            <NodeExpandedButton node={node} path={path} isDragging={isDragging} tree={tree} />
            {isEdit || isNew ? (
              <NodeInplaceEditor {...this.props} toggleEdit={this.toggleEdit} />
            ) : (
              <div className={'task-name-parent'} onClick={() => this.toggleEdit(true)}>
                <div className={'clickable task-name'}>{node.name}</div>
              </div>
            )}
            <div className="create-task-event">
              {!isEdit && <div className="plus-icon clickable" onClick={() => this.createNew()} />}
            </div>
          </div>
        )}
        {isEdit || isNew ? null : <TaskActivity node={node} />}
        {isOpenTaskDetails && (
          <PortalModal close={() => this.toggleEdit(false)}>
            <TasksDetails task={task} closeModal={() => this.toggleEdit(false)} />
          </PortalModal>
        )}
      </div>
    );
  }
}

NodeRenderer.propTypes = {
  path: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])).isRequired,
  node: PropTypes.object,
  tree: PropTypes.array,
  connectDragPreview: PropTypes.func.isRequired,
  connectDragSource: PropTypes.func.isRequired,
  isDragging: PropTypes.bool.isRequired,
  changeTreeAction: PropTypes.func,
  changeSelectedTaskIdAction: PropTypes.func,
  canDrag: PropTypes.bool,
};

const mapDispatchToProps = (dispatch) => {
  return {
    changeTreeAction: bindActionCreators(changeTree, dispatch),
    changeSelectedTaskIdAction: bindActionCreators(changeSelectedTaskId, dispatch),
  };
};

export default connect(null, mapDispatchToProps)(NodeRenderer);
