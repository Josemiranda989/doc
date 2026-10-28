// src/services/medications.service.js
// Única capa que habla con /api/medications. Los componentes importan de acá.
import { api } from './api.js';

const BASE = '/medications';

// El backend envuelve todo en { status, data } -> devolvemos solo data
export const getAll = async (personaId) => {
  // Sin personaId trae todas; con personaId, solo las de esa persona.
  const res = await api.get(BASE, { params: personaId ? { personaId } : {} });
  return res.data.data;
};

export const getById = async (id) => {
  const res = await api.get(`${BASE}/${id}`);
  return res.data.data;
};

export const create = async (medicacion) => {
  const res = await api.post(BASE, medicacion);
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
