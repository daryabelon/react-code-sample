import PropTypes from 'prop-types';
import React from 'react';

function NodeDotButton(props) {
  const { onClick } = props;
  return <div onClick={onClick} className={'single-task expand-task clickable'} />;
}

NodeDotButton.defaultProps = {
  onClick: () => {},
};

NodeDotButton.propTypes = {
  onClick: PropTypes.func,
  node: PropTypes.object,
};

export default NodeDotButton;
