import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userService } from '../services/api';
import '../assets/styles/LoginForm.css';

const LoginForm = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Validate inputs
      if (!email || !senha) {
        setError('Por favor, preencha todos os campos');
        return;
      }

      // Call login API
      await userService.login({ email, senha });

      // Set authentication to true
      setIsAuthenticated(true);

      // Clear any previous errors
      setError('');

      // Redirect to home page or dashboard
      navigate('/');
    } catch (err) {
      // Handle login errors
      setError(err.message || 'Erro ao fazer login');
    }
  };

  return (
    <main>
      <div className='login-background'>
        <div className='login-forms'>
          <h1>Login</h1>
          {error && <p className='error-message'>{error}</p>}
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
                <p className='forgot-password'>Esqueci Minha Senha</p>
                <p>Senha</p>
                <input
                  type='password'
                  placeholder='Senha'
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                />
              </li>
            </ul>
            <button className='login-button' type='submit'>
              Entrar
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
    </main>
  );
};

export default LoginForm;
