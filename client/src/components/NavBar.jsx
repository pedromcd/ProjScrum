import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons/faBars';
import { faCalendar } from '@fortawesome/free-regular-svg-icons/faCalendar';
import { faClockRotateLeft } from '@fortawesome/free-solid-svg-icons/faClockRotateLeft';
import { faGear } from '@fortawesome/free-solid-svg-icons/faGear';
import { faSquarePollVertical } from '@fortawesome/free-solid-svg-icons/faSquarePollVertical';
import { faMoon } from '@fortawesome/free-solid-svg-icons/faMoon';
import { faSun } from '@fortawesome/free-regular-svg-icons/faSun';
import '../assets/styles/Navbar.css';

const Navbar = ({ theme, setTheme }) => {
  const toggle_mode = () => {
    theme == 'light' ? setTheme('dark') : setTheme('light');
  };

  return (
    <nav className='navbar'>
      <FontAwesomeIcon icon={faBars} />

      <ul className='list-navbar'>
        <li className='navbar-items'>
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
        <li className='navbar-items'>
          <span className='icon-wrapper-navbar'>
            <FontAwesomeIcon icon={faClockRotateLeft} />
          </span>
          Histórico
        </li>
        <li className='navbar-items'>
          <span className='icon-wrapper-navbar'>
            <FontAwesomeIcon icon={faGear} />
          </span>
          Configurações
        </li>
      </ul>
      <span className='button-to-dark-mode'>
        <FontAwesomeIcon
          icon={theme === 'light' ? faMoon : faSun}
          onClick={() => {
            toggle_mode();
          }}
        />
      </span>
    </nav>
  );
};

export default Navbar;
