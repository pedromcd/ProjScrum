import React, { useRef, useState, useEffect } from 'react';
import '../assets/styles/ConfiguraçõesMainContent.css';
import { Avatar } from '@mui/material';
import { userService } from '../services/api';
import { useNavigate } from 'react-router-dom';

// Image compression utility
const compressImage = async (file, maxWidth = 800, maxHeight = 800, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to base64 with specified quality
        const compressedImage = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedImage);
      };
    };
    reader.onerror = (error) => reject(error);
  });
};

const ConfiguraçõesMainContent = ({ isNavbarVisible }) => {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [image, setImage] = useState('');
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    imagem: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await userService.getCurrentUser();
        setFormData({
          nome: userData.nome,
          email: userData.email,
          senha: '',
          confirmarSenha: '',
          imagem: userData.imagem || '',
        });

        // Set image if exists in user data
        if (userData.imagem) {
          setImage(userData.imagem);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário', error);
        setError('Erro ao carregar dados do usuário');
      }
    };

    loadUserData();
  }, []);

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        // Validate file size
        if (file.size > 5 * 1024 * 1024) {
          // 5MB limit
          setError('Arquivo muito grande. Máximo de 5MB.');
          return;
        }

        // Compress the image
        const compressedImage = await compressImage(file);
        setImage(compressedImage);
      } catch (err) {
        console.error('Erro ao processar imagem:', err);
        setError('Erro ao processar imagem');
      }
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  const handleSave = async () => {
    // Clear previous messages
    setError('');
    setSuccess('');

    // Validate inputs
    if (!formData.nome || !formData.email) {
      // Ensure email is validated
      setError('Nome e Email são obrigatórios');
      return;
    }

    // Check password match if senha is provided
    if (formData.senha && formData.senha !== formData.confirmarSenha) {
      setError('As senhas não coincidem');
      return;
    }

    try {
      // Prepare data for update
      const updateData = {
        nome: formData.nome,
        email: formData.email, // Include email in the update
        ...(formData.senha && { senha: formData.senha }),
        ...(image && { imagem: image }), // Only send image if it exists
      };

      // Call update service
      const response = await userService.updateUser(updateData);
      // Handle the response...
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      setError(err.message || 'Erro ao atualizar perfil');
    }
  };

  const handleRemoveImage = async () => {
    try {
      // Call update service to remove image
      const updateData = {
        nome: formData.nome,
        imagem: '', // Send empty string to remove image
      };

      const response = await userService.updateUser(updateData);

      // Clear image state
      setImage('');

      // Update form data
      if (response.user) {
        setFormData((prevData) => ({
          ...prevData,
          imagem: '',
        }));
      }

      // Reset file input
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    } catch (err) {
      console.error('Erro ao remover imagem:', err);
      setError(err.message || 'Erro ao remover imagem');
    }
  };

  return (
    <div className={`settings-main-container ${isNavbarVisible ? '' : 'full-width'}`}>
      <div className='account-settings'>
        {error && <p className='error-message'>{error}</p>}
        {success && <p className='success-message'>{success}</p>}
        <ul className='settings-list'>
          <li>
            <p>Nome</p>
            <input
              type='text'
              name='nome'
              value={formData.nome}
              onChange={handleInputChange}
              placeholder='Nome'
            />
          </li>
          <li>
            <p>Email</p>
            <input
              type='text'
              name='email'
              value={formData.email}
              onChange={handleInputChange}
              placeholder='Email'
            />
          </li>
          <li>
            <p>Senha</p>
            <input
              type='password'
              name='senha'
              value={formData.senha}
              onChange={handleInputChange}
              placeholder='Nova senha (opcional)'
            />
          </li>
          <li>
            <p>Confirmar Senha</p>
            <input
              type='password'
              name='confirmarSenha'
              value={formData.confirmarSenha}
              onChange={handleInputChange}
              placeholder='Confirmar nova senha'
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
          <input
            type='file'
            ref={inputRef}
            onChange={handleImageChange}
            accept='image/*'
            style={{ display: 'none' }}
          />
          <button onClick={() => inputRef.current.click()}>Adicionar imagem</button>
          {image && <button onClick={handleRemoveImage}>Excluir</button>}
        </div>
      </div>
    </div>
  );
};

export default ConfiguraçõesMainContent;
