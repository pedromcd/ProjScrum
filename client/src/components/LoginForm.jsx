import React from 'react';
import '../assets/styles/LoginForm.css';
import { Link } from 'react-router-dom';

const LoginForm = () => {
  return (
    <main>
      <div className='login-background'>
        <div className='login-forms'>
          <h1>Login</h1>
          <ul className='login-inputs'>
            <li>
              <p>Email</p>
              <input type='text' placeholder='Email' />
            </li>
            <li>
              <p className='forgot-password'>Esqueci Minha Senha</p>
              <p>Senha</p>
              <input type='password' placeholder='Senha' />
            </li>
          </ul>
          <button className='login-button' type='submit'>
            Entrar
          </button>
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
