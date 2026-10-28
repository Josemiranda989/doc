import { useCallback, useEffect, useState } from 'react';
import { getAll, remove } from '../services/dependents.service.js';

export default function PersonaACargoList({ refreshTrigger, onEdit, onDeleted }) {
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setPersonas(await getAll());
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar, refreshTrigger]);

  const eliminar = async (p) => {
    // ON DELETE CASCADE: al borrar la persona, Postgres borra también su medicación.
    const ok = window.confirm(
      `¿Eliminar a ${p.nombre_completo}? También se eliminan todas sus medicaciones.`
    );
    if (!ok) return;
    try {
      await remove(p.id);
      onDeleted?.(p);
      cargar();
    } catch {
      setError(new Error('delete'));
    }
  };

  if (loading) return <p>Cargando personas a cargo…</p>;

  if (error)
    return (
      <div role="alert" style={{ color: '#b00020' }}>
        <p>No se pudieron cargar las personas a cargo. Intentá de nuevo.</p>
        <button onClick={cargar} style={{ padding: '6px 12px' }}>Reintentar</button>
      </div>
    );

  if (personas.length === 0)
    return <p style={{ color: '#555' }}>No hay personas a cargo. Cargá la primera.</p>;

  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {personas.map((p) => (
        <li key={p.id} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #ddd' }}>
          <div style={{ marginRight: 'auto' }}>
            <strong>{p.nombre_completo}</strong> · {p.edad} años
            {(p.parentesco || p.obra_social) && (
              <div style={{ fontSize: 14, color: '#555' }}>
                {[p.parentesco, p.obra_social].filter(Boolean).join(' · ')}
              </div>
            )}
          </div>
          <button onClick={() => onEdit?.(p)}>Editar</button>
          <button onClick={() => eliminar(p)}>Eliminar</button>
        </li>
      ))}
    </ul>
  );
}
