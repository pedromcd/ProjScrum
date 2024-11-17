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
import { Alert, Snackbar } from '@mui/material';

export const ModalContext = createContext();

export default function App() {
  const current_theme = localStorage.getItem('current_theme');
  const [theme, setTheme] = useState(current_theme ? current_theme : 'dark');
  const [isNavbarVisible, setNavbarVisible] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userList, setUserList] = useState([]);
  const [selectedRole, setSelectedRole] = useState('usuario');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [userRole, setUserRole] = useState(() => {
    // Initialize from localStorage or default
    return localStorage.getItem('userRole') || 'Usuário';
  });

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const userData = await userService.getCurrentUser();
        console.log('App - Full User Data:', userData);
        console.log('App - User Role:', userData.cargo);

        // Update both state and localStorage
        const normalizedRole = userData.cargo || 'Usuário';
        setUserRole(normalizedRole);
        localStorage.setItem('userRole', normalizedRole);
      } catch (error) {
        console.error('App - Error fetching user role:', error);
        // Reset role if fetch fails
        setUserRole('Usuário');
        localStorage.removeItem('userRole');
      }
    };

    // Only fetch if authenticated
    if (isAuthenticated) {
      fetchUserRole();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Check if the current path is not login or cadastro
        if (window.location.pathname === '/login' || window.location.pathname === '/cadastro') {
          return; // Skip fetching users
        }

        // First, get the current user
        const currentUser = await userService.getCurrentUser();

        // Then fetch all users
        const users = await userService.getAllUsers();

        // Transform users to match react-select format, excluding current user
        const formattedUserList = users
          .filter((user) => user.id !== currentUser.id) // Exclude current user
          .map((user) => ({
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
        if (window.location.pathname === '/login' || window.location.pathname === '/cadastro') {
          setIsLoading(false);
          return;
        }

        const startTime = Date.now();

        await userService.getCurrentUser();
        setIsAuthenticated(true);

        const elapsedTime = Date.now() - startTime;
        if (elapsedTime < 500) {
          await new Promise((resolve) => setTimeout(resolve, 500 - elapsedTime));
        }
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

  const handleCreateManager = async () => {
    // Validate inputs
    if (!selectedOption) {
      setSnackbarMessage('Por favor, selecione um usuário');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      // Clear previous messages
      setError('');
      setSuccess('');

      // Ensure the role is exactly as expected by the server
      const roleMapping = {
        usuario: 'Usuário',
        gerente: 'Gerente',
        admin: 'Admin',
      };

      const formattedRole = roleMapping[selectedRole.toLowerCase()] || selectedRole;

      const payload = {
        userId: selectedOption.value,
        role: formattedRole,
      };

      try {
        // Call API to update user role
        const response = await userService.updateUserRole(payload);

        // Validate response structure
        if (!response || !response.message) {
          throw new Error('Resposta inválida do servidor');
        }

        // Show success snackbar
        setSnackbarMessage(
          `Cargo do usuário atualizado de ${response.previousRole || 'Não especificado'} para ${
            response.newRole
          }`
        );
        setSnackbarSeverity('success');
        setSnackbarOpen(true);

        // Update the local user list to reflect the change
        const updatedUserList = userList.map((user) =>
          user.value === selectedOption.value ? { ...user, role: formattedRole } : user
        );
        setUserList(updatedUserList);

        // Close modal and reset selections
        setOpenModal(false);
        setSelectedOption(null);
        setSelectedRole('Usuário');
      } catch (apiError) {
        // More detailed API error handling
        console.error('Erro detalhado na API:', apiError);

        // Check if it's an axios error with response
        const errorMessage =
          apiError.response?.data?.error || apiError.message || 'Erro ao atualizar cargo do usuário';

        // Show error snackbar
        setSnackbarMessage(errorMessage);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);

        // Log additional error details
        if (apiError.response) {
          console.error('Error Response:', {
            data: apiError.response.data,
            status: apiError.response.status,
            headers: apiError.response.headers,
          });
        }
      }
    } catch (err) {
      // Catch any unexpected errors
      console.error('Erro inesperado:', err);

      // More detailed error handling
      const errorMessage =
        err.error ||
        (typeof err === 'object' && err.allowedRoles
          ? `Cargo inválido. Opções válidas: ${err.allowedRoles.join(', ')}`
          : 'Erro ao atualizar cargo do usuário');

      // Show error snackbar
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleChange = (selectedOption) => {
    setSelectedOption(selectedOption);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  if (isLoading) {
    return (
      <div className={`container ${theme}`}>
        <div className='loading-screen'>
          <div className='spinner' />
          <div>Carregando...</div>
        </div>
      </div>
    );
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
                  userRole={userRole}
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
                  userRole={userRole}
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
                  userRole={userRole}
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
                  userRole={userRole}
                />
              </PrivateRoute>
            }
          />
          <Route
            path='/project/:projectId'
            element={
              <PrivateRoute>
                <DetalhesProjeto
                  theme={theme}
                  setTheme={setTheme}
                  isNavbarVisible={isNavbarVisible}
                  toggleNavbar={toggleNavbar}
                  setIsAuthenticated={setIsAuthenticated}
                  userRole={userRole}
                />
              </PrivateRoute>
            }
          />

          {/* Public Routes */}
          <Route path='/login' element={<Login setIsAuthenticated={setIsAuthenticated} />} />
          <Route path='/cadastro' element={<Cadastro />} />
        </Routes>

        <Modal isOpen={openModal} theme={theme}>
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
                  className='custom-select'
                />
              </li>
              <li>
                <p>Cargo</p>
                <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
                  <option value='Usuário'>Usuário</option>
                  <option value='Gerente'>Gerente</option>
                </select>
              </li>
            </ul>
            <div className='modal-buttons'>
              <button onClick={handleCreateManager}>Criar</button>
              <button onClick={() => setOpenModal(false)}>Cancelar</button>
            </div>
          </div>
        </Modal>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          sx={{
            '& .MuiSnackbar-root': {
              zIndex: 10000, // Very high z-index
            },
            '& .MuiAlert-root': {
              zIndex: 10001, // Slightly higher than the Snackbar container
            },
          }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbarSeverity}
            sx={{
              width: '100%',
              zIndex: 10001, // Ensure the alert is above everything
              position: 'relative',
            }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </BrowserRouter>
    </ModalContext.Provider>
  );
}
