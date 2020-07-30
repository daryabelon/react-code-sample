import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { changeTree } from '../../containers/tasks/actions';
import SearchLine from '../home/SearchLine';
import OrganisationWrapper from '../ui/wrappers/OrganisationWrapper';
import GanttWrapper from './gantt/GanttWrapper';
import TasksTree from './tree/TasksTree';
import TreeHeaderBreadcrumbs from './tree/TreeHeaderBreadcrumbs';
import TreeHeaderMenu from './tree/TreeHeaderMenu';

class TasksMain extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpenTree: true,
    };
  }

  changeView = () => {
    this.setState(({ isOpenTree: isOpenTree }) => ({ isOpenTree: !isOpenTree }));
  };

  render() {
    const { isOpenTree } = this.state;
    const { changeTreeAction } = this.props;
    return (
      <>
        <SearchLine />
        <div className="page-container">
          <OrganisationWrapper>
            <TreeHeaderBreadcrumbs />
            <div className="main__container">
              <div className="project-main__table">
                <TreeHeaderMenu changeView={this.changeView} isOpenTree={isOpenTree} />
                {isOpenTree ? <TasksTree onChange={changeTreeAction} /> : <GanttWrapper />}
              </div>
            </div>
          </OrganisationWrapper>
        </div>
      </>
    );
  }
}

TasksMain.propTypes = {
  changeTreeAction: PropTypes.func,
  tree: PropTypes.array,
};

const mapStateToProps = (state) => {
  return {
    tree: state.tasks.tree,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    changeTreeAction: bindActionCreators(changeTree, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TasksMain);
