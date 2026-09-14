import api from './api';

export const getSummary = async () => {
  const response = await api.get('/api/analytics/summary');
  return response.data;
};

export const getSlaBreaches = async () => {
  const response = await api.get('/api/analytics/sla-breaches');
  return response.data;
};

export const downloadPdfReport = async (params = {}) => {
  const response = await api.get('/api/analytics/report/pdf', {
    params,
    responseType: 'blob', // Expect binary PDF stream
  });
  return response.data;
};
