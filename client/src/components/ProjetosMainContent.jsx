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
import { userService, projectService } from '../services/api';
import { Alert, Snackbar } from '@mui/material';

const ProjetosMainContent = ({ isNavbarVisible }) => {
  const [openModal, setOpenModal] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [userRole, setUserRole] = useState('Usuário');
  const [isLoading, setIsLoading] = useState(true);
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
    const fetchUserAndProjects = async () => {
      try {
        setIsLoading(true);

        const userData = await userService.getCurrentUser();
        setUserRole(userData.cargo || 'Usuário');

        const projects = await projectService.getProjetos();

        setProjectCards(projects || []);
      } catch (error) {
        console.error('Erro detalhado ao carregar projetos:', {
          message: error.message,
          response: error.response,
          data: error.response?.data,
        });

        setAlertMessage('Erro ao carregar projetos');
        setAlertSeverity('error');
        setAlertOpen(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndProjects();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const currentUser = await userService.getCurrentUser();

        const users = await userService.getAllUsers();

        const formattedUserOptions = users
          .filter((user) => user.id !== currentUser.id)
          .map((user) => ({
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
    setProjectMembers(selectedMembers);
  };

  const handleCreateProjectAndCloseModal = async () => {
    if (isCreating || !isFormValid) return;

    try {
      setIsCreating(true);

      const currentUser = await userService.getCurrentUser();

      const projectMembersWithCurrentUser = [...projectMembers.map((member) => member.value), currentUser.id];

      const uniqueProjectMembers = [...new Set(projectMembersWithCurrentUser)];

      const newProject = await projectService.criarProjeto({
        projectName,
        projectDesc,
        deliveryDate,
        projectMembers: uniqueProjectMembers,
      });

      setProjectCards((prev) => [...prev, newProject.project]);

      setProjectName('');
      setProjectDesc('');
      setDeliveryDate('');
      setProjectMembers([]);

      setOpenModal(false);
    } catch (error) {
      console.error('Erro ao criar projeto', error);

      setAlertMessage('Erro ao criar projeto');
      setAlertSeverity('error');
      setAlertOpen(true);
    } finally {
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
      await projectService.deletarProjeto(selectedCard);

      const newProjectCards = projectCards.filter((project) => project.id !== selectedCard);
      setProjectCards(newProjectCards);

      setOpenDeleteModal(false);
      setDeleteMode(false);
      setSelectedCard(null);

      setAlertMessage('Projeto deletado com sucesso');
      setAlertSeverity('success');
      setAlertOpen(true);
    } catch (error) {
      console.error('Erro ao deletar projeto:', error);

      const errorMessage = error.response?.data?.error || error.error || 'Erro ao deletar projeto';

      setAlertMessage(`Erro ao deletar projeto: ${errorMessage}`);
      setAlertSeverity('error');
      setAlertOpen(true);
    }
  };

  const handleAlertClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setAlertOpen(false);
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
      {(userRole === 'Admin' || userRole === 'Gerente') && (
        <span className={`trash-icon-project ${deleteMode ? 'active' : ''}`} onClick={handleTrashClick}>
          <FontAwesomeIcon icon={faTrashCan} />
        </span>
      )}

      {userRole === 'Admin' || userRole === 'Gerente' ? (
        <button className='create-button' onClick={() => setOpenModal(true)}>
          <span className='plus-icon'>
            <FontAwesomeIcon icon={faPlus} />
          </span>
          Criar Projeto
        </button>
      ) : (
        <div className='no-create-button'></div>
      )}

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
              <p>Descrição </p>
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

      {projectCards.length > 0 ? (
        <div className='project-cards-container'>
          <Slider {...settings} prevArrow={<CustomPrevArrow />} nextArrow={<CustomNextArrow />}>
            {projectCards.map((project) => (
              <div
                key={project.id}
                className={`project-card ${deleteMode ? 'shake' : ''}`}
                onClick={() => handleCardClick(project.id)}
              >
                <Link className='link' to={`/project/${project.id}`}>
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
      ) : (
        <div className='no-projects-message'>{userRole === 'Admin' ? '' : ''}</div>
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

      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ zIndex: 9999 }}
      >
        <Alert onClose={handleAlertClose} severity={alertSeverity} sx={{ width: '100%', zIndex: 9999 }}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ProjetosMainContent;
