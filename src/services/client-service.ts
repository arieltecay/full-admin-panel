import apiClient from './api/api-client';
import { Client } from '../pages/clients/types';

export const clientService = {
  getClients: async (): Promise<Client[]> => {
    const response = await apiClient.get('/clients');
    return response.data;
  },

  registerClient: async (data: { name: string; email: string; password: string; managerPassword?: string }): Promise<Client> => {
    const response = await apiClient.post('/auth/register', { ...data, role: 'client' });
    return response.data;
  },

  updateClient: async (id: string, data: Partial<Client>): Promise<any> => {
    const response = await apiClient.put(`/clients/${id}`, data);
    return response.data;
  },
};
