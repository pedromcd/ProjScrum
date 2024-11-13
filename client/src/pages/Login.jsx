import React from 'react';
import LoginForm from '../components/LoginForm';

const Login = ({ setIsAuthenticated }) => {
  return <LoginForm setIsAuthenticated={setIsAuthenticated} />;
};

export default Login;
