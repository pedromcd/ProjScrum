import React from 'react';
import Navbar from '../components/NavBar';
import Header from '../components/Header';
import CalendarioMainContent from '../components/CalendarioMainContent';

function Calendario({ theme, setTheme, isNavbarVisible, toggleNavbar }) {
  return (
    <div className={`container ${theme}`}>
      <Header toggleNavbar={toggleNavbar} isNavbarVisible={isNavbarVisible} />
      <Navbar theme={theme} setTheme={setTheme} isVisible={isNavbarVisible} />
      <CalendarioMainContent isNavbarVisible={isNavbarVisible} />
    </div>
  );
}

export default Calendario;
