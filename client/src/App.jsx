import React, { createContext, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './assets/styles/index.css';
import Login from './pages/Login';
import Home from './pages/Home';
import Calendario from './pages/Calendario';
import Historico from './pages/Historico';
import Configuracoes from './pages/Configuracoes.jsx';
import DetalhesProjeto from './pages/DetalhesProjeto.jsx';
import Cadastro from './pages/Cadastro.jsx';
import Modal from './components/Modal.jsx';
import Select from 'react-select';

export const ModalContext = createContext();
const userList = [
  //Lista de usuarios para o componente <Select /> no modal
];

export default function App() {
  const current_theme = localStorage.getItem('current_theme');
  const [theme, setTheme] = useState(current_theme ? current_theme : 'light');
  const [isNavbarVisible, setNavbarVisible] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);

  const toggleNavbar = () => {
    setNavbarVisible(!isNavbarVisible);
  };

  useEffect(() => {
    localStorage.setItem('current_theme', theme);
  }, [theme]);

  const [openModal, setOpenModal] = useState(false);
  const [newManager, setNewManager] = useState({ user: '', position: '' });

  const handleCreateManager = () => {
    console.log('New manager:', newManager);
    setOpenModal(false);
    setNewManager({ user: '', position: '' });
  };

  const handleChange = (selectedOption) => {
    setSelectedOption(selectedOption);
  };

  return (
    <ModalContext.Provider value={{ setOpenModal }}>
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

        <Modal isOpen={openModal}>
          <div className='modal-manager-inputs'>
            <h2>Criar Usuário Gerente</h2>
            <ul className='manager-inputs'>
              <li>
                <p>Usuário</p>
                <Select options={userList} value={selectedOption} onChange={handleChange} />
              </li>
              <li>
                <p>Cargo</p>
                <select>
                  <option value='usuario'>Usuário</option>
                  <option value='gerente'>Gerente</option>
                </select>
              </li>
            </ul>
            <div className='modal-buttons'>
              <button onClick={handleCreateManager}>Criar</button>
              <button onClick={() => setOpenModal(false)}>Cancelar</button>
            </div>
          </div>
        </Modal>
      </BrowserRouter>
    </ModalContext.Provider>
  );
}
