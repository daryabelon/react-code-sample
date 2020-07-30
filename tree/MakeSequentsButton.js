import { concat, flattenDeep, get, merge } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { changeTree, sequentTasks } from '../../../containers/tasks/actions';
import { changeNode, getIntermediateNodes, getNodeById, isSameLevel } from './Service';

class MakeSequentsButton extends Component {
  constructor(props) {
    super(props);
    this._isRequest = false;
  }

  makeSequents = () => {
    if (this._isRequest) return;
    this._isRequest = true;
    const { tree, changeTreeAction, sequentTasksAction } = this.props;
    const willSequent = this.getSameLevelsNodes();
    let sequents = [];
    willSequent.forEach((sequentNodes) => {
      sequents.push(getIntermediateNodes(sequentNodes[0], sequentNodes[1], tree));
    });
    const arr = this.generateSequentsArrays(sequents);
    let data = {
      idSequents: [],
      idNonSequents: [],
    };
    const { idSequents, idNonSequents } = arr;
    idSequents.forEach((elem) => data.idSequents.push(elem.node.id));
    idNonSequents.forEach((elem) => data.idNonSequents.push(elem.node.id));

    const array = idSequents.map((item) => {
      return {
        elem: item,
        isSequent: 1,
      };
    });

    const array2 = idNonSequents.map((item) => {
      return {
        elem: item,
        isSequent: 0,
      };
    });

    const outputArray = concat(array, array2);

    const updatedTree = this.updateTree(outputArray, tree);

    sequentTasksAction(data)
      .then(() => {
        this._isRequest = false;
        changeTreeAction(updatedTree);
      })
      .catch(() => {
        this._isRequest = false;
      });
  };

  getSameLevelsNodes = () => {
    const { checkedNodes, tree } = this.props;
    let willSequent = [];
    checkedNodes.forEach((nodeId, index) => {
      const nextNodesArray = checkedNodes.slice(checkedNodes, index);
      const node = getNodeById(nodeId, tree);
      nextNodesArray.forEach((nextNodeId) => {
        const nextNode = getNodeById(nextNodeId, tree);
        if (isSameLevel(node, nextNode)) willSequent.push([node, nextNode]);
      });
    });
    return willSequent;
  };

  updateTree = (arr, tree) => {
    arr
      .sort((a, b) => {
        const aPathLength = get(a, 'elem.path.length', 0);
        const bPathLength = get(b, 'elem.path.length', 0);
        return aPathLength < bPathLength ? -1 : aPathLength > bPathLength ? 1 : 0;
      })
      .forEach((item) => {
        const newNode = merge({}, item.elem.node, { is_sequent: item.isSequent });
        tree = [...changeNode(tree, item.elem.path, newNode)];
      });
    return tree;
  };

  generateSequentsArrays = (sequents) => {
    let idSequents = [];
    let idNonSequents = [];
    sequents.forEach((sequent) => {
      const isAllSequent = sequent.every((elem) => elem.node.is_sequent === 1);
      if (isAllSequent) {
        idNonSequents.push(sequent);
      } else {
        idSequents.push(sequent);
      }
    });

    return { idSequents: flattenDeep(idSequents), idNonSequents: flattenDeep(idNonSequents) };
  };

  render() {
    return <button className="sequence-button" onClick={this.makeSequents} />;
  }
}

MakeSequentsButton.propTypes = {
  tree: PropTypes.array,
  checkedNodes: PropTypes.array,
  changeTreeAction: PropTypes.func,
  sequentTasksAction: PropTypes.func,
};

const mapStateToProps = (state) => {
  return {
    checkedNodes: state.tasks.checkedNodes,
    tree: state.tasks.tree,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    changeTreeAction: bindActionCreators(changeTree, dispatch),
    sequentTasksAction: bindActionCreators(sequentTasks, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MakeSequentsButton);
