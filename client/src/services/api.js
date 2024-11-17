import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true,
  timeout: 10000,
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
      const response = await api.post(
        '/login',
        {
          email: credentials.email,
          senha: credentials.senha,
          rememberMe: credentials.rememberMe || false,
        },
        {
          withCredentials: true,
        }
      );
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

  getAllUsers: async () => {
    try {
      const response = await api.get('/usuarios');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error.response?.data || new Error('Erro ao buscar usuários');
    }
  },

  updateUserRole: async (userData) => {
    try {
      const response = await api.put('/update-user-role', userData);

      return response.data;
    } catch (error) {
      console.error('Full error in updateUserRole:', {
        error: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
      });

      throw error.response?.data || new Error('Erro ao atualizar cargo do usuário');
    }
  },

  getUserByName: async (name) => {
    try {
      const encodedName = encodeURIComponent(name.trim());

      const response = await api.get(`/users/name/${encodedName}`);

      return response.data;
    } catch (error) {
      console.error(`Detailed error fetching user ${name}:`, {
        errorMessage: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  },

  deleteUser: async () => {
    try {
      const response = await api.delete('/delete-account');
      return response;
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      throw error;
    }
  },
};

export const projectService = {
  getProjetos: async () => {
    try {
      const response = await api.get('/projetos');

      return response.data;
    } catch (error) {
      console.error('Detailed error fetching projects:', {
        message: error.message,
        response: error.response,
        data: error.response?.data,
      });
      throw error;
    }
  },

  criarProjeto: async (projectData) => {
    try {
      const response = await api.post('/criar-projeto', projectData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      throw error.response?.data || new Error('Erro ao criar projeto');
    }
  },

  deletarProjeto: async (projectId) => {
    try {
      const response = await api.delete('/deletar-projeto', {
        data: { projectId },
      });
      return response.data;
    } catch (error) {
      console.error('Detailed deletion error:', {
        response: error.response,
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      });

      throw (
        error.response?.data || {
          error: 'Erro ao deletar projeto',
          details: error.message,
        }
      );
    }
  },

  getProjectByName: async (projectName) => {
    try {
      const response = await api.get(`/projects/${encodeURIComponent(projectName)}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  },

  getProjectById: async (projectId) => {
    try {
      const response = await api.get(`/projects/id/${projectId}`);
      return response.data;
    } catch (error) {
      console.error('Detailed error fetching project:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });

      throw (
        error.response?.data || {
          error: 'Erro ao buscar projeto',
          details: error.message,
        }
      );
    }
  },

  getSprintsByProjectId: async (projectId) => {
    try {
      const response = await api.get(`/project/${projectId}/sprints`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar sprints:', error);
      throw error.response?.data || new Error('Erro ao buscar sprints');
    }
  },

  getDailiesByProjectId: async (projectId) => {
    try {
      const response = await api.get(`/project/${projectId}/dailies`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar dailies:', error);
      throw error.response?.data || new Error('Erro ao buscar dailies');
    }
  },

  saveEndedSprint: async (endedSprintData) => {
    try {
      const response = await api.post('/finalizar-sprint', endedSprintData);
      return response.data;
    } catch (error) {
      console.error('Erro ao salvar sprint finalizada:', error);
      throw error.response?.data || new Error('Erro ao salvar sprint finalizada');
    }
  },

  getEndedSprintsByProjectId: async (projectId) => {
    try {
      const response = await api.get(`/project/${projectId}/ended-sprints`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar sprints finalizadas:', error);
      throw error;
    }
  },
};

export const sprintService = {
  criarSprint: async (sprintData) => {
    try {
      const response = await api.post('/criar-sprint', sprintData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar sprint:', error);
      throw error.response?.data || new Error('Erro ao criar sprint');
    }
  },

  criarDaily: async (dailyData) => {
    try {
      const response = await api.post('/criar-daily', dailyData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar daily:', error);
      throw error.response?.data || new Error('Erro ao criar daily');
    }
  },

  atualizarDailyTag: async (dailyId, newTag) => {
    try {
      const response = await api.put('/atualizar-daily-tag', { dailyId, newTag });
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar tag da daily:', error);
      throw error.response?.data || new Error('Erro ao atualizar tag da daily');
    }
  },

  deletarDaily: async (dailyId) => {
    try {
      const response = await api.delete(`/deletar-daily/${dailyId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao deletar daily:', error);
      throw error.response?.data || new Error('Erro ao deletar daily');
    }
  },

  finalizarSprint: async (sprintData) => {
    try {
      const response = await api.post('/finalizar-sprint', sprintData);
      return response.data;
    } catch (error) {
      console.error('Erro ao finalizar sprint:', error);
      throw error.response?.data || new Error('Erro ao finalizar sprint');
    }
  },

  finalizarDaily: async (dailyId) => {
    try {
      const response = await api.post(`/finalizar-daily/${dailyId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao finalizar daily:', error);
      throw error.response?.data || new Error('Erro ao finalizar daily');
    }
  },
};

export const calendarService = {
  createEvent: async (eventData) => {
    try {
      const response = await api.post('/events', eventData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      throw error.response?.data || new Error('Erro ao criar evento');
    }
  },

  getEvents: async () => {
    try {
      const response = await api.get('/events');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
      throw error.response?.data || new Error('Erro ao buscar eventos');
    }
  },

  updateEventDate: async (updateData) => {
    try {
      const response = await api.put(`/events/${updateData.eventId}/date`, {
        newDate: updateData.newDate,
      });
      return response.data;
    } catch (error) {
      console.error('Erro detalhado ao atualizar data do evento:', {
        message: error.message,
        response: error.response,
        config: error.config,
      });

      throw (
        error.response?.data || {
          error: 'Erro ao atualizar data do evento',
          details: error.message,
        }
      );
    }
  },

  deleteEvent: async (eventId) => {
    try {
      if (!eventId) {
        throw new Error('Event ID is required');
      }

      const response = await api.delete(`/events/${eventId}`);
      return response.data;
    } catch (error) {
      console.error('Detailed deletion error:', {
        message: error.message,
        response: error.response,
        config: error.config,
      });
      throw error.response?.data || new Error('Erro ao deletar evento');
    }
  },
};
