import apiClient from './api/api-client';

export interface Client {
  _id: string;
  name: string;
  email: string;
  role: 'client';
  isActive: boolean;
  status: 'active' | 'inactive' | 'suspended';
  accessExpiresAt?: string | null;
  customNote?: string;
  createdAt: string;
}

export const clientService = {
  getClients: async (): Promise<Client[]> => {
    const response = await apiClient.get('/auth/clients');
    return response.data;
  },

  registerClient: async (data: { name: string; email: string; password: string }): Promise<Client> => {
    const response = await apiClient.post('/auth/register', { ...data, role: 'client' });
    return response.data;
  },

  updateClient: async (id: string, data: Partial<Client>): Promise<any> => {
    const response = await apiClient.put(`/auth/clients/${id}`, data);
    return response.data;
  },
};
