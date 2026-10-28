// Único lugar donde se define a qué backend le pega el front.
// - En dev, sin VITE_API_URL: '' → las llamadas van a /api y las resuelve el proxy de Vite.
// - En producción (Vercel): VITE_API_URL = URL de Render, SIN /api al final.
export const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');
