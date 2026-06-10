import apiClient from './api/api-client';

export interface HomeConfig {
  _id?: string;
  companyName: string;
  mission: string;
  tasks: string[];
  heroImageUrl?: string;
}

export const homeService = {
  getConfig: async (): Promise<HomeConfig> => {
    const response = await apiClient.get('/home');
    return response.data;
  },

  updateConfig: async (data: Partial<HomeConfig>): Promise<HomeConfig> => {
    const response = await apiClient.put('/home', data);
    return response.data;
  },
};
