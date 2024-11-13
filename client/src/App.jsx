import React, { createContext, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { userService } from './services/api'; // Import the userService

export const ModalContext = createContext();
const userList = [
  //Lista de usuarios para o componente <Select /> no modal
];

export default function App() {
  const current_theme = localStorage.getItem('current_theme');
  const [theme, setTheme] = useState(current_theme ? current_theme : 'light');
  const [isNavbarVisible, setNavbarVisible] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const toggleNavbar = () => {
    setNavbarVisible(!isNavbarVisible);
  };

  useEffect(() => {
    localStorage.setItem('current_theme', theme);
  }, [theme]);

  // Authentication check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await userService.getCurrentUser();
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Private Route Component
  const PrivateRoute = ({ children }) => {
    if (isLoading) {
      return <div>Carregando...</div>;
    }

    return isAuthenticated ? children : <Navigate to='/login' />;
  };

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

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  if (isLoading) {
    return <div>Carregando...</div>; // Or a loading spinner
  }

  return (
    <ModalContext.Provider value={{ setOpenModal }}>
      <BrowserRouter>
        <Routes>
          <Route
            path='/'
            element={
              <PrivateRoute>
                <Home
                  theme={theme}
                  setTheme={setTheme}
                  isNavbarVisible={isNavbarVisible}
                  toggleNavbar={toggleNavbar}
                  setIsAuthenticated={setIsAuthenticated}
                />
              </PrivateRoute>
            }
          />
          <Route
            path='/calendar'
            element={
              <PrivateRoute>
                <Calendario
                  theme={theme}
                  setTheme={setTheme}
                  isNavbarVisible={isNavbarVisible}
                  toggleNavbar={toggleNavbar}
                  setIsAuthenticated={setIsAuthenticated}
                />
              </PrivateRoute>
            }
          />
          <Route
            path='/history'
            element={
              <PrivateRoute>
                <Historico
                  theme={theme}
                  setTheme={setTheme}
                  isNavbarVisible={isNavbarVisible}
                  toggleNavbar={toggleNavbar}
                  setIsAuthenticated={setIsAuthenticated}
                />
              </PrivateRoute>
            }
          />
          <Route
            path='/settings'
            element={
              <PrivateRoute>
                <Configuracoes
                  theme={theme}
                  setTheme={setTheme}
                  isNavbarVisible={isNavbarVisible}
                  toggleNavbar={toggleNavbar}
                  setIsAuthenticated={setIsAuthenticated}
                />
              </PrivateRoute>
            }
          />
          <Route
            path='/:projectName'
            element={
              <PrivateRoute>
                <DetalhesProjeto
                  theme={theme}
                  setTheme={setTheme}
                  isNavbarVisible={isNavbarVisible}
                  toggleNavbar={toggleNavbar}
                  setIsAuthenticated={setIsAuthenticated}
                />
              </PrivateRoute>
            }
          />

          {/* Public Routes */}
          <Route path='/login' element={<Login setIsAuthenticated={setIsAuthenticated} />} />
          <Route path='/cadastro' element={<Cadastro />} />
        </Routes>

        <Modal isOpen={openModal}>
          <div className='modal-close-button' onClick={handleCloseModal}>
            <FontAwesomeIcon icon={faCircleXmark} />
          </div>
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
