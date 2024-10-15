import React from 'react';
import Navbar from '../components/NavBar';
import Header from '../components/Header';
import ConfiguraçõesMainContent from '../components/ConfiguraçõesMainContent';

function Configuracoes({ theme, setTheme, isNavbarVisible, toggleNavbar }) {
  return (
    <div className={`container ${theme}`}>
      <Header toggleNavbar={toggleNavbar} isNavbarVisible={isNavbarVisible} />
      <Navbar theme={theme} setTheme={setTheme} isVisible={isNavbarVisible} />
      <ConfiguraçõesMainContent isNavbarVisible={isNavbarVisible} />
    </div>
  );
}

export default Configuracoes;
