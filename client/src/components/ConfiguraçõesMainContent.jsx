import React, { useRef, useState, useEffect } from 'react';
import '../assets/styles/ConfiguraçõesMainContent.css';
import {
  Avatar,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from '@mui/material';
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

const ConfiguraçõesMainContent = ({ isNavbarVisible, setIsAuthenticated = () => {}, theme }) => {
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
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

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
        setSnackbarMessage('Erro ao carregar dados do usuário');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
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
          setSnackbarMessage('Arquivo muito grande. Máximo de 5MB.');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
          return;
        }

        // Compress the image
        const compressedImage = await compressImage(file);
        setImage(compressedImage);
      } catch (err) {
        console.error('Erro ao processar imagem:', err);
        setSnackbarMessage('Erro ao processar imagem');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  const handleSave = async () => {
    // Clear previous messages
    setSnackbarMessage('');

    // Validate inputs
    if (!formData.nome || !formData.email) {
      // Ensure email is validated
      setSnackbarMessage('Nome e Email são obrigatórios');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    // Check password match if senha is provided
    if (formData.senha && formData.senha !== formData.confirmarSenha) {
      setSnackbarMessage('As senhas não coincidem');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
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
      setSnackbarMessage('Perfil atualizado com sucesso!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      // Handle the response...
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      setSnackbarMessage(err.message || 'Erro ao atualizar perfil');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleRemoveImage = async () => {
    try {
      // Call update service to remove image
      const updateData = {
        nome: formData.nome,
        email: formData.email,
        imagem: '', // Send empty string to remove image
      };

      const response = await userService.updateUser(updateData);

      // Clear image state
      setImage('');

      // Update form data
      setFormData((prevData) => ({
        ...prevData,
        imagem: '',
      }));

      // Reset file input
      if (inputRef.current) {
        inputRef.current.value = '';
      }

      setSnackbarMessage('Imagem removida com sucesso!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Erro ao remover imagem:', err);

      // More detailed error logging
      const errorMessage = err.response?.data?.error || err.message || 'Erro ao remover imagem';

      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleDeleteAccount = async () => {
    // Validate delete confirmation
    if (deleteConfirmation.toLowerCase() !== 'excluir') {
      setSnackbarMessage('Por favor, digite "EXCLUIR" para confirmar');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      const response = await userService.deleteUser();

      // Use the provided setIsAuthenticated or fallback to a no-op
      if (typeof setIsAuthenticated === 'function') {
        setIsAuthenticated(false);
      }

      // Clear local storage
      localStorage.removeItem('userName');
      localStorage.removeItem('image');
      localStorage.removeItem('formData');
      localStorage.removeItem('auth_token');

      // Show success message
      setSnackbarMessage(response.data?.message || 'Conta excluída com sucesso');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);

      // Redirect to login page
      navigate('/login');
    } catch (error) {
      console.error('Erro ao excluir conta:', error);

      // More detailed error handling
      const errorMessage =
        error.response?.data?.details ||
        error.response?.data?.error ||
        error.message ||
        'Erro ao excluir conta';

      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      // Close the dialog
      setDeleteDialogOpen(false);
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
        <button className='delete-button' onClick={() => setDeleteDialogOpen(true)}>
          Excluir Conta
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

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          style: {
            backgroundColor: theme === 'dark' ? '#273142' : '#eff0f9',
            color: theme === 'dark' ? '#ffffff' : '#000000',
            borderRadius: '10px',
            padding: '20px',
            maxWidth: '500px',
            width: '100%',
          },
        }}
        sx={{
          '& .MuiDialog-paper': {
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          },
        }}
      >
        <DialogTitle
          sx={{
            color: theme === 'dark' ? '#ffffff' : '#000000',
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        >
          Confirmar Exclusão de Conta
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            sx={{
              color: theme === 'dark' ? '#cccccc' : '#333333',
              textAlign: 'center',
              marginBottom: '20px',
            }}
          >
            Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita. Para confirmar, digite
            "EXCLUIR" abaixo:
          </DialogContentText>
          <input
            type='text'
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            placeholder='Digite EXCLUIR'
            style={{
              width: '100%',
              padding: '12px',
              marginTop: '10px',
              boxSizing: 'border-box',
              borderRadius: '5px',
              border: '1px solid #ccc',
              backgroundColor: theme === 'dark' ? '#1b2431' : '#ffffff',
              color: theme === 'dark' ? '#ffffff' : '#000000',
              boxShadow: '1px 1px 5px rgba(84, 84, 84, 0.2)',
            }}
          />
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            color='primary'
            sx={{
              backgroundColor: '#eff0f9',
              color: '#000000',
              padding: '10px 20px',
              borderRadius: '5px',
              marginRight: '10px',
              '&:hover': {
                backgroundColor: '#d4d7e6',
              },
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteAccount}
            color='secondary'
            variant='contained'
            sx={{
              backgroundColor: '#e74c3c',
              color: '#ffffff',
              padding: '10px 20px',
              borderRadius: '5px',
              '&:hover': {
                backgroundColor: '#c0392b',
              },
            }}
          >
            Excluir Conta
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ConfiguraçõesMainContent;
