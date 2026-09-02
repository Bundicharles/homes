import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost/homes/backend/api',
  timeout: 30000,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === 'object') {
      return response.data;
    }
    return response;
  },
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    const errors = error.response?.data?.errors || {};
    return Promise.reject({ message, errors, status: error.response?.status || 500 });
  }
);

export const propertiesAPI = {
  getAll: (params) => api.get('/properties', { params }),
  getFeatured: (params) => api.get('/properties/featured', { params }),
  getLatest: (params) => api.get('/properties/latest', { params }),
  getBySlug: (slug) => api.get(`/properties/${slug}`),
  getFilterOptions: () => api.get('/properties/filter/options'),
  getTypes: () => api.get('/property-types'),
  getFeatures: () => api.get('/features'),
  trackView: (propertyId) => api.post(`/properties/${propertyId}/view`),
};

export const adminPropertiesAPI = {
  getAll: (params) => api.get('/admin/properties', { params }),
  getById: (id) => api.get(`/admin/properties/${id}`),
  create: (data) => api.post('/admin/properties', data),
  update: (id, data) => api.put(`/admin/properties/${id}`, data),
  delete: (id) => api.delete(`/admin/properties/${id}`),
  updateStatus: (id, data) => api.patch(`/admin/properties/${id}/status`, data),
  duplicate: (id) => api.post(`/admin/properties/${id}/duplicate`),
  bulkAction: (data) => api.post('/admin/properties/bulk', data),
};

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  checkAuth: () => api.get('/auth/check'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  verifyEmail: (data) => api.post('/auth/verify-email', data),
};

export const settingsAPI = {
  getPublic: () => api.get('/settings/public'),
  getAdmin: () => api.get('/admin/settings'),
  update: (data) => api.put('/admin/settings', data),
  getByGroup: (group) => api.get(`/admin/settings/${group}`),
  getSocialLinks: () => api.get('/admin/social-links'),
  createSocialLink: (data) => api.post('/admin/social-links', data),
  updateSocialLink: (id, data) => api.put(`/admin/social-links/${id}`, data),
  deleteSocialLink: (id) => api.delete(`/admin/social-links/${id}`),
  getEarbInfo: () => api.get('/admin/earb'),
  updateEarbInfo: (data) => api.put('/admin/earb', data),
};

export const inquiriesAPI = {
  submit: (data) => api.post('/inquiries', data),
  submitView: () => api.get('/customer/inquiries'),
  getMine: () => api.get('/customer/inquiries'),
  getById: (id) => api.get(`/customer/inquiries/${id}`),
  reply: (id, data) => api.post(`/customer/inquiries/${id}/messages`, data),
};

export const adminInquiriesAPI = {
  getAll: (params) => api.get('/admin/inquiries', { params }),
  getById: (id) => api.get(`/admin/inquiries/${id}`),
  update: (id, data) => api.put(`/admin/inquiries/${id}`, data),
  delete: (id) => api.delete(`/admin/inquiries/${id}`),
  addMessage: (id, data) => api.post(`/admin/inquiries/${id}/messages`, data),
  getStats: () => api.get('/admin/inquiries/stats'),
};

export const viewingAPI = {
  submit: (data) => api.post('/viewing-requests', data),
  getMine: () => api.get('/customer/viewings'),
};

export const adminViewingsAPI = {
  getAll: (params) => api.get('/admin/viewing-requests', { params }),
  getById: (id) => api.get(`/admin/viewing-requests/${id}`),
  update: (id, data) => api.patch(`/admin/viewing-requests/${id}`, data),
  delete: (id) => api.delete(`/admin/viewing-requests/${id}`),
};

export const adminStatsAPI = {
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  getCharts: (params) => api.get('/admin/analytics/charts', { params }),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
};

export const propertyTypesAPI = {
  getAll: () => api.get('/property-types'),
  getAdmin: () => api.get('/admin/property-types'),
  create: (data) => api.post('/admin/property-types', data),
  update: (id, data) => api.put(`/admin/property-types/${id}`, data),
  delete: (id) => api.delete(`/admin/property-types/${id}`),
};

export const featuresAPI = {
  getAll: () => api.get('/features'),
  getAdmin: () => api.get('/admin/features'),
  create: (data) => api.post('/admin/features', data),
  update: (id, data) => api.put(`/admin/features/${id}`, data),
  delete: (id) => api.delete(`/admin/features/${id}`),
};

export const adminVerificationAPI = {
  getAll: (params) => api.get('/admin/verifications', { params }),
  update: (id, data) => api.patch(`/admin/verifications/${id}`, data),
};

export const userProfileAPI = {
  updateProfile: (data) => api.put('/auth/profile', data),
  updatePassword: (data) => api.put('/auth/password', data),
};

export const favoritesAPI = {
  getAll: () => api.get('/favorites'),
  add: (data) => api.post('/favorites', data),
  remove: (id) => api.delete(`/favorites/${id}`),
};

export const interestedAPI = {
  getAll: () => api.get('/interested-properties'),
  add: (data) => api.post('/interested-properties', data),
  remove: (id) => api.delete(`/interested-properties/${id}`),
};

