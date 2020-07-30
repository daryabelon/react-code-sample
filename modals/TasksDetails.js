import { find, get, merge } from 'lodash';
import moment from 'moment';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import DatePicker from 'react-datepicker';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Transition } from 'semantic-ui-react';
import { changeTree, getTaskInformation, updateTask } from '../../../containers/tasks/actions';
import { variables } from '../../../utils';
import { getStateOptions } from '../../../utils/getStateOptions';
import AddUsers from '../../ui/AddUsers';
import CustomScroll from '../../ui/CustomScroll';
import Dropdown from '../../ui/Dropdown';
import PortalModal from '../../ui/GlobalPortal';
import LoadingSpinner from '../../ui/LoadingSpinner';
import RangeScrollBar from '../../ui/RangeScrollBar';
import RoundedAvatar from '../../ui/RoundedAvatar';
import TaskOwner from '../../ui/wrappers/TaskOwner';
import { changeNodeById, getNodeById } from '../tree/Service';
import CreatePlayBookModal from './CreatePlayBookModal';

class TasksDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      isModalOpen: false,
      selectedDate: null,
      users: props.users,
      selectedUsers: [],
      selectedMembers: [],
      name: '',
      description: '',
      state: 1,
      startDate: '',
      deadline: '',
      priority: 1,
      difficulty: 1,
    };
  }

  componentDidMount() {
    const { task, getTaskInformationAction } = this.props;
    getTaskInformationAction(task.id).then((task) => {
      const users = get(task, 'users', []);
      const selectedMembers = users.map((user) => user.id);
      this.setState({ selectedMembers: selectedMembers, isLoading: false });
    });
  }

  componentDidUpdate(prevProps) {
    const { task } = this.props;
    if (prevProps.task !== task) {
      this.setDefaultTaskData();
    }
  }

  setDefaultTaskData = () => {
    const { openedTask } = this.props;
    const name = get(openedTask, 'name', '');
    const description = get(openedTask, 'description', '');
    const priority = get(openedTask, 'priority');
    const startDate = get(openedTask, 'start_at', '');
    const difficulty = Number(get(openedTask, 'difficulty', 1));
    const state = Number(get(openedTask, 'state', 1));
    let deadline = get(openedTask, 'deadline', '');
    deadline = deadline ? moment(deadline).toDate() : '';
    this.setState({ name, description, state, deadline, startDate, difficulty, priority });
  };

  changeDeadlineDate = (deadline) => {
    this.setState({ deadline });
  };

  changePriority = (val) => {
    this.setState({
      priority: val,
    });
  };

  changeDifficulty = (val) => {
    this.setState({
      difficulty: val,
    });
  };

  changeName = (event) => {
    this.setState({
      name: event.target.value,
    });
  };

  updateTaskData = () => {
    const { name, state, deadline, description, priority, difficulty, selectedMembers } = this.state;
    const { updateTaskAction, changeTreeAction, openedTask, tree } = this.props;
    const members = selectedMembers.map((id) => ({
      member_id: id,
      type: 'user',
      roles: ['user'],
    }));
    const data = {
      name,
      state,
      description,
      priority,
      difficulty,
      members,
    };
    deadline ? (data.deadline = moment(deadline).format('YYYY-MM-DD')) : null;
    updateTaskAction(openedTask.id, data).then(() => {
      const { node } = getNodeById(openedTask.id, tree);
      const newNode = merge({}, node, data);
      const nextTree = changeNodeById(tree, openedTask.id, newNode);
      return changeTreeAction(nextTree);
    });
  };

  changeState = (option) => {
    this.setState({ state: option.value });
  };

  changeDescription = (description) => {
    this.setState({ description });
  };

  getButtonClassName = () => {
    const { state } = this.state;
    const button = find(variables.states, { value: state });
    return `${get(button, 'className', '')}`;
  };

  addMember = (user) => {
    const { selectedMembers } = this.state;
    if (selectedMembers.findIndex((id) => id === user.id) > -1)
      return this.setState({ selectedMembers: [...selectedMembers.filter((id) => id !== user.id)] });
    return this.setState({ selectedMembers: [...selectedMembers, user.id] });
  };

  renderTaskDetails = () => {
    const {
      state,
      name,
      deadline,
      description,
      selectedUsers,
      selectedMembers,
      startDate,
      difficulty,
      priority,
    } = this.state;
    const { closeModal, users, me, openedTask } = this.props;
    const rangeLabels = ['Low', 'Medium', 'High', 'Insane'];
    return (
      <>
        <div className="modal-popup-header">
          <div className="modal-popup-header-title">
            <p className="modal-popup__title">View task</p>
          </div>
          <span className="close-modal" onClick={closeModal} />
        </div>
        <CustomScroll style={{ height: 'calc(100vh - 200px)' }}>
          <div className="modal-popup-block-wrap">
            <div className="modal-popup-block">
              <span className="modal-popup__subtitle">Name</span>
              <input
                className="modal-popup__input"
                type="text"
                placeholder="Add task name here..."
                onChange={this.changeName}
                value={name}
              />
            </div>
            <div className="modal-popup-block">
              <span className="modal-popup__subtitle">State</span>
              <Dropdown
                options={getStateOptions(state, variables.states)}
                optionKey="title"
                onChange={this.changeState}
                defaultValue={find(variables.states, { value: state })}
                classNameButton={this.getButtonClassName()}
              />
            </div>
            <div className="modal-popup-block-half start-date-wrapper">
              <span className="modal-popup__subtitle">Start Date</span>
              <DatePicker
                disabled
                selected={startDate}
                selectsStart
                dateFormat="dd-MM-yyyy"
                placeholderText={'Select date'}
              />
            </div>
            <div className="modal-popup-block-half">
              <span className="modal-popup__subtitle">Deadline</span>
              <DatePicker
                selected={deadline}
                selectsStart
                dateFormat="dd-MM-yyyy"
                placeholderText={'Select date'}
                onChange={this.changeDeadlineDate}
              />
            </div>
            <div className="modal-popup-block-half">
              <span className="modal-popup__subtitle">Creator:</span>
              <RoundedAvatar name={get(me, 'name')} />
            </div>
            <div className="modal-popup-block-half">
              <span className="modal-popup__subtitle">Add members:</span>
              <AddUsers users={users} selected={selectedMembers} onChange={this.addMember} />
            </div>
            <TaskOwner openedTask={openedTask}>
              <div className="modal-popup-block-half">
                <span className="modal-popup__subtitle">Set owner:</span>
                <AddUsers users={users} selected={selectedUsers} />
              </div>
            </TaskOwner>
            <TaskOwner openedTask={openedTask}>
              <div className="modal-popup-block-half">
                <span className="modal-popup__subtitle">Add interested party:</span>
                <AddUsers users={users} selected={selectedUsers} />
              </div>
            </TaskOwner>
            <div className="modal-popup-block">
              <RangeScrollBar
                className="project-details-range"
                onChange={this.changePriority}
                rangeLabels={rangeLabels}
                title="Priority:"
                rangeCount={4}
                value={priority}
              />
              <RangeScrollBar
                className="project-details-range"
                onChange={this.changeDifficulty}
                rangeLabels={rangeLabels}
                title="Difficulty:"
                rangeCount={4}
                value={difficulty}
              />
            </div>
            <div className="modal-popup-block">
              <span className="modal-popup__subtitle">Description:</span>
              <textarea
                className="modal-popup__textarea"
                onChange={(event) => this.changeDescription(event.target.value)}
                value={description}
              />
            </div>
            <div className="modal-popup-header">
              <div className="add-group">
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
              <div className="delete-group">
                <span />
              </div>
            </div>
            <div className="modal-popup-block-wrap">
              <div className="create-project-file is-image">
                <span className="delete-user" />
              </div>
              <div className="create-project-file is-image">
                <span className="delete-user" />
              </div>
              <div className="create-project-file is-image">
                <span className="delete-user" />
              </div>
              <div className="create-project-file is-image">
                <span className="delete-user" />
              </div>
              <div className="create-project-file is-image">
                <span className="delete-user" />
              </div>
              <div className="create-project-file is-pdf">
                <span className="delete-user" />
              </div>
              <div className="create-project-file is-pdf">
                <span className="delete-user" />
              </div>
              <div className="create-project-file is-image">
                <span className="delete-user" />
              </div>
            </div>
          </div>
        </CustomScroll>
        <div className="modal-popup-block-wrap buttons-wrap">
          <div className="modal-popup-block-half">
            <button className="modal-popup-button action-button">Save to PlayBooks</button>
          </div>
          <div className="modal-popup-block-half">
            <button className="modal-popup-button action-button">Add PlayBook</button>
          </div>
          <div className="modal-popup-block-half">
            <button className="modal-popup-button disabled-button" onClick={closeModal}>
              Cancel
            </button>
          </div>
          <div className="modal-popup-block-half">
            <button className="modal-popup-button pink-button" onClick={this.updateTaskData}>
              Save
            </button>
          </div>
        </div>
      </>
    );
  };

  render() {
    const { isModalOpen, isLoading } = this.state;
    const { openProjectDetails } = this.props;
    return (
      <>
        <Transition animation="fly left" transitionOnMount={true} onComplete={this.setDefaultTaskData}>
          <div className="modal-popup-transition">{isLoading ? <LoadingSpinner /> : this.renderTaskDetails()}</div>
        </Transition>
        {isModalOpen && (
          <PortalModal>
            <CreatePlayBookModal
              openProjectDetails={openProjectDetails}
              closeModal={() => this.toggleAddModal(false)}
            />
          </PortalModal>
        )}
      </>
    );
  }
}

TasksDetails.propTypes = {
  closeModal: PropTypes.func,
  users: PropTypes.array,
  openProjectDetails: PropTypes.object,
  openedTask: PropTypes.object,
  task: PropTypes.object,
  tree: PropTypes.array,
  updateTaskAction: PropTypes.func,
  changeTreeAction: PropTypes.func,
  me: PropTypes.object,
  getTaskInformationAction: PropTypes.func,
};

const mapStateToProps = (state) => {
  return {
    users: state.shared.users,
    tree: state.tasks.tree,
    me: state.auth.me,
    openedTask: state.tasks.openedTask,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    updateTaskAction: bindActionCreators(updateTask, dispatch),
    changeTreeAction: bindActionCreators(changeTree, dispatch),
    getTaskInformationAction: bindActionCreators(getTaskInformation, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TasksDetails);
