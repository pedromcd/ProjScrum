import React, { useState, useEffect } from 'react';
import '../assets/styles/ProjectDetails.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import Modal from './Modal';
import { Avatar, AvatarGroup, Tooltip } from '@mui/material';
import { formatDate } from '../utils/generateCard';

const ProjectDetails = ({ isNavbarVisible, project }) => {
  const [state, setState] = useState({
    sprints: JSON.parse(localStorage.getItem('sprints')) || [],
    dailies: JSON.parse(localStorage.getItem('dailies')) || [],
    sprintName: '',
    deliveryDate: '',
    dailyName: '',
    description: '',
    dailyDeliveryDate: '',
    openSprintModal: false,
    openDailyModal: false,
    avatarColors: {},
    dailyTag: 'Pendente',
    selectedSprint: JSON.parse(localStorage.getItem('selectedSprint')) || '',
    pendingDailies: [],
    inProgressDailies: [],
    completedDailies: [],
  });

  const handleCreateSprint = () => {
    const newSprint = {
      id: state.sprints.length + 1,
      name: state.sprintName,
      deliveryDate: state.deliveryDate,
    };
    setState((prevState) => ({
      ...prevState,
      sprints: [...prevState.sprints, newSprint],
      sprintName: '',
      deliveryDate: '',
      openSprintModal: false,
    }));
    localStorage.setItem('sprints', JSON.stringify([...state.sprints, newSprint]));
  };

  const handleCreateDaily = () => {
    const sprintId = state.selectedSprint === '' ? 0 : parseInt(state.selectedSprint);
    const newDaily = {
      id: state.dailies.length + 1,
      name: state.dailyName,
      description: state.description,
      deliveryDate: state.dailyDeliveryDate,
      sprintId: sprintId,
      tag: state.dailyTag,
    };
    setState((prevState) => ({
      ...prevState,
      dailies: [...prevState.dailies, newDaily],
      dailyName: '',
      description: '',
      dailyDeliveryDate: '',
      dailyTag: '',
      openDailyModal: false,
    }));
    localStorage.setItem('dailies', JSON.stringify([...state.dailies, newDaily]));
  };

  const handleSprintSelect = (e) => {
    const selectedSprintId = e.target.value;
    setState((prevState) => ({ ...prevState, selectedSprint: selectedSprintId }));
    localStorage.setItem('selectedSprint', JSON.stringify(selectedSprintId));
  };

  useEffect(() => {
    if (project && project.projectMembers) {
      const colors = {};
      project.projectMembers.split(',').forEach((member) => {
        colors[member] = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
      });
      setState((prevState) => ({ ...prevState, avatarColors: colors }));
    }
  }, [project]);

  useEffect(() => {
    const pendingDailies = state.dailies.filter(
      (daily) => daily.tag === 'Pendente' && daily.sprintId === parseInt(state.selectedSprint)
    );
    const inProgressDailies = state.dailies.filter(
      (daily) => daily.tag === 'Em progresso' && daily.sprintId === parseInt(state.selectedSprint)
    );
    const completedDailies = state.dailies.filter(
      (daily) => daily.tag === 'Concluido' && daily.sprintId === parseInt(state.selectedSprint)
    );
    setState((prevState) => ({ ...prevState, pendingDailies, inProgressDailies, completedDailies }));
  }, [state.dailies, state.selectedSprint]);

  const stringAvatar = (name) => {
    if (typeof name === 'string') {
      const members = name.split(',');
      return {
        sx: {
          bgcolor: state.avatarColors[members[0]],
        },
        children: `${members[0].charAt(0).toUpperCase()}`,
      };
    } else {
      return {
        sx: {
          bgcolor: state.avatarColors[name],
        },
        children: `${name.charAt(0).toUpperCase()}`,
      };
    }
  };

  const handleScroll = (e, tag) => {
    const container = e.target;
    if (container.scrollTop + container.offsetHeight >= container.scrollHeight) {
      // Load more data for the tag
      console.log(`Load more data for ${tag} tag`);
    }
  };

  if (!project) {
    return <div>No project found</div>;
  }

  return (
    <div className={`project-details-container ${isNavbarVisible ? '' : 'full-width'}`}>
      <div className='avatar-group'>
        <Tooltip
          title={
            <div style={{ columnCount: 1, maxHeight: 200, overflowY: 'auto' }}>
              {project.projectMembers.split(',').map((member, index) => (
                <div key={index} style={{ marginBottom: 8 }}>
                  {member}
                </div>
              ))}
            </div>
          }
          placement='right'
          sx={{ marginLeft: 2 }}
        >
          <AvatarGroup max={4}>
            {project.projectMembers &&
              project.projectMembers.split(',').map((member, index) => (
                <Avatar key={index} {...stringAvatar(member)}>
                  {member.charAt(0).toUpperCase()}
                </Avatar>
              ))}
          </AvatarGroup>
        </Tooltip>
      </div>

      <button
        className='create-button'
        onClick={() => setState((prevState) => ({ ...prevState, openSprintModal: true }))}
      >
        <span className='plus-icon'>
          <FontAwesomeIcon icon={faPlus} />
        </span>
        Criar Sprint
      </button>

      <button
        className='create-button'
        onClick={() => setState((prevState) => ({ ...prevState, openDailyModal: true }))}
      >
        <span className='plus-icon'>
          <FontAwesomeIcon icon={faPlus} />
        </span>
        Criar Daily
      </button>

      <Modal isOpen={state.openSprintModal}>
        <div className='modal-sprint-inputs'>
          <ul className='sprint-inputs'>
            <li>
              <p>Nome</p>
              <input
                type='text'
                value={state.sprintName}
                onChange={(e) => setState((prevState) => ({ ...prevState, sprintName: e.target.value }))}
                placeholder='Titulo da sprint'
              />
            </li>
            <li>
              <p>Data de entrega</p>
              <input
                type='date'
                value={state.deliveryDate}
                onChange={(e) => setState((prevState) => ({ ...prevState, deliveryDate: e.target.value }))}
              />
            </li>
          </ul>

          <button className='create-sprint' onClick={handleCreateSprint}>
            Criar Sprint
          </button>
        </div>
      </Modal>

      <Modal isOpen={state.openDailyModal}>
        <div className='modal-daily-inputs'>
          <ul className='daily-inputs'>
            <li>
              <p>Nome</p>
              <input
                type='text'
                value={state.dailyName}
                onChange={(e) => setState((prevState) => ({ ...prevState, dailyName: e.target.value }))}
                placeholder='Titulo da daily'
              />
            </li>
            <li>
              <p>Descrição</p>
              <input
                type='text'
                value={state.description}
                onChange={(e) => setState((prevState) => ({ ...prevState, description: e.target.value }))}
                placeholder='Descrição'
              />
            </li>
            <li>
              <p>Data de entrega</p>
              <input
                type='date'
                value={state.dailyDeliveryDate}
                onChange={(e) =>
                  setState((prevState) => ({ ...prevState, dailyDeliveryDate: e.target.value }))
                }
              />
            </li>
            <li>
              <p>Sprint</p>
              <select value={state.selectedSprint} onChange={handleSprintSelect}>
                {state.sprints.map((sprint) => (
                  <option key={sprint.id} value={sprint.id}>
                    {sprint.name}
                  </option>
                ))}
              </select>
            </li>
            <li>
              <p>Tag</p>
              <select
                className='tag-select'
                value={state.dailyTag}
                onChange={(e) => setState((prevState) => ({ ...prevState, dailyTag: e.target.value }))}
              >
                <option value='Pendente'>Pendente</option>
                <option value='Em progresso'>Em progresso</option>
                <option value='Concluido'>Concluido</option>
              </select>
            </li>
          </ul>

          <button className='create-daily' onClick={handleCreateDaily}>
            Criar Daily
          </button>
        </div>
      </Modal>

      <select className='select-sprint' value={state.selectedSprint} onChange={handleSprintSelect}>
        {state.sprints.map((sprint) => (
          <option key={sprint.id} value={sprint.id}>
            {sprint.name}
          </option>
        ))}
      </select>

      {state.selectedSprint && (
        <ul className='sprints-list'>
          {state.sprints.find((sprint) => sprint.id === parseInt(state.selectedSprint)) ? (
            <li>
              Entrega da Sprint:{' '}
              {formatDate(
                state.sprints.find((sprint) => sprint.id === parseInt(state.selectedSprint)).deliveryDate
              )}
            </li>
          ) : (
            <li>Nenhum sprint selecionado</li>
          )}
        </ul>
      )}

      <div className='daily-container'>
        <div className='daily-header'>
          <div className='pending'>Pendente</div>
          <div className='in-progress'>Em progresso</div>
          <div className='completed'>Concluido</div>
        </div>
        <div className='daily-cards'>
          <div className='pending-container' onScroll={(e) => handleScroll(e, 'Pendente')}>
            {state.pendingDailies.map((daily) => (
              <div key={daily.id} className='daily-card'>
                <h2>{daily.name}</h2>
                <p>{daily.description}</p>
                <p>Data de entrega: {formatDate(daily.deliveryDate)}</p>
              </div>
            ))}
          </div>
          <div className='in-progress-container' onScroll={(e) => handleScroll(e, 'Em progresso')}>
            {state.inProgressDailies.map((daily) => (
              <div key={daily.id} className='daily-card'>
                <h2>{daily.name}</h2>
                <p>{daily.description}</p>
                <p>Data de entrega: {formatDate(daily.deliveryDate)}</p>
              </div>
            ))}
          </div>
          <div className='completed-container' onScroll={(e) => handleScroll(e, 'Concluido')}>
            {state.completedDailies.map((daily) => (
              <div key={daily.id} className='daily-card'>
                <h2>{daily.name}</h2>
                <p>{daily.description}</p>
                <p>Data de entrega: {formatDate(daily.deliveryDate)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
