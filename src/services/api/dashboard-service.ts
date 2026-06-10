import apiClient from './api-client';

export interface DashboardTheme {
  primaryColor?: string;
  secondaryColor?: string;
}

export interface DashboardItem {
  _id: string;
  title: string;
  clientId: any; // Can be string or populated object
  period: string;
  isActive: boolean;
  theme?: DashboardTheme;
  createdAt: string;
  updatedAt: string;
}

export const dashboardService = {
  getGlobalStats: async () => {
    const response = await apiClient.get('/dashboards/stats');
    return response.data;
  },

  getDashboards: async (): Promise<DashboardItem[]> => {
    const response = await apiClient.get<DashboardItem[]>('/dashboards');
    return response.data;
  },

  createDashboard: async (data: {
    title: string;
    clientId: string;
    period: string;
    theme?: DashboardTheme;
    isActive?: boolean;
  }): Promise<DashboardItem> => {
    const response = await apiClient.post<DashboardItem>('/dashboards', data);
    return response.data;
  },

  updateDashboard: async (id: string, data: Partial<DashboardItem>): Promise<DashboardItem> => {
    const response = await apiClient.put<DashboardItem>(`/dashboards/${id}`, data);
    return response.data;
  },

  deleteDashboard: async (id: string): Promise<void> => {
    await apiClient.delete(`/dashboards/${id}`);
  }
};
