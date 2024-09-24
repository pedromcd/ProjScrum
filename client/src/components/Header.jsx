import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faBars } from '@fortawesome/free-solid-svg-icons';
import { Avatar } from '@mui/material';
import '../assets/styles/Header.css';
import { useLocation } from 'react-router-dom';

const getStoredProjects = () => {
  return JSON.parse(localStorage.getItem('projects')) || [];
};

const pageNameMapping = {
  '/': 'Meus Projetos',
  '/calendar': 'Calendário',
  '/history': 'Histórico',
  '/settings': 'Configurações da Conta',
};

const Header = ({ toggleNavbar, isNavbarVisible }) => {
  const location = useLocation();

  const [projectNames, setProjectNames] = useState([]);

  useEffect(() => {
    const storedProjects = getStoredProjects();
    const names = storedProjects.map((project) => project.projectName);
    setProjectNames(names);
  }, []);

  let currentPageName = pageNameMapping[location.pathname];

  if (!currentPageName && location.pathname !== '/') {
    const projectName = decodeURIComponent(location.pathname.substring(1));
    if (projectNames.includes(projectName)) {
      currentPageName = `${projectName}`;
    } else {
      currentPageName = 'Projeto Inválido';
    }
  }

  return (
    <header className={`header ${isNavbarVisible ? '' : 'full-width'}`}>
      <span className='menu-button'>
        <FontAwesomeIcon icon={faBars} onClick={toggleNavbar} />
      </span>

      <ul className='current-page'>
        <li>{currentPageName}</li>
      </ul>

      <div className='user-details'>
        <span className='icon-wrapper-header'>
          <FontAwesomeIcon icon={faBell} />
        </span>

        <Avatar className='avatar'>LG</Avatar>

        <ul className='user-info-list'>
          <li className='info-list-name'>Nome Usuario</li>
          <li className='info-list-position'>Cargo</li>
        </ul>
      </div>
    </header>
  );
};

export default Header;
