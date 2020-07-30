import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { DropTarget } from 'react-dnd';

const dropAreaSpec = {
  drop: (props, monitor) => {
    return { ...monitor.getItem() };
  },
};

const collect = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver({ shallow: true }),
});

class DropPreventArea extends Component {
  render() {
    const { connectDropTarget, children } = this.props;
    return connectDropTarget(<div className="task-tree-drop-prevent-area">{children}</div>);
  }
}

DropPreventArea.propTypes = {
  connectDropTarget: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  isOver: PropTypes.bool.isRequired,
};

export default DropTarget('yourNodeType', dropAreaSpec, collect)(DropPreventArea);