export const promotionsAPI = {
  getAll: () => api.get('/promotions'),
  getView: (id) => api.post('/promotions/view', { promotion_id: id }),
  getClick: (id) => api.post('/promotions/click', { promotion_id: id }),
};

export const adminPromotionsAPI = {
  getAll: () => api.get('/admin/promotions'),
  getById: (id) => api.get(`/admin/promotions/${id}`),
  create: (data) => api.post('/admin/promotions', data),
  update: (id, data) => api.put(`/admin/promotions/${id}`, data),
  delete: (id) => api.delete(`/admin/promotions/${id}`),
};

export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAllRead: () => api.patch('/notifications/read'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  delete: (id) => api.delete(`/notifications/${id}`),
};

export const mediaAPI = {
  upload: (file, directory, data) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('directory', directory);
    if (data?.alt_text) formData.append('alt_text', data.alt_text);
    if (data?.caption) formData.append('caption', data.caption);
    if (data?.title) formData.append('title', data.title);
    if (data?.description) formData.append('description', data.description);
    return api.post('/admin/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getAll: (params) => api.get('/admin/media', { params }),
  delete: (id) => api.delete(`/admin/media/${id}`),
  update: (id, data) => api.put(`/admin/media/${id}`, data),
};

export const customersAPI = {
  getAll: (params) => api.get('/admin/customers', { params }),
  getById: (id) => api.get(`/admin/customers/${id}`),
  update: (id, data) => api.patch(`/admin/customers/${id}`, data),
  disable: (data) => api.post('/admin/customers/disable', data),
};

export const agentsAPI = {
  getAll: (params) => api.get('/admin/agents', { params }),
  getById: (id) => api.get(`/admin/agents/${id}`),
  create: (data) => api.post('/admin/agents', data),
  update: (id, data) => api.put(`/admin/agents/${id}`, data),
  delete: (id) => api.delete(`/admin/agents/${id}`),
  getInquiries: (id) => api.get(`/admin/agents/${id}/inquiries`),
};

export const pagesAPI = {
  getAll: () => api.get('/admin/pages'),
  getBySlug: (slug) => api.get(`/pages/${slug}`),
  getById: (id) => api.get(`/admin/pages/${id}`),
  create: (data) => api.post('/admin/pages', data),
  update: (id, data) => api.put(`/admin/pages/${id}`, data),
  delete: (id) => api.delete(`/admin/pages/${id}`),
};

export const menusAPI = {
  getAll: () => api.get('/admin/menus'),
  create: (data) => api.post('/admin/menus', data),
  update: (id, data) => api.put(`/admin/menus/${id}`, data),
  delete: (id) => api.delete(`/admin/menus/${id}`),
};

export const testimonialsAPI = {
  getAll: () => api.get('/admin/testimonials'),
  getPublic: () => api.get('/testimonials'),
  create: (data) => api.post('/admin/testimonials', data),
  update: (id, data) => api.put(`/admin/testimonials/${id}`, data),
  delete: (id) => api.delete(`/admin/testimonials/${id}`),
};

export const faqsAPI = {
  getAll: () => api.get('/admin/faqs'),
  getPublic: () => api.get('/faqs'),
  create: (data) => api.post('/admin/faqs', data),
  update: (id, data) => api.put(`/admin/faqs/${id}`, data),
  delete: (id) => api.delete(`/admin/faqs/${id}`),
};

export const analyticsAPI = {
  getStats: () => api.get('/admin/dashboard/stats'),
  getCharts: (params) => api.get('/admin/analytics/charts', { params }),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
};

export const contactAPI = {
  submit: (data) => api.post('/contact', data),
};

export const seoAPI = {
  getMetadata: (params) => api.get('/seo/metadata', { params }),
  getByType: (type) => api.get(`/seo/metadata/${type}`),
  update: (type, data) => api.put(`/admin/seo/${type}`, data),
};

export const usersAPI = {
  getAll: (params) => api.get('/admin/users', { params }),
  getById: (id) => api.get(`/admin/users/${id}`),
  create: (data) => api.post('/admin/users', data),
  update: (id, data) => api.put(`/admin/users/${id}`, data),
  delete: (id) => api.delete(`/admin/users/${id}`),
  getRoles: () => api.get('/admin/roles'),
  updateRole: (id, data) => api.put(`/admin/roles/${id}`, data),
  serveDocument: (id) => api.get(`/admin/documents/serve/${id}`, { responseType: 'blob' }),
};

export const documentsAPI = {
  getAll: (params) => api.get('/admin/documents', { params }),
  getById: (id) => api.get(`/admin/documents/${id}`),
  upload: (file, data) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('property_id', data.property_id);
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.document_type) formData.append('document_type', data.document_type);
    if (data.visibility) formData.append('visibility', data.visibility);
    if (data.verification_id) formData.append('verification_id', data.verification_id);
    return api.post('/admin/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  update: (id, data) => api.put(`/admin/documents/${id}`, data),
  delete: (id) => api.delete(`/admin/documents/${id}`),
  serve: (id) => api.get(`/admin/documents/serve/${id}`, { responseType: 'blob' }),
};

export default api;
