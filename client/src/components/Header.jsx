import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons/faBell';
import { Avatar } from '@mui/material';
import '../assets/styles/Header.css';

const Header = () => {
  return (
    <header className='header'>
      <ul className='current-page'>
        <li>Projetos</li>
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
