import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClockRotateLeft, faGear, faSquarePollVertical, faMoon } from '@fortawesome/free-solid-svg-icons';
import { faCalendar, faSun } from '@fortawesome/free-regular-svg-icons';
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
              <span className='icon-wrapper-navbar'>
                <FontAwesomeIcon icon={faSquarePollVertical} />
              </span>
              Projetos
            </li>
            <li className='navbar-items'>
              <span className='icon-wrapper-navbar'>
                <FontAwesomeIcon icon={faCalendar} />
              </span>
              Calendário
            </li>
            <li className={`navbar-items ${isVisible ? '' : 'collapsed'}`}>
              <span className='icon-wrapper-navbar'>
                <FontAwesomeIcon icon={faClockRotateLeft} />
              </span>
              Histórico
            </li>
            <li className={`navbar-items ${isVisible ? '' : 'collapsed'}`}>
              <span className='icon-wrapper-navbar'>
                <FontAwesomeIcon icon={faGear} />
              </span>
              Configurações
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
