import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const generateData = async () => {
  const response = await axios.post(`${API_BASE_URL}/generate-data`, { n_samples: 500, seed: 42 });
  return response.data;
};

export const trainModel = async (file, useGender) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('use_gender', useGender);

  const response = await axios.post(`${API_BASE_URL}/train-model`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const mitigateBias = async (file, useGender) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('use_gender', useGender);

  const response = await axios.post(`${API_BASE_URL}/mitigate-bias`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const explainBias = async (payload) => {
  const response = await axios.post(`${API_BASE_URL}/explainability/explain-bias`, payload);
  return response.data;
};

export const suggestFix = async (payload) => {
  const response = await axios.post(`${API_BASE_URL}/explainability/suggest-fix`, payload);
  return response.data;
};
