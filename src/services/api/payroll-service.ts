import apiClient from './api-client';

export interface PayrollUploadResponse {
  payrollId: string;
  message: string;
}

export const payrollService = {
  /**
   * Sube el archivo de payroll a la API.
   * @param clientId ID del cliente
   * @param period Período en formato MM-YYYY
   * @param file Objeto File (CSV)
   */
  uploadPayroll: async (clientId: string, period: string, file: File): Promise<PayrollUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post(`/payroll/${clientId}/${period}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Obtiene los datos de un payroll específico.
   */
  getPayroll: async (clientId: string, period: string, page = 1, limit = 100) => {
    const response = await apiClient.get(`/payroll/${clientId}/${period}`, {
      params: { page, limit }
    });
    return response.data;
  },

  /**
   * Obtiene estadísticas de un payroll (Soporta filtros v2).
   */
  getPayrollStats: async (clientId: string, period: string, filters: any = {}) => {
    const response = await apiClient.post(`/payroll/${clientId}/${period}/stats`, { filters });
    return response.data;
  },

  /**
   * Obtiene todos los períodos de nómina para un cliente.
   */
  getPayrollPeriods: async (clientId: string) => {
    const response = await apiClient.get(`/payroll/${clientId}/periods`);
    return response.data;
  },

  /**
   * Compara dos períodos de nómina.
   */
  comparePayrolls: async (clientId: string, periodA: string, periodB: string) => {
    const response = await apiClient.get(`/payroll/${clientId}/compare`, {
      params: { periodA, periodB }
    });
    return response.data;
  }
};
