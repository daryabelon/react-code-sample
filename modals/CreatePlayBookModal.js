import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Button, Dropdown, Input } from 'semantic-ui-react';
import createTeam from '../../../assets/images/team-page/create-team.png';
import { savePlayBook } from '../../../containers/playbook/actions';

class CreatePlayBookModal extends Component {
  constructor(props) {
    super(props);
    const { openProjectDetails } = props;
    this.state = {
      isLock: false,
      playBookName: openProjectDetails.name,
      options: [],
      currentValues: [],
    };
  }

  handleAddition = (e, { value }) => {
    this.setState((prevState) => ({
      options: [{ key: value, text: value, value }, ...prevState.options],
    }));
  };

  handleChange = (e, { value }) => this.setState({ currentValues: value });

  createPlayBookName = (event) => {
    this.setState({
      playBookName: event.target.value,
    });
  };

  handleClick = () => this.setState((prevState) => ({ isLock: !prevState.isLock }));

  buildPlaybook = () => {
    const { openProjectDetails } = this.props;
    const { isLock, playBookName, currentValues } = this.state;
    const uniqueId = () => new Date().valueOf();
    let chainPlaybook = null;
    return {
      id: uniqueId(),
      name: playBookName,
      owner: { displayName: 'Alistair Ritchie', id: 100 }, //TO DO get active user
      tags: currentValues,
      lock: isLock,
      tasks: chainPlaybook ? chainPlaybook : [openProjectDetails],
    };
  };

  render() {
    const { closeModal, savePlayBookAction } = this.props;
    const { isLock, playBookName, currentValues, options } = this.state;
    return (
      <div className="basic-modal__container">
        <div className="basic-modal modal-body play-book-modal">
          <div className="close-modal" onClick={closeModal} />
          <div className="modal-title">
            <img src={createTeam} alt="create-team" />
            <p>Save to PlayBooks</p>
          </div>
          <div className="modal-body">
            <label>
              <span className="modal-section__title">Name:</span>
              <Input fluid type="text" required onChange={this.createPlayBookName} value={playBookName} />
            </label>
            <label>
              <span className="modal-section__title">Tags</span>
              <Dropdown
                options={options}
                search
                selection
                fluid
                multiple
                allowAdditions
                value={currentValues}
                onAddItem={this.handleAddition}
                onChange={this.handleChange}
              />
            </label>
            <label>
              <span className="modal-section__title">Acces level</span>
              <div className="play-book-modal__lock-group">
                <Button className="play-book-short__tab" toggle active={!isLock} onClick={this.handleClick}>
                  Open
                </Button>
                <Button
                  className="play-book-short__tab play-book__lock-red"
                  toggle
                  active={isLock}
                  onClick={this.handleClick}
                >
                  Locked
                </Button>
              </div>
            </label>
          </div>
          <div className="button-group">
            <button className="play-book-modal-button project-button disabled-button" onClick={closeModal}>
              Cancel
            </button>
            <button
              className="play-book-modal-button project-button pink-button"
              onClick={() => {
                savePlayBookAction(this.buildPlaybook());
                closeModal();
              }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }
}

CreatePlayBookModal.propTypes = {
  openProjectDetails: PropTypes.object,
  savePlayBookAction: PropTypes.func,
  closeModal: PropTypes.func,
};

const mapDispatchToProps = (dispatch) => {
  return {
    savePlayBookAction: bindActionCreators(savePlayBook, dispatch),
  };
};

export default connect(null, mapDispatchToProps)(CreatePlayBookModal);
