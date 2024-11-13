import React, { useState } from 'react';
import '../assets/styles/CadastroForm.css';
import { Link, useNavigate } from 'react-router-dom';
import { userService } from '../services/api'; // Import the userService

const CadastroForm = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCadastro = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (!nome || !email || !senha || !confirmarSenha) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    // Check if passwords match
    if (senha !== confirmarSenha) {
      setError('As senhas não coincidem');
      return;
    }

    try {
      // Send the request to the correct endpoint
      await userService.register({ nome, email, senha });

      // Clear any previous errors
      setError('');

      // Redirect to login page
      navigate('/login');
    } catch (err) {
      // Handle registration errors
      setError(err.message || 'Erro ao cadastrar usuário');
    }
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
          {error && <p className='error-message'>{error}</p>}
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
    </div>
  );
};

export default CadastroForm;
