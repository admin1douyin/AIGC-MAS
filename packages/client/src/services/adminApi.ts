import api from './api';

export const adminApi = {
  getConfig: async (category: string) => {
    const res: any = await api.get(`/admin/config/${category}`);
    return res.data;
  },

  updateConfig: async (category: string, config: Record<string, string>) => {
    const res: any = await api.put(`/admin/config/${category}`, config);
    return res.data;
  },

  getSeedanceStatus: async () => {
    const res: any = await api.get('/admin/status/seedance');
    return res.data;
  },

  getPaymentStatus: async () => {
    const res: any = await api.get('/admin/status/payment');
    return res.data;
  },
};
