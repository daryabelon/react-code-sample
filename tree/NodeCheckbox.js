import { get } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Checkbox } from 'semantic-ui-react';
import { setCheckedTasksIds } from '../../../containers/tasks/actions';
import { addToArray, getChildren, removeFromArray } from '../../../utils';

class NodeCheckbox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checked: false,
    };
  }

  componentDidMount() {
    this.isChecked();
  }

  componentDidUpdate(prevProps) {
    const { checkedNodes } = this.props;
    if (prevProps.checkedNodes !== checkedNodes) {
      this.isChecked();
    }
  }

  changeCheck = (event, data) => {
    const { checked } = data;
    const { node } = this.props;
    const { checkedNodes, setCheckedTasksIdsAction } = this.props;
    let updatedCheckedNodes = [...checkedNodes];
    let idsArray = [node.id];
    idsArray = getChildren(get(node, 'children', []), idsArray);
    idsArray.forEach((id) => {
      updatedCheckedNodes = checked ? addToArray(updatedCheckedNodes, id) : removeFromArray(updatedCheckedNodes, id);
    });
    setCheckedTasksIdsAction(updatedCheckedNodes);
  };

  isChecked = () => {
    const { node, checkedNodes } = this.props;
    this.setState({ checked: checkedNodes.includes(node.id) });
  };

  render() {
    const { checked } = this.state;
    const { node } = this.props;
    return (
      <Checkbox
        className="task-checkbox revealed"
        disabled={node.isNew}
        checked={checked}
        onChange={(event, data) => this.changeCheck(event, data)}
      />
    );
  }
}

NodeCheckbox.propTypes = {
  node: PropTypes.object,
  checkedNodes: PropTypes.array,
  setCheckedTasksIdsAction: PropTypes.func,
};

const mapStateToProps = (state) => {
  return {
    checkedNodes: state.tasks.checkedNodes,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setCheckedTasksIdsAction: bindActionCreators(setCheckedTasksIds, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(NodeCheckbox);
