import React, { useEffect, useState } from 'react';
import Navbar from '../components/NavBar';
import Header from '../components/Header';
import ProjetosMainContent from '../components/ProjetosMainContent';

function Home() {
  const current_theme = localStorage.getItem('current_theme');
  const [theme, setTheme] = useState(current_theme ? current_theme : 'light');
  const [isNavbarVisible, setNavbarVisible] = useState(true);

  const toggleNavbar = () => {
    setNavbarVisible(!isNavbarVisible);
  };

  useEffect(() => {
    localStorage.setItem('current_theme', theme);
  }, [theme]);

  return (
    <div className={`container ${theme}`}>
      <Header toggleNavbar={toggleNavbar} />
      <Navbar theme={theme} setTheme={setTheme} isVisible={isNavbarVisible} />
      <ProjetosMainContent isNavbarVisible={isNavbarVisible} />
    </div>
  );
}

export default Home;
