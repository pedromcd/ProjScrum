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

export default function App() {
  const current_theme = localStorage.getItem('current_theme');
  const [theme, setTheme] = useState(current_theme ? current_theme : 'light');
  const [isNavbarVisible, setNavbarVisible] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userList, setUserList] = useState([]);
  const [selectedRole, setSelectedRole] = useState('usuario');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await userService.getAllUsers();

        // Transform users to match react-select format
        const formattedUserList = users.map((user) => ({
          value: user.id,
          label: user.nome, // or user.email, depending on what you want to display
        }));

        setUserList(formattedUserList);
      } catch (error) {
        console.error('Erro ao carregar usuários', error);
      }
    };

    fetchUsers();
  }, []);

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

  const handleCreateManager = async () => {
    // Validate inputs
    if (!selectedOption) {
      setError('Por favor, selecione um usuário');
      return;
    }

    try {
      // Clear previous messages
      setError('');
      setSuccess('');

      // Call API to update user role
      const response = await userService.updateUserRole({
        userId: selectedOption.value,
        role: selectedRole,
      });

      // Update success message
      setSuccess('Cargo do usuário atualizado com sucesso');

      // Optional: Update the local user list to reflect the change
      const updatedUserList = userList.map((user) =>
        user.value === selectedOption.value ? { ...user, role: selectedRole } : user
      );
      setUserList(updatedUserList);

      // Close modal and reset selections
      setOpenModal(false);
      setSelectedOption(null);
      setSelectedRole('usuario');
    } catch (err) {
      // Handle any errors
      setError(err.message || 'Erro ao atualizar cargo do usuário');
    }
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
                <Select
                  options={userList}
                  value={selectedOption}
                  onChange={setSelectedOption}
                  placeholder='Selecione um usuário'
                />
              </li>
              <li>
                <p>Cargo</p>
                <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
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
