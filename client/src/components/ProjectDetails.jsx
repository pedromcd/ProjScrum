import React, { useState, useEffect } from 'react';
import '../assets/styles/ProjectDetails.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark, faPlus, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import Modal from './Modal';
import { Avatar, AvatarGroup, Tooltip } from '@mui/material';
import { formatDate } from '../utils/generateCard';
import { projectService, userService, sprintService } from '../services/api';

const ProjectDetails = ({ isNavbarVisible, project, userRole }) => {
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
    evaluationModalOpen: false,
    evaluationScores: {
      atividades: 0,
      equipe: 0,
      comunicacao: 0,
      entregas: 0,
    },
    endedSprints: [],
    userImages: {},
  });
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [dailyToDelete, setDailyToDelete] = useState(null);
  const [, updateState] = React.useState();

  const forceUpdate = React.useCallback(() => updateState({}), []);

  const handleDeleteDaily = (dailyId) => {
    setDailyToDelete(dailyId);
    setOpenDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await sprintService.deletarDaily(dailyToDelete);
      const updatedDailies = state.dailies.filter((daily) => daily.id !== dailyToDelete);
      setState((prevState) => ({ ...prevState, dailies: updatedDailies }));
      setOpenDeleteModal(false);
    } catch (error) {
      console.error('Erro ao deletar daily:', error);
    }
  };

  const handleDeleteCancel = () => {
    setOpenDeleteModal(false);
  };

  useEffect(() => {
    const fetchProjectData = async () => {
      if (project && project.id) {
        try {
          const storedSprints = await projectService.getSprintsByProjectId(project.id);
          const storedDailies = await projectService.getDailiesByProjectId(project.id);

          setState((prevState) => ({
            ...prevState,
            sprints: storedSprints,
            dailies: storedDailies,
            selectedSprint: storedSprints.length > 0 ? storedSprints[0].id.toString() : '',
          }));
        } catch (error) {
          console.error('Erro ao carregar dados do projeto:', error);
        }
      }
    };

    fetchProjectData();
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

  const handleCreateSprint = async () => {
    if (!state.sprintName || !state.deliveryDate) {
      return;
    }

    try {
      const newSprint = await sprintService.criarSprint({
        projectId: project.id,
        name: state.sprintName,
        deliveryDate: state.deliveryDate,
      });

      setState((prevState) => {
        const updatedSprints = [...prevState.sprints, newSprint.sprint];

        return {
          ...prevState,
          sprints: updatedSprints,
          sprintName: '',
          deliveryDate: '',
          openSprintModal: false,
          selectedSprint: newSprint.sprint.id.toString(),
        };
      });
    } catch (error) {
      console.error('Erro ao criar sprint:', error);
    }
  };

  const handleCreateDaily = async () => {
    if (!state.dailyName || !state.dailyDeliveryDate || !state.selectedSprint) {
      return;
    }

    try {
      const newDaily = await sprintService.criarDaily({
        projectId: project.id,
        sprintId: parseInt(state.selectedSprint, 10),
        name: state.dailyName,
        description: state.description,
        deliveryDate: state.dailyDeliveryDate,
        tag: state.dailyTag,
      });

      setState((prevState) => ({
        ...prevState,
        dailies: [...prevState.dailies, newDaily.daily],
        dailyName: '',
        description: '',
        dailyDeliveryDate: '',
        dailyTag: 'Pendente',
        openDailyModal: false,
      }));
    } catch (error) {
      console.error('Erro ao criar daily:', error);
    }
  };

  const handleSprintSelect = async (e) => {
    const selectedSprintId = e.target.value;

    setState((prevState) => ({
      ...prevState,
      selectedSprint: selectedSprintId,
    }));
  };

  const getProjectMembers = (projectMembers) => {
    if (Array.isArray(projectMembers)) {
      return projectMembers.filter((member) => member && member.trim() !== '');
    }

    if (typeof projectMembers === 'string') {
      const members = projectMembers
        .split(',')
        .map((member) => member.trim())
        .filter((member) => member !== '');
      return members;
    }

    return [];
  };

  useEffect(() => {
    if (project && project.projectMembers) {
      const colors = {};
      const members = getProjectMembers(project.projectMembers);

      members.forEach((member) => {
        colors[member] = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
      });

      setState((prevState) => ({ ...prevState, avatarColors: colors }));
    }
  }, [project]);

  const handleDragStart = (dailyId) => {
    setState((prevState) => ({ ...prevState, draggedDailyId: dailyId }));
  };

  const handleDrop = async (newTag) => {
    const { draggedDailyId, dailies } = state;

    try {
      await sprintService.atualizarDailyTag(draggedDailyId, newTag);

      const updatedDailies = dailies.map((daily) =>
        daily.id === draggedDailyId ? { ...daily, tag: newTag } : daily
      );

      setState((prevState) => ({
        ...prevState,
        dailies: updatedDailies,
        draggedDailyId: null,
      }));
    } catch (error) {
      console.error('Erro ao atualizar tag da daily:', error);
    }
  };

  const handleEvaluation = () => {
    setState((prevState) => ({ ...prevState, evaluationModalOpen: true }));
  };

  const handleEvaluationSubmit = async () => {
    const { evaluationScores, selectedSprint, sprints, dailies } = state;
    const sprintToEnd = sprints.find((sprint) => sprint.id === parseInt(selectedSprint));

    const endedSprint = {
      projectId: project.id,
      sprintId: selectedSprint,
      name: sprintToEnd.name,
      evaluationScores: {
        atividades: evaluationScores.atividades,
        equipe: evaluationScores.equipe,
        comunicacao: evaluationScores.comunicacao,
        entregas: evaluationScores.entregas,
      },
    };

    try {
      await sprintService.finalizarSprint(endedSprint);

      const updatedEndedSprints = [...state.endedSprints, endedSprint];
      const updatedSprints = sprints.filter((sprint) => sprint.id !== parseInt(selectedSprint));
      const updatedDailies = dailies.filter((daily) => daily.sprintId !== parseInt(selectedSprint));

      setState((prevState) => ({
        ...prevState,
        endedSprints: updatedEndedSprints,
        sprints: updatedSprints,
        dailies: updatedDailies,
        evaluationModalOpen: false,
        selectedSprint: updatedSprints.length > 0 ? updatedSprints[0].id.toString() : '',
      }));
    } catch (error) {
      console.error('Erro ao finalizar sprint:', error);
    }
  };

  const handleEvaluationChange = (e) => {
    const { name, value } = e.target;
    setState((prevState) => ({
      ...prevState,
      evaluationScores: { ...prevState.evaluationScores, [name]: parseInt(value, 10) },
    }));
  };

  const generateAvatarText = (userName) => {
    return userName && userName.trim() !== ''
      ? userName
          .split(' ')
          .filter((name) => name.length > 2)
          .map((name, index, array) =>
            index === 0 || index === array.length - 1 ? name[0].toUpperCase() : ''
          )
          .join('')
          .slice(0, 2)
      : '';
  };

  useEffect(() => {
    const fetchUserImages = async () => {
      if (project && project.projectMembers) {
        const members = getProjectMembers(project.projectMembers)
          .map((member) => member.trim())
          .filter((member) => member !== '');

        const images = {};

        await Promise.all(
          members.map(async (member) => {
            try {
              const nameVariations = [
                member,
                member.toLowerCase(),
                member.toUpperCase(),
                member.split(' ')[0],
                member.split(' ')[0].toLowerCase(),
                member.split(' ')[0].toUpperCase(),
              ];

              for (const name of nameVariations) {
                try {
                  const userData = await userService.getUserByName(name);

                  if (userData.imagem) {
                    if (
                      userData.imagem.startsWith('data:image') ||
                      userData.imagem.startsWith('http') ||
                      userData.imagem.startsWith('/9j/')
                    ) {
                      const formattedImage = userData.imagem.startsWith('data:image')
                        ? userData.imagem
                        : `data:image/jpeg;base64,${userData.imagem}`;

                      images[member] = formattedImage;
                    } else {
                      console.warn(`Invalid image format for ${member}`);
                    }
                    break;
                  }
                } catch (searchError) {
                  console.log(`No user found for name variation: ${name}`);
                }
              }
            } catch (error) {
              console.error(`Error fetching image for ${member}:`, error);
            }
          })
        );

        setState((prevState) => ({
          ...prevState,
          userImages: images,
        }));
      }
    };

    fetchUserImages();
  }, [project]);

  if (!project) {
    return <div>No project found</div>;
  }

  return (
    <div className={`project-details-container ${isNavbarVisible ? '' : 'full-width'}`}>
      <div className='avatar-group'>
        <Tooltip
          title={
            <div style={{ columnCount: 1, maxHeight: 200, overflowY: 'auto' }}>
              {getProjectMembers(project.projectMembers).map((member, index) => (
                <div key={index} style={{ marginBottom: 8 }}>
                  {member.trim()}
                </div>
              ))}
            </div>
          }
          placement='right'
        >
          <AvatarGroup max={4}>
            {getProjectMembers(project.projectMembers).map((member, index) => {
              const trimmedMember = member.trim();
              const userImage = state.userImages[trimmedMember];

              return userImage ? (
                <Avatar
                  key={`avatar-${trimmedMember}-${index}`}
                  className='avatar'
                  sx={{ width: 50, height: 50 }}
                  src={userImage}
                  alt={trimmedMember}
                  imgProps={{
                    onError: (e) => {
                      console.error(`Error loading image for ${trimmedMember}:`, e);
                      e.target.src = '';
                    },
                  }}
                />
              ) : (
                <Avatar
                  key={`avatar-${trimmedMember}-${index}`}
                  className='avatar'
                  sx={{ width: 50, height: 50 }}
                >
                  {generateAvatarText(trimmedMember)}
                </Avatar>
              );
            })}
          </AvatarGroup>
        </Tooltip>
      </div>

      <div className='button-container'>
        {userRole === 'Admin' || userRole === 'Gerente' ? (
          <>
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

            <button className='end-sprint' onClick={handleEvaluation}>
              Finalizar sprint
            </button>
          </>
        ) : (
          <div className='no-create-buttons'></div>
        )}
      </div>

      <Modal isOpen={state.openSprintModal}>
        <div
          className='modal-close-button'
          onClick={() => setState((prev) => ({ ...prev, openSprintModal: false }))}
        >
          <FontAwesomeIcon icon={faCircleXmark} />
        </div>
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
        <div
          className='modal-close-button'
          onClick={() => setState((prev) => ({ ...prev, openDailyModal: false }))}
        >
          <FontAwesomeIcon icon={faCircleXmark} />
        </div>
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

      <Modal isOpen={state.evaluationModalOpen}>
        <div
          className='modal-close-button'
          onClick={() => setState((prev) => ({ ...prev, evaluationModalOpen: false }))}
        >
          <FontAwesomeIcon icon={faCircleXmark} />
        </div>
        <div className='modal-evaluation-inputs'>
          <ul className='evaluation-inputs'>
            <li>
              <p>Atividades</p>
              <input
                type='number'
                value={state.evaluationScores.atividades}
                onChange={handleEvaluationChange}
                name='atividades'
                min='0'
                max='100'
              />
            </li>
            <li>
              <p>Equipe</p>
              <input
                type='number'
                value={state.evaluationScores.equipe}
                onChange={handleEvaluationChange}
                name='equipe'
                min='0'
                max='100'
              />
            </li>
            <li>
              <p>Comunicação</p>
              <input
                type='number'
                value={state.evaluationScores.comunicacao}
                onChange={handleEvaluationChange}
                name='comunicacao'
                min='0'
                max='100'
              />
            </li>
            <li>
              <p>Entregas</p>
              <input
                type='number'
                value={state.evaluationScores.entregas}
                onChange={handleEvaluationChange}
                name='entregas'
                min='0'
                max='100'
              />
            </li>
          </ul>

          <button className='submit-evaluation' onClick={handleEvaluationSubmit}>
            Enviar avaliação
          </button>
        </div>
      </Modal>

      <Modal isOpen={openDeleteModal}>
        <div className='modal-close-button' onClick={handleDeleteCancel}>
          <FontAwesomeIcon icon={faCircleXmark} />
        </div>
        <div className='modal-delete-daily'>
          <p>Tem certeza que deseja excluir essa daily?</p>
          <div className='buttons-container'>
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
          <option key={`sprint-${sprint.id}`} value={sprint.id}>
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
                key={`pending-daily-${daily.id}`}
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
                key={`in-progress-daily-${daily.id}`}
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
                key={`completed-daily-${daily.id}`}
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
