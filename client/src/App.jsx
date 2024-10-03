import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './assets/styles/index.css';
import Login from './pages/Login';
import Home from './pages/Home';
import Calendario from './pages/Calendario';
import Historico from './pages/Historico';
import Configuracoes from './pages/Configuracoes.jsx';
import DetalhesProjeto from './pages/DetalhesProjeto.jsx';
import Cadastro from './pages/Cadastro.jsx';

export default function App() {
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
    <BrowserRouter>
      <Routes>
        <Route
          path='/'
          exact
          Component={() => (
            <Home
              theme={theme}
              setTheme={setTheme}
              isNavbarVisible={isNavbarVisible}
              toggleNavbar={toggleNavbar}
            />
          )}
        />
        <Route
          path='/calendar'
          exact
          Component={() => (
            <Calendario
              theme={theme}
              setTheme={setTheme}
              isNavbarVisible={isNavbarVisible}
              toggleNavbar={toggleNavbar}
            />
          )}
        />
        <Route
          path='/history'
          exact
          Component={() => (
            <Historico
              theme={theme}
              setTheme={setTheme}
              isNavbarVisible={isNavbarVisible}
              toggleNavbar={toggleNavbar}
            />
          )}
        />
        <Route
          path='/settings'
          exact
          Component={() => (
            <Configuracoes
              theme={theme}
              setTheme={setTheme}
              isNavbarVisible={isNavbarVisible}
              toggleNavbar={toggleNavbar}
            />
          )}
        />
        <Route
          path='/:projectName'
          exact
          Component={() => (
            <DetalhesProjeto
              theme={theme}
              setTheme={setTheme}
              isNavbarVisible={isNavbarVisible}
              toggleNavbar={toggleNavbar}
            />
          )}
        />
        <Route path='/login' exact Component={() => <Login />} />
        <Route path='/cadastro' exact Component={() => <Cadastro />} />
      </Routes>
    </BrowserRouter>
  );
}
