import { createContext, useContext, useEffect, useState } from 'react';
import { authEnabled, supabase } from '../lib/supabase.js';

const AuthContext = createContext(null);

// Expone la sesión a toda la app. Supabase la persiste y la renueva sola:
// acá no se toca el token a mano.
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [cargando, setCargando] = useState(authEnabled);

  useEffect(() => {
    if (!authEnabled) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCargando(false);
    });
    // Login, logout y renovación del token disparan este evento.
    const { data } = supabase.auth.onAuthStateChange((_evento, nueva) => setSession(nueva));
    return () => data.subscription.unsubscribe();
  }, []);

  const value = {
    authEnabled,
    cargando,
    session,
    user: session?.user ?? null, // el uid del usuario logueado es user.id
    signUp: (email, password) => supabase.auth.signUp({ email, password }),
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signOut: () => supabase.auth.signOut(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
