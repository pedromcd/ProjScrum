import React from 'react';
import Navbar from '../components/NavBar';
import Header from '../components/Header';
import ProjetosMainContent from '../components/ProjetosMainContent';

function Home({ theme, setTheme, isNavbarVisible, toggleNavbar }) {
  return (
    <div className={`container ${theme}`}>
      <Header toggleNavbar={toggleNavbar} isNavbarVisible={isNavbarVisible} />
      <Navbar theme={theme} setTheme={setTheme} isVisible={isNavbarVisible} />
      <ProjetosMainContent isNavbarVisible={isNavbarVisible} />
    </div>
  );
}

export default Home;
