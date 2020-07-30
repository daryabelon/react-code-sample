import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Breadcrumb } from 'semantic-ui-react';
import { changeSelectedTaskId } from '../../../containers/tasks/actions';
import { getNodeById, getNodePathById } from './Service';

class TreeHeaderBreadcrumbs extends Component {
  renderBreadCrumbs = () => {
    const { tree, selectedTaskId, changeSelectedTaskIdAction } = this.props;
    if (!selectedTaskId) return null;
    const path = getNodePathById(selectedTaskId, tree);
    const lastIndex = path.length - 1;
    return path.map((id, index) => {
      const { node } = getNodeById(id, tree);
      return (
        <React.Fragment key={node.id}>
          <Breadcrumb.Divider className="space-breadcrumbs" />
          <Breadcrumb.Section
            as="span"
            className={`breadcrumb ${index === lastIndex ? 'disabled' : ''}`}
            onClick={() => changeSelectedTaskIdAction(node.id)}
          >
            {node.name}
          </Breadcrumb.Section>
        </React.Fragment>
      );
    });
  };

  render() {
    const { changeSelectedTaskIdAction, selectedTaskId } = this.props;
    return (
      <div className="main__head">
        <Breadcrumb>
          <Breadcrumb.Section
            as="span"
            className={`breadcrumb ${selectedTaskId ? '' : 'disabled'}`}
            onClick={() => changeSelectedTaskIdAction(null)}
          >
            HOME
          </Breadcrumb.Section>
          {this.renderBreadCrumbs()}
        </Breadcrumb>
      </div>
    );
  }
}

TreeHeaderBreadcrumbs.propTypes = {
  tree: PropTypes.array,
  selectedTaskId: PropTypes.number,
  changeSelectedTaskIdAction: PropTypes.func,
};

const mapStateToProps = (state) => {
  return {
    tree: state.tasks.tree,
    selectedTaskId: state.tasks.selectedTaskId,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    changeSelectedTaskIdAction: bindActionCreators(changeSelectedTaskId, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TreeHeaderBreadcrumbs);
