import React, { useEffect, useState } from 'react';
import '../assets/styles/ProjectDetails.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import Modal from './Modal';
import { Avatar, AvatarGroup, Tooltip } from '@mui/material';
import { formatDate } from '../utils/generateCard';

const ProjectDetails = ({ isNavbarVisible, project }) => {
  const [sprints, setSprints] = useState(JSON.parse(localStorage.getItem('sprints')) || []);
  const [dailies, setDailies] = useState(JSON.parse(localStorage.getItem('dailies')) || []);
  const [sprintName, setSprintName] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [dailyName, setDailyName] = useState('');
  const [description, setDescription] = useState('');
  const [dailyDeliveryDate, setDailyDeliveryDate] = useState('');
  const [openSprintModal, setOpenSprintModal] = useState(false);
  const [openDailyModal, setOpenDailyModal] = useState(false);
  const [avatarColors, setAvatarColors] = useState({});
  const [dailyTag, setDailyTag] = useState('Pendente');
  const [selectedSprint, setSelectedSprint] = useState(
    JSON.parse(localStorage.getItem('selectedSprint')) || ''
  );

  const handleCreateSprint = () => {
    const newSprint = { id: sprints.length + 1, name: sprintName, deliveryDate };
    setSprints([...sprints, newSprint]);
    localStorage.setItem('sprints', JSON.stringify([...sprints, newSprint]));
    setOpenSprintModal(false);
    setSprintName('');
    setDeliveryDate('');
  };

  const handleCreateDaily = () => {
    const sprintId = selectedSprint === '' ? 0 : parseInt(selectedSprint);
    const newDaily = {
      id: dailies.length + 1,
      name: dailyName,
      description,
      deliveryDate: dailyDeliveryDate,
      sprintId: sprintId,
      tag: dailyTag,
    };
    setSelectedSprint('0');
    setDailies([...dailies, newDaily]);
    localStorage.setItem('dailies', JSON.stringify([...dailies, newDaily]));
    setOpenDailyModal(false);
    setDailyName('');
    setDescription('');
    setDailyDeliveryDate('');
    setDailyTag('');
  };

  const handleSprintSelect = (e) => {
    const selectedSprintId = e.target.value;
    setSelectedSprint(selectedSprintId);
    localStorage.setItem('selectedSprint', JSON.stringify(selectedSprintId));
  };

  useEffect(() => {
    if (project && project.projectMembers) {
      const colors = {};
      project.projectMembers.split(',').forEach((member) => {
        colors[member] = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
      });
      setAvatarColors(colors);
    }
  }, [project]);

  const stringAvatar = (name) => {
    if (typeof name === 'string') {
      const members = name.split(',');
      return {
        sx: {
          bgcolor: avatarColors[members[0]],
        },
        children: `${members[0].charAt(0).toUpperCase()}`,
      };
    } else {
      return {
        sx: {
          bgcolor: avatarColors[name],
        },
        children: `${name.charAt(0).toUpperCase()}`,
      };
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

      <button className='create-button' onClick={() => setOpenSprintModal(true)}>
        <span className='plus-icon'>
          <FontAwesomeIcon icon={faPlus} />
        </span>
        Criar Sprint
      </button>

      <button className='create-button' onClick={() => setOpenDailyModal(true)}>
        <span className='plus-icon'>
          <FontAwesomeIcon icon={faPlus} />
        </span>
        Criar Daily
      </button>

      <Modal isOpen={openSprintModal}>
        <div className='modal-sprint-inputs'>
          <ul className='sprint-inputs'>
            <li>
              <p>Nome</p>
              <input
                type='text'
                value={sprintName}
                onChange={(e) => setSprintName(e.target.value)}
                placeholder='Titulo da sprint'
              />
            </li>
            <li>
              <p>Data de entrega</p>
              <input type='date' value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} />
            </li>
          </ul>

          <button className='create-sprint' onClick={handleCreateSprint}>
            Criar Sprint
          </button>
        </div>
      </Modal>

      <Modal isOpen={openDailyModal}>
        <div className='modal-daily-inputs'>
          <ul className='daily-inputs'>
            <li>
              <p>Nome</p>
              <input
                type='text'
                value={dailyName}
                onChange={(e) => setDailyName(e.target.value)}
                placeholder='Titulo da daily'
              />
            </li>
            <li>
              <p>Descrição</p>
              <input
                type='text'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder='Descrição'
              />
            </li>
            <li>
              <p>Data de entrega</p>
              <input
                type='date'
                value={dailyDeliveryDate}
                onChange={(e) => setDailyDeliveryDate(e.target.value)}
              />
            </li>
            <li>
              <p>Sprint</p>
              <select value={selectedSprint} onChange={handleSprintSelect}>
                {sprints.map((sprint) => (
                  <option key={sprint.id} value={sprint.id}>
                    {sprint.name}
                  </option>
                ))}
              </select>
            </li>
            <li>
              <p>Tag</p>
              <select className='tag-select' value={dailyTag} onChange={(e) => setDailyTag(e.target.value)}>
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

      <select className='select-sprint' value={selectedSprint} onChange={handleSprintSelect}>
        {sprints.map((sprint) => (
          <option key={sprint.id} value={sprint.id}>
            {sprint.name}
          </option>
        ))}
      </select>

      {selectedSprint && (
        <ul className='sprints-list'>
          {sprints.find((sprint) => sprint.id === parseInt(selectedSprint)) ? (
            <li>
              Entrega da Sprint:{' '}
              {formatDate(sprints.find((sprint) => sprint.id === parseInt(selectedSprint)).deliveryDate)}
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
          <div className='pending-container'>
            {selectedSprint === '0' || (selectedSprint !== '' && selectedSprint !== null) ? (
              dailies
                .filter((daily) => daily.sprintId === parseInt(selectedSprint) && daily.tag === 'Pendente')
                .map((daily) => (
                  <div key={daily.id} className='daily-card'>
                    <h2>{daily.name}</h2>
                    <p>{daily.description}</p>
                    <p>Data de entrega: {formatDate(daily.deliveryDate)}</p>
                  </div>
                ))
            ) : (
              <p>Nenhum daily encontrado</p>
            )}
          </div>
          <div className='in-progress-container'>
            {selectedSprint === '0' || (selectedSprint !== '' && selectedSprint !== null) ? (
              dailies
                .filter(
                  (daily) => daily.sprintId === parseInt(selectedSprint) && daily.tag === 'Em progresso'
                )
                .map((daily) => (
                  <div key={daily.id} className='daily-card'>
                    <h2>{daily.name}</h2>
                    <p>{daily.description}</p>
                    <p>Data de entrega: {formatDate(daily.deliveryDate)}</p>
                  </div>
                ))
            ) : (
              <p>Nenhum daily encontrado</p>
            )}
          </div>
          <div className='completed-container'>
            {selectedSprint === '0' || (selectedSprint !== '' && selectedSprint !== null) ? (
              dailies
                .filter((daily) => daily.sprintId === parseInt(selectedSprint) && daily.tag === 'Concluido')
                .map((daily) => (
                  <div key={daily.id} className='daily-card'>
                    <h2>{daily.name}</h2>
                    <p>{daily.description}</p>
                    <p>Data de entrega: {formatDate(daily.deliveryDate)}</p>
                  </div>
                ))
            ) : (
              <p>Nenhum daily encontrado</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
