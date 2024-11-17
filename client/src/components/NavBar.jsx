import React, { useContext, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClockRotateLeft,
  faGear,
  faSquarePollVertical,
  faMoon,
  faUserPlus,
  faRightFromBracket,
} from '@fortawesome/free-solid-svg-icons';
import { faCalendar, faSun } from '@fortawesome/free-regular-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import '../assets/styles/Navbar.css';
import { ModalContext } from '../App';
import { userService } from '../services/api';

const Navbar = ({
  theme,
  setTheme,
  isVisible,
  setIsAuthenticated = () => {}, // Default no-op function
  userRole,
}) => {
  const { setOpenModal } = useContext(ModalContext);
  const navigate = useNavigate();
  console.log('Navbar - Received userRole:', userRole);

  const toggle_mode = () => {
    theme == 'light' ? setTheme('dark') : setTheme('light');
  };

  const handleLogout = async () => {
    try {
      // Call the logout service
      await userService.logout();

      // Update authentication state
      setIsAuthenticated(false);

      // Reset user role to default
      setUserRole('Usuário'); // If you have a way to update userRole in parent component

      // Remove any stored user data
      localStorage.removeItem('userName');
      localStorage.removeItem('image');
      localStorage.removeItem('formData');
      localStorage.removeItem('userRole'); // Add this line

      // Redirect to login page
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <nav className={`navbar ${isVisible ? '' : 'collapsed'}`}>
      {isVisible && (
        <div>
          <span className='button-to-dark-mode'>
            <FontAwesomeIcon icon={theme === 'light' ? faMoon : faSun} onClick={toggle_mode} />
          </span>
          <span className='logout-button' onClick={handleLogout}>
            <FontAwesomeIcon icon={faRightFromBracket} />
          </span>

          <ul className='list-navbar'>
            <li className={`navbar-items ${isVisible ? '' : 'collapsed'}`}>
              <Link to={'/'} className='link'>
                <span className='icon-wrapper-navbar'>
                  <FontAwesomeIcon icon={faSquarePollVertical} />
                </span>
                Projetos
              </Link>
            </li>
            <li className='navbar-items'>
              <Link to={'/calendar'} className='link'>
                <span className='icon-wrapper-navbar'>
                  <FontAwesomeIcon icon={faCalendar} />
                </span>
                Calendário
              </Link>
            </li>
            <li className={`navbar-items ${isVisible ? '' : 'collapsed'}`}>
              <Link to={'/history'} className='link'>
                <span className='icon-wrapper-navbar'>
                  <FontAwesomeIcon icon={faClockRotateLeft} />
                </span>
                Histórico
              </Link>
            </li>

            {userRole === 'Admin' && (
              <li className={`navbar-items ${isVisible ? '' : 'collapsed'}`}>
                <span className='icon-wrapper-navbar' onClick={() => setOpenModal(true)}>
                  <FontAwesomeIcon icon={faUserPlus} />
                </span>
                <span onClick={() => setOpenModal(true)}>Criar Usuário Gerente</span>
              </li>
            )}
            <li className={`navbar-items ${isVisible ? '' : 'collapsed'}`}>
              <Link to={'/settings'} className='link'>
                <span className='icon-wrapper-navbar'>
                  <FontAwesomeIcon icon={faGear} />
                </span>
                Configurações
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
