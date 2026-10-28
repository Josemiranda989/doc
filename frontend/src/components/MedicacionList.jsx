import { useCallback, useEffect, useState } from 'react';
import { getAll, remove } from '../services/medications.service.js';

// Lista de medicaciones con los tres estados: loading, error (con reintentar) y vacía.
export default function MedicacionList({ refreshTrigger, onEdit, onDeleted }) {
  const [medicaciones, setMedicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setMedicaciones(await getAll());
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar, refreshTrigger]);

  const eliminar = async (m) => {
    if (!window.confirm(`¿Eliminar ${m.nombre_comercial || m.droga}?`)) return;
    try {
      await remove(m.id);
      onDeleted?.(m);
      cargar();
    } catch {
      setError(new Error('delete'));
    }
  };

  if (loading) return <p>Cargando medicaciones…</p>;

  if (error)
    return (
      <div role="alert" style={{ color: '#b00020' }}>
        <p>No se pudieron cargar las medicaciones. Intentá de nuevo.</p>
        <button onClick={cargar} style={{ padding: '6px 12px' }}>Reintentar</button>
      </div>
    );

  if (medicaciones.length === 0)
    return <p style={{ color: '#555' }}>No hay medicaciones cargadas. Cargá la primera.</p>;

  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {medicaciones.map((m) => (
        <li key={m.id} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #ddd' }}>
          <div style={{ marginRight: 'auto' }}>
            <strong>{m.nombre_comercial || m.droga}</strong> · {m.droga} {m.concentracion}
            <div style={{ fontSize: 14, color: m.estado === 'discontinuada' ? '#999' : '#555' }}>
              {m.cantidad_por_toma} {m.forma} · {m.estado}
              {m.es_sos && ' · SOS'}
            </div>
          </div>
          <button onClick={() => onEdit?.(m)}>Editar</button>
          <button onClick={() => eliminar(m)}>Eliminar</button>
        </li>
      ))}
    </ul>
  );
}
