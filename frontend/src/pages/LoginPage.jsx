import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

// Traduce los errores más comunes de Supabase Auth.
const mensajes = {
  invalid_credentials: 'Email o contraseña incorrectos.',
  user_already_exists: 'Ya existe una cuenta con ese email. Iniciá sesión.',
  weak_password: 'La contraseña es muy corta (mínimo 6 caracteres).',
  email_not_confirmed: 'Todavía no confirmaste tu email. Revisá tu casilla.',
};

export default function LoginPage() {
  const { authEnabled, user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [modo, setModo] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [aviso, setAviso] = useState(null);
  const [enviando, setEnviando] = useState(false);

  if (!authEnabled || user) return <Navigate to={location.state?.desde ?? '/medicaciones'} replace />;

  const enviar = async (e) => {
    e.preventDefault();
    setError(null);
    setAviso(null);
    setEnviando(true);
    const { data, error } = modo === 'login' ? await signIn(email, password) : await signUp(email, password);
    setEnviando(false);

    if (error) return setError(mensajes[error.code] ?? error.message);
    // Si el proyecto pide confirmar el email, signUp no devuelve sesión todavía.
    if (modo === 'signup' && !data.session) {
      return setAviso('Te mandamos un mail para confirmar la cuenta. Después iniciá sesión.');
    }
    navigate(location.state?.desde ?? '/medicaciones', { replace: true });
  };

  const campo = { display: 'block', width: '100%', padding: 8, marginTop: 4, boxSizing: 'border-box' };

  return (
    <section style={{ maxWidth: 360, margin: '48px auto' }}>
      <h2>{modo === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}</h2>
      <form onSubmit={enviar} style={{ display: 'grid', gap: 12 }}>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" style={campo} />
        </label>
        <label>
          Contraseña
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
            autoComplete={modo === 'login' ? 'current-password' : 'new-password'} style={campo} />
        </label>
        {error && <p role="alert" style={{ color: '#b00020', margin: 0 }}>{error}</p>}
        {aviso && <p role="status" style={{ color: '#1e6b35', margin: 0 }}>{aviso}</p>}
        <button type="submit" disabled={enviando} style={{ padding: 10 }}>
          {enviando ? 'Un momento…' : modo === 'login' ? 'Entrar' : 'Crear cuenta'}
        </button>
      </form>
      <p style={{ marginTop: 16 }}>
        {modo === 'login' ? '¿No tenés cuenta? ' : '¿Ya tenés cuenta? '}
        <button type="button" onClick={() => { setModo(modo === 'login' ? 'signup' : 'login'); setError(null); setAviso(null); }}
          style={{ background: 'none', border: 0, padding: 0, color: '#1a56db', cursor: 'pointer', textDecoration: 'underline' }}>
          {modo === 'login' ? 'Creá una' : 'Iniciá sesión'}
        </button>
      </p>
    </section>
  );
}
