import React from 'react';
import Navbar from '../components/NavBar';
import Header from '../components/Header';
import HistoricoMainContent from '../components/HistoricoMainContent';

function Historico({ theme, setTheme, isNavbarVisible, toggleNavbar }) {
  return (
    <div className={`container ${theme}`}>
      <Header toggleNavbar={toggleNavbar} isNavbarVisible={isNavbarVisible} />
      <Navbar theme={theme} setTheme={setTheme} isVisible={isNavbarVisible} />
      <HistoricoMainContent isNavbarVisible={isNavbarVisible} />
    </div>
  );
}

export default Historico;
