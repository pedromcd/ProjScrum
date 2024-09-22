import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClockRotateLeft, faGear, faSquarePollVertical, faMoon } from '@fortawesome/free-solid-svg-icons';
import { faCalendar, faSun } from '@fortawesome/free-regular-svg-icons';
import { Link } from 'react-router-dom';
import '../assets/styles/Navbar.css';

const Navbar = ({ theme, setTheme, isVisible }) => {
  const toggle_mode = () => {
    theme == 'light' ? setTheme('dark') : setTheme('light');
  };

  return (
    <nav className={`navbar ${isVisible ? '' : 'collapsed'}`}>
      {isVisible && (
        <div>
          <span className='button-to-dark-mode'>
            <FontAwesomeIcon
              icon={theme === 'light' ? faMoon : faSun}
              onClick={() => {
                toggle_mode();
              }}
            />
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
