// ProjetosMainContent.jsx
import React, { useState, useEffect } from 'react';
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
import Select from 'react-select';
import { userService, projectService } from '../services/api'; // Add this import

const ProjetosMainContent = ({ isNavbarVisible }) => {
  const [openModal, setOpenModal] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false); // New state to prevent multiple submissions

  const {
    projectName,
    setProjectName,
    projectDesc,
    setProjectDesc,
    deliveryDate,
    setDeliveryDate,
    projectMembers,
    setProjectMembers,
    projectCards,
    setProjectCards,
    isFormValid,
  } = useProjectCreation();

  const [userOptions, setUserOptions] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projects = await projectService.getProjetos();
        setProjectCards(projects);
      } catch (error) {
        console.error('Erro ao carregar projetos', error);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await userService.getAllUsers();
        const formattedUserOptions = users.map((user) => ({
          value: user.id,
          label: user.nome,
        }));
        setUserOptions(formattedUserOptions);
      } catch (error) {
        console.error('Erro ao carregar usuários', error);
      }
    };

    fetchUsers();
  }, []);

  const handleMemberChange = (selectedMembers) => {
    // Convert selected members to an array of labels
    const memberNames = selectedMembers.map((member) => member.label);
    setProjectMembers(selectedMembers);
  };

  const handleCreateProjectAndCloseModal = async () => {
    // Prevent multiple submissions
    if (isCreating) return;

    // Validate form
    if (!isFormValid) {
      console.error('Formulário inválido');
      return;
    }

    try {
      setIsCreating(true);

      const newProject = await projectService.criarProjeto({
        projectName,
        projectDesc,
        deliveryDate,
        projectMembers: projectMembers.map((member) => member.value),
      });

      // Update project cards
      setProjectCards((prev) => [...prev, newProject.project]);

      // Reset form
      setProjectName('');
      setProjectDesc('');
      setDeliveryDate('');
      setProjectMembers([]);

      // Close modal
      setOpenModal(false); // Close the modal here
    } catch (error) {
      console.error('Erro ao criar projeto', error);
      // Optionally show an error message to the user
    } finally {
      // Reset creating state
      setIsCreating(false);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleTrashClick = () => {
    setDeleteMode((prevMode) => !prevMode);
  };

  const handleCardClick = (projectId) => {
    if (deleteMode) {
      setSelectedCard(projectId);
      setOpenDeleteModal(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCard) return;

    try {
      console.log('Attempting to delete project:', {
        projectId: selectedCard,
        projectName: projectCards.find((p) => p.id === selectedCard)?.projectName,
      });

      const response = await projectService.deletarProjeto(selectedCard);

      // Remove the deleted project from the list
      const newProjectCards = projectCards.filter((project) => project.id !== selectedCard);
      setProjectCards(newProjectCards);

      // Close modals and reset states
      setOpenDeleteModal(false);
      setDeleteMode(false);
      setSelectedCard(null);

      // Show a success message
      alert('Projeto deletado com sucesso');
    } catch (error) {
      console.error('Erro completo ao deletar projeto:', {
        error,
        response: error.response,
        data: error.response?.data,
      });

      // More detailed error handling
      const errorMessage =
        error.response?.data?.error ||
        error.error ||
        (typeof error === 'object' ? JSON.stringify(error) : 'Erro ao deletar projeto');

      // Show a more informative error message
      alert(`Erro ao deletar projeto: ${errorMessage}`);

      // Additional context logging
      if (error.response?.data?.details) {
        console.log('Detalhes do erro:', error.response.data.details);
      }
    }
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
              <Select
                isMulti
                options={userOptions}
                value={projectMembers}
                onChange={handleMemberChange}
                placeholder='Selecione os membros do projeto'
                className='custom-select'
              />
            </li>
          </ul>
          <button
            className='create-project'
            onClick={handleCreateProjectAndCloseModal}
            disabled={!isFormValid || isCreating}
          >
            {isCreating ? 'Criando...' : 'Criar'}
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
        <Modal isOpen={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
          <div className='modal-delete-daily'>
            <p>Tem certeza que deseja excluir esse projeto?</p>
            <div className='buttons-container'>
              <button className='delete-confirm' onClick={handleDeleteConfirm}>
                Sim
              </button>
              <button className='delete-cancel' onClick={() => setOpenDeleteModal(false)}>
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
