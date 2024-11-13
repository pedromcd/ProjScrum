import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true, // Important for sending cookies
});

export const userService = {
  register: async (userData) => {
    try {
      const response = await api.post('/cadastrar', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error('Erro ao cadastrar usuário');
    }
  },

  login: async (credentials) => {
    try {
      const response = await api.post('/login', credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error('Erro ao fazer login');
    }
  },

  async getCurrentUser() {
    try {
      const response = await api.get('/usuarioLogado');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar usuário:', error.response?.data || error.message);

      // If unauthorized, redirect to login
      if (error.response && error.response.status === 401) {
        window.location.href = '/login';
      }

      throw error;
    }
  },

  logout: async () => {
    try {
      await api.get('/logout');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  },

  updateUser: async (userData) => {
    try {
      const response = await api.put('/updateUser', userData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error.response?.data || error);
      throw error.response?.data || new Error('Erro ao atualizar usuário');
    }
  },
};
