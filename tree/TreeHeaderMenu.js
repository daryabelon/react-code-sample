import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Dropdown, Table } from 'semantic-ui-react';
import { changeSwitcher, changeTree, deleteTasks, setCheckedTasksIds } from '../../../containers/tasks/actions';
import { getChildren } from '../../../utils';
import SwalPopup from '../../ui/SwalPopup';
import MakeSequentsButton from './MakeSequentsButton';
import SelectStatusDropdown from './SelectStatusDropdown';
import { createNewTask, removeAllChecked } from './Service';

class TreeHeaderMenu extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      swal: null,
    };
    this.checkDropdownOptions = [
      { key: 1, text: 'Check All', value: 1 },
      { key: 2, text: 'Uncheck All', value: 2 },
    ];
  }

  toggleSwitchStatus = () => {
    const { changeView } = this.props;
    changeView();
  };

  changeChecked = (data) => {
    const { setCheckedTasksIdsAction, tree } = this.props;
    const value = data.value;
    if (value === 2) setCheckedTasksIdsAction([]);
    if (value === 1) setCheckedTasksIdsAction(getChildren(tree));
  };

  createNew = () => {
    const { tree, changeTreeAction } = this.props;
    changeTreeAction(createNewTask({ treeData: tree, parentKey: null }));
  };

  changeSwitcher = (event, type) => {
    const { changeSwitcherAction } = this.props;
    changeSwitcherAction(type, event.target.checked);
  };

  deleteNodes = () => {
    const { changeTreeAction, tree, checkedNodes, deleteTasksAction } = this.props;
    const { setCheckedTasksIdsAction } = this.props;
    deleteTasksAction(checkedNodes)
      .then(() => {
        setCheckedTasksIdsAction([]);
        changeTreeAction(removeAllChecked(tree, checkedNodes));
      })
      .catch((error) => {
        this.setState({
          swal: <SwalPopup icon="error" title={error} callback={this.closeSwal} />,
        });
      });
  };

  closeSwal = () => {
    this.setState({ swal: null });
  };

  render() {
    const { swal } = this.state;
    const { checkedNodes, isOpenTree } = this.props;
    return (
      <Table>
        <Table.Header fullWidth>
          <Table.Row className="project-table__head">
            <Table.HeaderCell width={6} textAlign="left">
              <div className="project-main__header-content">
                {isOpenTree && (
                  <div className="project-main__new-task-button" onClick={this.createNew}>
                    + New
                  </div>
                )}
                {isOpenTree ? (
                  <div className="control-cell">
                    <Dropdown
                      icon="angle down"
                      options={this.checkDropdownOptions}
                      onChange={(event, data) => this.changeChecked(data)}
                    />
                    <button className={'expand-button'}>
                      <i className="angle down icon" />
                    </button>
                    <SelectStatusDropdown changeSwitcher={this.changeSwitcher} />
                    <MakeSequentsButton />
                    {checkedNodes.length > 0 ? (
                      <button className="delete-button" onClick={this.deleteNodes}>
                        <span />
                        Delete
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        {swal}
      </Table>
    );
  }
}

TreeHeaderMenu.propTypes = {
  changeView: PropTypes.func,
  tree: PropTypes.array,
  setCheckedTasksIdsAction: PropTypes.func,
  checkedNodes: PropTypes.array,
  isOpenTree: PropTypes.bool,
  changeTreeAction: PropTypes.func,
  changeSwitcherAction: PropTypes.func,
  deleteTasksAction: PropTypes.func,
};

const mapStateToProps = (state) => {
  return {
    checkedNodes: state.tasks.checkedNodes,
    tree: state.tasks.tree,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setCheckedTasksIdsAction: bindActionCreators(setCheckedTasksIds, dispatch),
    changeTreeAction: bindActionCreators(changeTree, dispatch),
    changeSwitcherAction: bindActionCreators(changeSwitcher, dispatch),
    deleteTasksAction: bindActionCreators(deleteTasks, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TreeHeaderMenu);
