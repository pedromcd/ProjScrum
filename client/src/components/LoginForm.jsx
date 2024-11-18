import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userService } from '../services/api';
import '../assets/styles/LoginForm.css';
import { Snackbar, Alert, CircularProgress, Checkbox, FormControlLabel } from '@mui/material';

const LoginForm = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedSenha = senha.trim();

    if (!trimmedEmail) {
      setError('Por favor, preencha o email');
      setSnackbarOpen(true);
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setError('Por favor, insira um email válido');
      setSnackbarOpen(true);
      return;
    }

    if (!trimmedSenha) {
      setError('Por favor, preencha a senha');
      setSnackbarOpen(true);
      return;
    }

    setLoading(true);

    try {
      const loginData = {
        email: trimmedEmail,
        senha: trimmedSenha,
        rememberMe: rememberMe,
      };

      await userService.login(loginData);

      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('userEmail', trimmedEmail);
      } else {
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('userEmail');
      }

      setIsAuthenticated(true);

      setError('');

      navigate('/');
    } catch (err) {
      const errorMessage =
        err.error || err.message || 'Erro ao fazer login: E-mail ou senha incorretos. Tente novamente.';

      setError(errorMessage);
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    const rememberedEmail = localStorage.getItem('userEmail');
    const isRemembered = localStorage.getItem('rememberMe') === 'true';

    if (isRemembered && rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <main>
      <div className='login-background'>
        <div className='login-forms'>
          <h1>Login</h1>
          <form onSubmit={handleLogin}>
            <ul className='login-inputs'>
              <li>
                <p>Email</p>
                <input
                  type='text'
                  placeholder='Email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </li>
              <li>
                <p>Senha</p>
                <input
                  type='password'
                  placeholder='Senha'
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                />
              </li>
              <li className='remember-me-container'>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      color='primary'
                    />
                  }
                  label='Manter-me conectado'
                />
              </li>
            </ul>
            <button className='login-button' type='submit' disabled={loading}>
              {loading ? <CircularProgress size={24} color='inherit' /> : 'Entrar'}
            </button>
          </form>
          <p className='create-account-link'>
            Não possui uma conta?
            <span>
              <Link to='/cadastro' className='link-cadastro'>
                Cadastrar-se
              </Link>
            </span>
          </p>
        </div>
      </div>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity='error' sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </main>
  );
};

export default LoginForm;
