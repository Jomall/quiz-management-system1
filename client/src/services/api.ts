import axios from 'axios';
import { Quiz, Content, QuizSubmission, Request, User } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config: any) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`
    };
  }
  return config;
});

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (userData: any) =>
    api.post('/auth/register', userData),
  getProfile: () =>
    api.get('/auth/profile'),
};

// Quiz API
export const quizAPI = {
  getAll: () => api.get('/quizzes'),
  getById: (id: string) => api.get(`/quizzes/${id}`),
  create: (quizData: any) => api.post('/quizzes', quizData),
  update: (id: string, quizData: any) => api.put(`/quizzes/${id}`, quizData),
  delete: (id: string) => api.delete(`/quizzes/${id}`),
  submit: (quizId: string, answers: any[]) =>
    api.post(`/quizzes/${quizId}/submit`, { answers }),
  getResults: (quizId: string) => api.get(`/quizzes/${quizId}/results`),
  getStudentProgress: (studentId: string) =>
    api.get(`/quizzes/student/${studentId}/progress`),
};

// Content API
export const contentAPI = {
  getAll: () => api.get('/content'),
  getById: (id: string) => api.get(`/content/${id}`),
  create: (contentData: any) => api.post('/content', contentData),
  update: (id: string, contentData: any) => api.put(`/content/${id}`, contentData),
  delete: (id: string) => api.delete(`/content/${id}`),
};

// Request API
export const requestAPI = {
  getAll: () => api.get('/requests'),
  getById: (id: string) => api.get(`/requests/${id}`),
  create: (requestData: any) => api.post('/requests', requestData),
  update: (id: string, requestData: any) => api.put(`/requests/${id}`, requestData),
  delete: (id: string) => api.delete(`/requests/${id}`),
  getStudentRequests: (studentId: string) =>
    api.get(`/requests/student/${studentId}`),
  getInstructorRequests: (instructorId: string) =>
    api.get(`/requests/instructor/${instructorId}`),
};

// User API
export const userAPI = {
  getAll: () => api.get('/users'),
  getById: (id: string) => api.get(`/users/${id}`),
  update: (id: string, userData: any) => api.put(`/users/${id}`, userData),
  delete: (id: string) => api.delete(`/users/${id}`),
};

export default api;
