import PropTypes from 'prop-types';

function NodeDotButtonWrapper(props) {
  const { canDrag, children, connectDragSource } = props;
  if (canDrag) return connectDragSource(children, { dropEffect: 'copy' });
  return children;
}

NodeDotButtonWrapper.propTypes = {
  canDrag: PropTypes.bool,
  connectDragSource: PropTypes.func,
  children: PropTypes.node,
};

export default NodeDotButtonWrapper;
