// src/services/dependents.service.js
// Única capa que habla con /api/dependents. Los componentes importan de acá.
import { api } from './api.js';

const BASE = '/dependents';

// El backend envuelve todo en { status, data } -> devolvemos solo data
export const getAll = async () => {
  const res = await api.get(BASE);
  return res.data.data;
};

export const getById = async (id) => {
  const res = await api.get(`${BASE}/${id}`);
  return res.data.data;
};

export const create = async (persona) => {
  const res = await api.post(BASE, persona);
  return res.data.data;
};

export const update = async (id, cambios) => {
  const res = await api.patch(`${BASE}/${id}`, cambios); // PATCH, no PUT
  return res.data.data;
};

export const remove = async (id) => {
  const res = await api.delete(`${BASE}/${id}`);
  return res.data.data;
};
