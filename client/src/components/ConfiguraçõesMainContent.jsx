import React, { useRef, useState, useEffect } from 'react';
import '../assets/styles/ConfiguraçõesMainContent.css';
import { Avatar } from '@mui/material';

const ConfiguraçõesMainContent = ({ isNavbarVisible }) => {
  const inputRef = useRef(null);
  const [image, setImage] = useState('');
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
  });

  useEffect(() => {
    // Load existing data when component mounts
    const storedData = JSON.parse(localStorage.getItem('formData')) || {};
    setFormData({
      nome: localStorage.getItem('userName') || '',
      email: storedData.email || '',
      senha: '',
      confirmarSenha: '',
    });
    const storedImage = localStorage.getItem('image');
    if (storedImage) {
      setImage(storedImage);
    }
  }, []);

  const handleButtonClick = () => {
    inputRef.current.click();
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = function () {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  const handleSave = () => {
    const updatedData = { ...formData };
    if (updatedData.nome) {
      localStorage.setItem('userName', updatedData.nome);
    }
    if (updatedData.senha !== updatedData.confirmarSenha) {
      alert('As senhas não coincidem.');
      return;
    }
    if (!updatedData.senha) {
      delete updatedData.senha;
    }
    delete updatedData.confirmarSenha;
    localStorage.setItem('formData', JSON.stringify(updatedData));

    if (image) {
      localStorage.setItem('image', image);
    } else {
      localStorage.removeItem('image');
    }
  };

  return (
    <div className={`settings-main-container ${isNavbarVisible ? '' : 'full-width'}`}>
      <div className='account-settings'>
        <ul className='settings-list'>
          <li>
            <p>Nome</p>
            <input type='text' name='nome' onChange={handleInputChange} placeholder='Nome' />
          </li>
          <li>
            <p>Email</p>
            <input type='text' name='email' onChange={handleInputChange} placeholder='Email' />
          </li>
          <li>
            <p>Senha</p>
            <input type='password' name='senha' onChange={handleInputChange} placeholder='Senha' />
          </li>
          <li>
            <p>Confirmar Senha</p>
            <input
              type='password'
              name='confirmarSenha'
              onChange={handleInputChange}
              placeholder='Confirmar Senha'
            />
          </li>
        </ul>
        <button className='save-button' onClick={handleSave}>
          Salvar
        </button>
      </div>
      <div className='profile-picture'>
        {image ? (
          <Avatar className='avatar-preview' src={image} sx={{ width: 200, height: 200 }} />
        ) : (
          <Avatar className='avatar-preview' sx={{ width: 200, height: 200 }} />
        )}
        <div className='buttons'>
          <button onClick={handleButtonClick}>Adicionar imagem</button>
          <input type='file' ref={inputRef} onChange={handleImageChange} />
          <button
            onClick={() => {
              setImage('');
              inputRef.current.value = '';
            }}
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfiguraçõesMainContent;
