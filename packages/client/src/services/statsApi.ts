import api from './api';

export const statsApi = {
  overview: (): Promise<{ success: boolean; data: any }> =>
    api.get('/stats/overview'),

  projectTrend: (): Promise<{ success: boolean; data: any[] }> =>
    api.get('/stats/projects/trend'),
};
