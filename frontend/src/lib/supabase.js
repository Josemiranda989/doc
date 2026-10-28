// Cliente de Supabase para el navegador. Solo se usa para Auth:
// los datos siguen pasando por nuestro backend (services → API en Render).
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
// La "publishable key" (antes "anon key") es pública por diseño: puede ir en el front.
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Sin estas variables la app corre sin login (desarrollo local de C10–C12).
export const supabase = url && key ? createClient(url, key) : null;
export const authEnabled = Boolean(supabase);
