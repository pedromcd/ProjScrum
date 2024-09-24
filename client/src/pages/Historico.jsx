import React from 'react';
import Navbar from '../components/NavBar';
import Header from '../components/Header';

function Historico({ theme, setTheme, isNavbarVisible, toggleNavbar }) {
  return (
    <div className={`container ${theme}`}>
      <Header toggleNavbar={toggleNavbar} isNavbarVisible={isNavbarVisible} />
      <Navbar theme={theme} setTheme={setTheme} isVisible={isNavbarVisible} />
    </div>
  );
}

export default Historico;
