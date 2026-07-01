import api from './api';

export const adminApi = {
  getConfig: async (category: string) => {
    return api.get(`/admin/config/${category}`);
  },

  updateConfig: async (category: string, config: Record<string, string>) => {
    return api.put(`/admin/config/${category}`, config);
  },

  getSeedanceStatus: async () => {
    return api.get('/admin/status/seedance');
  },

  getPaymentStatus: async () => {
    return api.get('/admin/status/payment');
  },

  initConfigs: async () => {
    return api.post('/admin/init-configs');
  },
};
