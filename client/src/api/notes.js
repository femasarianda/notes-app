import api from './axios';

export const getNotes = (params) => api.get('/notes', { params });
export const createNote = (data) => api.post('/notes', data);
export const updateNote = (id, data) => api.put(`/notes/${id}`, data);
export const deleteNote = (id) => api.delete(`/notes/${id}`);
export const pinNote = (id) => api.patch(`/notes/${id}/pin`);
export const restoreNote = (id) => api.patch(`/notes/${id}/restore`);
export const permanentDelete = (id) => api.delete(`/notes/${id}/permanent`);