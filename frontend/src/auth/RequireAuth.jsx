import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

// Envuelve las rutas privadas: sin sesión, manda a /login.
export default function RequireAuth({ children }) {
  const { authEnabled, cargando, user } = useAuth();
  const location = useLocation();

  if (!authEnabled) return children;
  if (cargando) return <p>Cargando sesión…</p>;
  if (!user) return <Navigate to="/login" replace state={{ desde: location.pathname }} />;
  return children;
}
