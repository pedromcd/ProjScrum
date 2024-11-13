// ProjetosMainContent.jsx
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark, faPlus, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import '../assets/styles/ProjetosMainContent.css';
import Modal from './Modal';
import { useProjectCreation } from '../utils/generateCard';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { CustomPrevArrow, CustomNextArrow } from '../components/CustomArrows';
import { Link } from 'react-router-dom';

const ProjetosMainContent = ({ isNavbarVisible }) => {
  const [openModal, setOpenModal] = useState(false);
  const [memberName, setMemberName] = useState('');
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const {
    projectName,
    setProjectName,
    projectDesc,
    setProjectDesc,
    deliveryDate,
    setDeliveryDate,
    projectMembers,
    setProjectMembers,
    handleCreateProject,
    projectCards,
    setProjectCards,
    isFormValid,
  } = useProjectCreation();

  const handleCreateProjectAndCloseModal = () => {
    handleCreateProject();
    setOpenModal(false);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleTrashClick = () => {
    setDeleteMode((prevMode) => !prevMode);
  };

  const handleCardClick = (projectId) => {
    if (deleteMode) {
      console.log('Selected project for deletion:', projectId);
      setSelectedCard(projectId);
      setOpenDeleteModal(true);
    }
  };

  const handleDeleteConfirm = () => {
    console.log('Deleting project with ID:', selectedCard);
    console.log('Projects before deletion:', projectCards);

    const newProjectCards = projectCards.filter((project) => project.id !== selectedCard);

    console.log('Projects after deletion:', newProjectCards);

    setProjectCards(newProjectCards);
    setOpenDeleteModal(false);
    setDeleteMode(false);
    setSelectedCard(null);
  };

  const handleDeleteCancel = () => {
    setOpenDeleteModal(false);
    setSelectedCard(null);
  };

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: projectCards.length < 3 ? projectCards.length : 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: projectCards.length < 3 ? projectCards.length : 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: projectCards.length < 2 ? projectCards.length : 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
    prevArrow: <div style={{ color: '#black' }} />,
    nextArrow: <div style={{ color: '#black' }} />,
  };

  return (
    <div className={`projects-main-content ${isNavbarVisible ? '' : 'full-width'}`}>
      <span className={`trash-icon-project ${deleteMode ? 'active' : ''}`} onClick={handleTrashClick}>
        <FontAwesomeIcon icon={faTrashCan} />
      </span>

      <button className='create-button' onClick={() => setOpenModal(true)}>
        <span className='plus-icon'>
          <FontAwesomeIcon icon={faPlus} />
        </span>
        Criar Projeto
      </button>

      <Modal isOpen={openModal}>
        <div className='modal-close-button' onClick={handleCloseModal}>
          <FontAwesomeIcon icon={faCircleXmark} />
        </div>
        <div className='modal-project-inputs'>
          <ul className='project-inputs'>
            <li>
              <p>Nome</p>
              <input
                type='text'
                placeholder='Nome do projeto'
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </li>
            <li>
              <p>Descrição</p>
              <input
                type='text'
                placeholder='Descrição do projeto'
                value={projectDesc}
                onChange={(e) => setProjectDesc(e.target.value)}
              />
            </li>
            <li>
              <p>Data de entrega</p>
              <input type='date' value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} />
            </li>
            <li>
              <p>Adicionar membros</p>
              <input
                className='select-members'
                type='text'
                placeholder='Aperte enter para adicionar'
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    setProjectMembers([...projectMembers, memberName]);
                    setMemberName('');
                  }
                }}
              />
            </li>
          </ul>
          <button
            className='create-project'
            onClick={handleCreateProjectAndCloseModal}
            disabled={!isFormValid}
          >
            Criar
          </button>
          <button className='cancel-project' onClick={handleCloseModal}>
            Cancelar
          </button>
        </div>
      </Modal>

      {projectCards.length > 0 && (
        <div className='project-cards-container'>
          <Slider {...settings} prevArrow={<CustomPrevArrow />} nextArrow={<CustomNextArrow />}>
            {projectCards.map((project) => (
              <div
                key={project.id}
                className={`project-card ${deleteMode ? 'shake' : ''}`}
                onClick={() => handleCardClick(project.id)}
              >
                <Link className='link' to={`/${project.projectName}`}>
                  <div className='project-cards'>
                    <h1>{project.projectName}</h1>
                    <h2>{project.projectDesc}</h2>
                    <h3>Data de entrega: {project.deliveryDate}</h3>
                  </div>
                </Link>
                {deleteMode && <FontAwesomeIcon icon={faCircleXmark} className='delete-icon' />}
              </div>
            ))}
          </Slider>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {openDeleteModal && (
        <Modal isOpen={openDeleteModal} onClose={handleDeleteCancel}>
          <div className='modal-delete-daily'>
            <p>Tem certeza que deseja excluir esse projeto?</p>
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
      )}
    </div>
  );
};

export default ProjetosMainContent;
