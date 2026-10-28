// src/services/dependents.service.js
// Única capa que habla con /api/dependents. Los componentes importan de acá.
import axios from 'axios';

const BASE = '/api/dependents';

// El backend envuelve todo en { status, data } -> devolvemos solo data
export const getAll = async () => {
  const res = await axios.get(BASE);
  return res.data.data;
};

export const getById = async (id) => {
  const res = await axios.get(`${BASE}/${id}`);
  return res.data.data;
};

export const create = async (persona) => {
  const res = await axios.post(BASE, persona);
  return res.data.data;
};

export const update = async (id, cambios) => {
  const res = await axios.patch(`${BASE}/${id}`, cambios); // PATCH, no PUT
  return res.data.data;
};

export const remove = async (id) => {
  const res = await axios.delete(`${BASE}/${id}`);
  return res.data.data;
};
