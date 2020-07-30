import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { changeTree } from '../../../containers/tasks/actions';
import { toggleExpanded } from './Service';

class NodeExpandedButton extends Component {
  toggleExpanded = () => {
    const { tree, path, node, changeTreeAction } = this.props;
    const updatedTree = toggleExpanded(tree, path, node);
    changeTreeAction(updatedTree);
  };

  render() {
    const { isDragging, node } = this.props;

    return !isDragging && node.children && node.children.length > 0 ? (
      <div>
        <div className={`${node.expanded ? 'active ' : ''} expand-task clickable`} onClick={this.toggleExpanded} />
      </div>
    ) : null;
  }
}

NodeExpandedButton.propTypes = {
  path: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])).isRequired,
  node: PropTypes.object,
  tree: PropTypes.array,
  isDragging: PropTypes.bool.isRequired,
  changeTreeAction: PropTypes.func,
};

const mapDispatchToProps = (dispatch) => {
  return {
    changeTreeAction: bindActionCreators(changeTree, dispatch),
  };
};

export default connect(null, mapDispatchToProps)(NodeExpandedButton);
