import React, { useState } from 'react';
import '../assets/styles/CadastroForm.css';
import { Link, useNavigate } from 'react-router-dom';
import { Snackbar, Alert } from '@mui/material';
import { userService } from '../services/api';

const CadastroForm = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [error, setError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePassword = (password) => {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return re.test(password);
  };

  const handleCadastro = async (e) => {
    e.preventDefault();

    const trimmedNome = nome.trim();
    const trimmedEmail = email.trim();

    if (!trimmedNome) {
      setError('Por favor, preencha o nome completo');
      setSnackbarOpen(true);
      return;
    }

    if (trimmedNome.length < 3) {
      setError('Nome deve ter pelo menos 3 caracteres');
      setSnackbarOpen(true);
      return;
    }

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

    if (!senha) {
      setError('Por favor, preencha a senha');
      setSnackbarOpen(true);
      return;
    }

    if (!validatePassword(senha)) {
      setError('Senha deve ter no mínimo 8 caracteres, incluindo maiúsculas, minúsculas e números');
      setSnackbarOpen(true);
      return;
    }

    if (!confirmarSenha) {
      setError('Por favor, confirme a senha');
      setSnackbarOpen(true);
      return;
    }

    if (senha !== confirmarSenha) {
      setError('As senhas não coincidem');
      setSnackbarOpen(true);
      return;
    }

    try {
      await userService.register({
        nome: trimmedNome,
        email: trimmedEmail,
        senha,
      });

      setError('');

      navigate('/login');
    } catch (err) {
      const errorMessage = err.message || 'Erro ao cadastrar usuário';
      setError(errorMessage);
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <div className='cadastro-background'>
      <div className='cadastro-forms'>
        <div className='have-account'>
          <h1>Ja possui uma conta?</h1>
          <Link to='/login' className='link-login'>
            <button>Fazer Login</button>
          </Link>
        </div>
        <div className='cadastro-area'>
          <h1>Cadastro</h1>
          <form onSubmit={handleCadastro}>
            <ul className='cadastro-inputs'>
              <li>
                <p>Nome</p>
                <input
                  type='text'
                  placeholder='Nome completo'
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </li>
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
              <li>
                <p>Confirmar Senha</p>
                <input
                  type='password'
                  placeholder='Confirmar Senha'
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                />
              </li>
            </ul>

            <button className='cadastro-button' type='submit'>
              Cadastrar-se
            </button>
          </form>
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
    </div>
  );
};

export default CadastroForm;
