import api from './api';

export const classifyPreview = async (text, category) => {
  const response = await api.post('/api/complaints/classify-preview', { text, category });
  return response.data;
};

export const createComplaint = async (formData) => {
  const response = await api.post('/api/complaints', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getMyComplaints = async (params = {}) => {
  const response = await api.get('/api/complaints/mine', { params });
  return response.data;
};

export const getAllComplaints = async (params = {}) => {
  const response = await api.get('/api/complaints', { params });
  return response.data;
};

export const getComplaintById = async (id) => {
  const response = await api.get(`/api/complaints/${id}`);
  return response.data;
};

export const updateComplaintStatus = async (id, statusData) => {
  const response = await api.patch(`/api/complaints/${id}/status`, statusData);
  return response.data;
};

export const submitFeedback = async (id, feedbackData) => {
  const response = await api.post(`/api/complaints/${id}/feedback`, feedbackData);
  return response.data;
};
