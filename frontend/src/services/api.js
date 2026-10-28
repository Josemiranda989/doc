// Cliente axios compartido por todos los services.
import axios from 'axios';
import { API_URL } from '../config.js';
import { supabase } from '../lib/supabase.js';

export const api = axios.create({ baseURL: `${API_URL}/api` });

// Cada request lleva el access token de la sesión. El backend lo verifica
// y de ahí saca quién es el usuario: el front no manda ningún caregiver_id.
api.interceptors.request.use(async (config) => {
  if (supabase) {
    const { data } = await supabase.auth.getSession(); // renueva el token si venció
    const token = data.session?.access_token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
