import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API请求失败:', error);
    return Promise.reject(error);
  }
);

// HTML相关API
export const htmlApi = {
  getAll: () => apiClient.get('/htmls'),
  getById: (id: string) => apiClient.get(`/htmls/${id}`),
  create: (data: any) => apiClient.post('/htmls', data),
  update: (id: string, data: any) => apiClient.put(`/htmls/${id}`, data),
  delete: (id: string) => apiClient.delete(`/htmls/${id}`),
  search: (query: string) => apiClient.get(`/htmls/search?q=${query}`),
  importFromUrl: (url: string) => apiClient.post('/htmls/import-url', { url }),
};

// 文件夹相关API
export const folderApi = {
  getAll: () => apiClient.get('/folders'),
  getTree: () => apiClient.get('/folders/tree'),
  create: (data: any) => apiClient.post('/folders', data),
  update: (id: string, data: any) => apiClient.put(`/folders/${id}`, data),
  delete: (id: string) => apiClient.delete(`/folders/${id}`),
};

// 标签相关API
export const tagApi = {
  getAll: () => apiClient.get('/tags'),
  getPopular: () => apiClient.get('/tags/popular'),
  create: (data: any) => apiClient.post('/tags', data),
};