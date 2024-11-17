import React from 'react';
import Navbar from '../components/NavBar';
import Header from '../components/Header';
import ConfiguraçõesMainContent from '../components/ConfiguraçõesMainContent';

function Configuracoes({ theme, setTheme, isNavbarVisible, toggleNavbar, setIsAuthenticated, userRole }) {
  return (
    <div className={`container ${theme}`}>
      <Header toggleNavbar={toggleNavbar} isNavbarVisible={isNavbarVisible} />
      <Navbar
        theme={theme}
        setTheme={setTheme}
        isVisible={isNavbarVisible}
        setIsAuthenticated={setIsAuthenticated}
        userRole={userRole}
      />
      <ConfiguraçõesMainContent
        isNavbarVisible={isNavbarVisible}
        theme={theme}
        setIsAuthenticated={setIsAuthenticated}
      />
    </div>
  );
}

export default Configuracoes;
