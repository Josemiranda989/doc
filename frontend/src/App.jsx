import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import MedicacionesPage from './pages/MedicacionesPage.jsx';
import PersonasPage from './pages/PersonasPage.jsx';

const link = ({ isActive }) => ({
  padding: '8px 12px',
  textDecoration: 'none',
  color: isActive ? '#fff' : '#1a1a1a',
  background: isActive ? '#1a1a1a' : 'transparent',
});

export default function App() {
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <h1 style={{ margin: 0, marginRight: 'auto' }}>CuidAR</h1>
        <nav style={{ display: 'flex', gap: 4 }}>
          <NavLink to="/medicaciones" style={link}>Medicaciones</NavLink>
          <NavLink to="/personas" style={link}>Personas a cargo</NavLink>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<Navigate to="/medicaciones" replace />} />
        <Route path="/medicaciones" element={<MedicacionesPage />} />
        <Route path="/personas" element={<PersonasPage />} />
        <Route path="*" element={<p>Esta página no existe.</p>} />
      </Routes>
    </main>
  );
}
