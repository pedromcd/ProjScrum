import React, { useState } from 'react';
import '../assets/styles/ProjectDetails.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import Modal from './Modal';

const ProjectDetails = ({ isNavbarVisible, project }) => {
  const [openModal, setOpenModal] = useState(false);

  if (!project) {
    return <div>No project found</div>;
  }

  return (
    <div className={`project-details-container ${isNavbarVisible ? '' : 'full-width'}`}>
      <button className='create-button' onClick={() => setOpenModal(true)}>
        <span className='plus-icon'>
          <FontAwesomeIcon icon={faPlus} />
        </span>
        Criar Sprint
      </button>

      <button className='create-button' onClick={() => setOpenModal(true)}>
        <span className='plus-icon'>
          <FontAwesomeIcon icon={faPlus} />
        </span>
        Criar Daily
      </button>

      <Modal isOpen={openModal}></Modal>

      <select className='select-sprint'></select>

      <div className='daily-container'>
        <div className='daily-header'>
          <div>Pendente</div>
          <div>Em progresso</div>
          <div>Concluido</div>
        </div>
        <div className='daily-cards'>
          <div>{project.projectDesc}</div>
          <div>{project.deliveryDate}</div>
          <div>{project.projectMembers}</div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
