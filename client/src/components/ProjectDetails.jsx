import React, { useState, useEffect } from 'react';
import '../assets/styles/ProjectDetails.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import Modal from './Modal';
import { Avatar, AvatarGroup, Tooltip } from '@mui/material';
import { formatDate } from '../utils/generateCard';

const ProjectDetails = ({ isNavbarVisible, project }) => {
  const [state, setState] = useState({
    sprints: [],
    dailies: [],
    sprintName: '',
    deliveryDate: '',
    dailyName: '',
    description: '',
    dailyDeliveryDate: '',
    openSprintModal: false,
    openDailyModal: false,
    avatarColors: {},
    dailyTag: 'Pendente',
    selectedSprint: '',
    pendingDailies: [],
    inProgressDailies: [],
    completedDailies: [],
    draggedDailyId: null,
  });
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [dailyToDelete, setDailyToDelete] = useState(null);

  const handleDeleteDaily = (dailyId) => {
    setDailyToDelete(dailyId);
    setOpenDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    const updatedDailies = state.dailies.filter((daily) => daily.id !== dailyToDelete);
    setState((prevState) => ({ ...prevState, dailies: updatedDailies }));
    localStorage.setItem(`dailies_${project.id}`, JSON.stringify(updatedDailies));
    setOpenDeleteModal(false);
  };

  const handleDeleteCancel = () => {
    setOpenDeleteModal(false);
  };

  useEffect(() => {
    if (project && project.id) {
      const storedSprints = JSON.parse(localStorage.getItem(`sprints_${project.id}`)) || [];
      const storedDailies = JSON.parse(localStorage.getItem(`dailies_${project.id}`)) || [];
      const selectedSprint = JSON.parse(localStorage.getItem(`selectedSprint_${project.id}`)) || '';

      setState((prevState) => ({
        ...prevState,
        sprints: storedSprints,
        dailies: storedDailies,
        selectedSprint: selectedSprint,
      }));
    }
  }, [project]);

  useEffect(() => {
    if (state.sprints.length && state.selectedSprint) {
      const sprintId = parseInt(state.selectedSprint, 10);
      const pendingDailies = state.dailies.filter(
        (daily) => daily.tag === 'Pendente' && daily.sprintId === sprintId
      );
      const inProgressDailies = state.dailies.filter(
        (daily) => daily.tag === 'Em progresso' && daily.sprintId === sprintId
      );
      const completedDailies = state.dailies.filter(
        (daily) => daily.tag === 'Concluido' && daily.sprintId === sprintId
      );

      setState((prevState) => ({
        ...prevState,
        pendingDailies,
        inProgressDailies,
        completedDailies,
      }));
    }
  }, [state.dailies, state.selectedSprint, state.sprints.length]);

  const handleCreateSprint = () => {
    if (!state.sprintName || !state.deliveryDate) {
      return;
    }

    const newSprint = {
      id: state.sprints.length + 1,
      projectId: project.id,
      name: state.sprintName,
      deliveryDate: state.deliveryDate,
    };

    const updatedSprints = [...state.sprints, newSprint];

    setState((prevState) => ({
      ...prevState,
      sprints: updatedSprints,
      sprintName: '',
      deliveryDate: '',
      openSprintModal: false,
    }));

    // Save sprints under the current project
    localStorage.setItem(`sprints_${project.id}`, JSON.stringify(updatedSprints));
  };

  const handleCreateDaily = () => {
    if (!state.dailyName || !state.dailyDeliveryDate || !state.selectedSprint) {
      return;
    }

    const newDaily = {
      id: state.dailies.length + 1,
      projectId: project.id,
      sprintId: parseInt(state.selectedSprint, 10),
      name: state.dailyName,
      description: state.description,
      deliveryDate: state.dailyDeliveryDate,
      tag: state.dailyTag,
    };

    const updatedDailies = [...state.dailies, newDaily];

    setState((prevState) => ({
      ...prevState,
      dailies: updatedDailies,
      dailyName: '',
      description: '',
      dailyDeliveryDate: '',
      dailyTag: 'Pendente',
      openDailyModal: false,
    }));

    localStorage.setItem(`dailies_${project.id}`, JSON.stringify(updatedDailies));
  };

  const handleSprintSelect = (e) => {
    const selectedSprintId = e.target.value;
    setState((prevState) => ({ ...prevState, selectedSprint: selectedSprintId }));
    localStorage.setItem('selectedSprint', JSON.stringify(selectedSprintId));
  };

  useEffect(() => {
    if (state.sprints.length === 1) {
      setState((prevState) => ({ ...prevState, selectedSprint: state.sprints[0].id }));
      localStorage.setItem('selectedSprint', JSON.stringify(state.sprints[0].id));
    }
  }, [state.sprints]);

  useEffect(() => {
    if (project && project.projectMembers) {
      const colors = {};
      project.projectMembers.split(',').forEach((member) => {
        colors[member] = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
      });
      setState((prevState) => ({ ...prevState, avatarColors: colors }));
    }
  }, [project]);

  const stringAvatar = (name) => {
    const color = state.avatarColors[name] || '#000';
    return {
      sx: {
        bgcolor: color,
      },
      children: `${name.charAt(0).toUpperCase()}`,
    };
  };

  const handleDragStart = (dailyId) => {
    setState((prevState) => ({ ...prevState, draggedDailyId: dailyId }));
  };

  const handleDrop = (newTag) => {
    const { draggedDailyId, dailies } = state;
    const updatedDailies = dailies.map((daily) =>
      daily.id === draggedDailyId ? { ...daily, tag: newTag } : daily
    );

    setState((prevState) => ({
      ...prevState,
      dailies: updatedDailies,
      draggedDailyId: null,
    }));

    localStorage.setItem(`dailies_${project.id}`, JSON.stringify(updatedDailies));
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

      <Modal isOpen={openDeleteModal}>
        <div className='modal-delete-daily'>
          <p>Tem certeza que deseja excluir essa daily?</p>
          <div className='button-container'>
            <button className='delete-confirm' onClick={handleDeleteConfirm}>
              Sim
            </button>
            <button className='delete-cancel' onClick={handleDeleteCancel}>
              Não
            </button>
          </div>
        </div>
      </Modal>

      <select
        className='select-sprint'
        value={state.selectedSprint}
        onChange={handleSprintSelect}
        disabled={state.sprints.length === 1}
      >
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
          <div
            className='pending-container'
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop('Pendente')}
          >
            {state.pendingDailies.map((daily) => (
              <div
                key={daily.id}
                className='daily-card'
                draggable
                onDragStart={() => handleDragStart(daily.id)}
              >
                <h2>{daily.name}</h2>
                <p>{daily.description}</p>
                <span className='trash-icon' onClick={() => handleDeleteDaily(daily.id)}>
                  <FontAwesomeIcon icon={faTrashCan} />
                </span>
                <p>Data de entrega: {formatDate(daily.deliveryDate)}</p>
              </div>
            ))}
          </div>
          <div
            className='in-progress-container'
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop('Em progresso')}
          >
            {state.inProgressDailies.map((daily) => (
              <div
                key={daily.id}
                className='daily-card'
                draggable
                onDragStart={() => handleDragStart(daily.id)}
              >
                <h2>{daily.name}</h2>
                <p>{daily.description}</p>
                <span className='trash-icon' onClick={() => handleDeleteDaily(daily.id)}>
                  <FontAwesomeIcon icon={faTrashCan} />
                </span>
                <p>Data de entrega: {formatDate(daily.deliveryDate)}</p>
              </div>
            ))}
          </div>
          <div
            className='completed-container'
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop('Concluido')}
          >
            {state.completedDailies.map((daily) => (
              <div
                key={daily.id}
                className='daily-card'
                draggable
                onDragStart={() => handleDragStart(daily.id)}
              >
                <h2>{daily.name}</h2>
                <p>{daily.description}</p>
                <span className='trash-icon' onClick={() => handleDeleteDaily(daily.id)}>
                  <FontAwesomeIcon icon={faTrashCan} />
                </span>
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
