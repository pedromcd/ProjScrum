import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faBars } from '@fortawesome/free-solid-svg-icons';
import { Avatar } from '@mui/material';
import '../assets/styles/Header.css';
import { useLocation, useParams } from 'react-router-dom';
import { userService, projectService } from '../services/api';

const pageNameMapping = {
  '/': 'Meus Projetos',
  '/calendar': 'Calendário',
  '/history': 'Histórico',
  '/settings': 'Configurações da Conta',
};

const Header = ({ toggleNavbar, isNavbarVisible }) => {
  const location = useLocation();
  const params = useParams();
  const [currentPageName, setCurrentPageName] = useState('');
  const [userName, setUserName] = useState('');
  const [userImage, setUserImage] = useState('');
  const [userRole, setUserRole] = useState('Usuário');

  useEffect(() => {
    const determinePageName = async () => {
      // Check predefined page mappings first
      if (pageNameMapping[location.pathname]) {
        setCurrentPageName(pageNameMapping[location.pathname]);
        return;
      }

      // Check if we're on a project page
      if (location.pathname.startsWith('/project/')) {
        try {
          // Fetch project details using the project ID from URL params
          const projectId = params.projectId;
          const projectData = await projectService.getProjectById(projectId);

          // Set project name from fetched data
          setCurrentPageName(projectData.projectName || 'Projeto');
        } catch (error) {
          console.error('Error fetching project name:', error);
          setCurrentPageName('Projeto');
        }
        return;
      }

      // Fallback for any other routes
      setCurrentPageName('Página');
    };

    determinePageName();
  }, [location.pathname, params.projectId]);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await userService.getCurrentUser();
        setUserName(userData.nome);
        setUserImage(userData.imagem);

        setUserRole(userData.cargo || 'Usuário');
      } catch (error) {
        console.error('Erro ao carregar dados do usuário', error);
      }
    };

    loadUserData();
  }, []);

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

        {userImage ? (
          <Avatar className='avatar' sx={{ width: 50, height: 50 }} src={userImage} />
        ) : (
          <Avatar className='avatar' sx={{ width: 50, height: 50 }}>
            {userName && userName.trim() !== ''
              ? userName
                  .split(' ')
                  .filter((name) => name.length > 2)
                  .map((name, index, array) =>
                    index === 0 || index === array.length - 1 ? name[0].toUpperCase() : ''
                  )
                  .join('')
                  .slice(0, 2)
              : ''}
          </Avatar>
        )}

        <ul className='user-info-list'>
          <li className='info-list-name'>{userName}</li>
          <li className='info-list-position'>{userRole}</li>
        </ul>
      </div>
    </header>
  );
};

export default Header;
