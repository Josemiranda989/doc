import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import MedicacionesPage from './pages/MedicacionesPage.jsx';
import PersonasPage from './pages/PersonasPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RequireAuth from './auth/RequireAuth.jsx';
import { useAuth } from './auth/AuthContext.jsx';

const link = ({ isActive }) => ({
  padding: '8px 12px',
  textDecoration: 'none',
  color: isActive ? '#fff' : '#1a1a1a',
  background: isActive ? '#1a1a1a' : 'transparent',
});

export default function App() {
  const { authEnabled, user, signOut } = useAuth();

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <h1 style={{ margin: 0, marginRight: 'auto' }}>CuidAR</h1>
        {user || !authEnabled ? (
          <nav style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <NavLink to="/medicaciones" style={link}>Medicaciones</NavLink>
            <NavLink to="/personas" style={link}>Personas a cargo</NavLink>
            {user && (
              <>
                <span style={{ marginLeft: 12, fontSize: 14, color: '#555' }}>{user.email}</span>
                <button onClick={signOut} style={{ marginLeft: 8 }}>Salir</button>
              </>
            )}
          </nav>
        ) : null}
      </header>

      <Routes>
        <Route path="/" element={<Navigate to="/medicaciones" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/medicaciones" element={<RequireAuth><MedicacionesPage /></RequireAuth>} />
        <Route path="/personas" element={<RequireAuth><PersonasPage /></RequireAuth>} />
        <Route path="*" element={<p>Esta página no existe.</p>} />
      </Routes>
    </main>
  );
}
