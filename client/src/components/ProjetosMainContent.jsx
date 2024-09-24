import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import '../assets/styles/ProjetosMainContent.css';
import Modal from './Modal';
import { useProjectCreation } from '../utils/generateCard';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { CustomPrevArrow, CustomNextArrow } from '../components/CustomArrows';

const ProjetosMainContent = ({ isNavbarVisible }) => {
  const [openModal, setOpenModal] = useState(false);

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
    isFormValid,
  } = useProjectCreation();

  const handleCreateProjectAndCloseModal = () => {
    handleCreateProject();
    setOpenModal(false);
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
      <button className='create-button' onClick={() => setOpenModal(true)}>
        <span className='plus-icon'>
          <FontAwesomeIcon icon={faPlus} />
        </span>
        Criar Projeto
      </button>

      <Modal isOpen={openModal}>
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
                type='text'
                placeholder='Membros'
                value={projectMembers}
                onChange={(e) => setProjectMembers(e.target.value)}
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
        </div>
      </Modal>

      {projectCards.length > 0 && (
        <div className='project-cards-container'>
          <Slider {...settings} prevArrow={<CustomPrevArrow />} nextArrow={<CustomNextArrow />}>
            {projectCards.map((card, index) => (
              <div key={index} className='project-card'>
                {card}
              </div>
            ))}
          </Slider>
        </div>
      )}
    </div>
  );
};

export default ProjetosMainContent;
