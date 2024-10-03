import React from 'react';
import '../assets/styles/CadastroForm.css';
import { Link } from 'react-router-dom';

const CadastroForm = () => {
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
          <ul className='cadastro-inputs'>
            <li>
              <p>Nome</p>
              <input type='text' placeholder='Nome completo' />
            </li>
            <li>
              <p>Email</p>
              <input type='text' placeholder='Email' />
            </li>
            <li>
              <p>Senha</p>
              <input type='password' placeholder='Senha' />
            </li>
            <li>
              <p>Confirmar Senha</p>
              <input type='password' placeholder='Confirmar Senha' />
            </li>
          </ul>

          <button className='cadastro-button' type='submit'>
            Cadastrar-se
          </button>
        </div>
      </div>
    </div>
  );
};

export default CadastroForm;
