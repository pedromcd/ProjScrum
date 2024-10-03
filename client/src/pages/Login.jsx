import React, { useState } from 'react';
import LoginForm from '../components/LoginForm';
import CadastroForm from '../components/CadastroForm';

const Login = () => {
  const [showLogin, setShowLogin] = useState(true);

  const toggleForm = () => {
    setShowLogin(!showLogin);
  };

  return (
    <div>{showLogin ? <LoginForm toggleForm={toggleForm} /> : <CadastroForm toggleForm={toggleForm} />}</div>
  );
};

export default Login;
