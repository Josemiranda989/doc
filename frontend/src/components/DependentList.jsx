import { useEffect, useState } from 'react';
import { getAll } from '../services/dependents.service.js';

// Tarea async de C10: listado de la entidad padre, reusando su service.
export default function DependentList() {
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAll()
      .then(setPersonas)
      .catch(() => setError('No se pudieron cargar las personas a cargo.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Cargando personas a cargo…</p>;
  if (error) return <p style={{ color: '#b00020' }}>{error}</p>;

  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {personas.map((p) => (
        <li key={p.id} style={{ padding: '12px 0', borderBottom: '1px solid #ddd' }}>
          <strong>{p.nombre_completo}</strong> · {p.edad} años
          {p.obra_social && <span style={{ color: '#555' }}> · {p.obra_social}</span>}
        </li>
      ))}
    </ul>
  );
}
