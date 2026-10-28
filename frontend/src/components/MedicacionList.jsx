import { useEffect, useState } from 'react';
import { getAll } from '../services/medications.service.js';

// Lista de medicaciones. Si recibe personaId, muestra solo las de esa persona.
// refreshTrigger cambia cada vez que se crea algo → vuelve a pedir la lista.
export default function MedicacionList({ personaId, refreshTrigger }) {
  const [medicaciones, setMedicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      setError(null);
      try {
        setMedicaciones(await getAll(personaId));
      } catch {
        setError('No se pudieron cargar las medicaciones.');
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [personaId, refreshTrigger]);

  if (loading) return <p>Cargando medicaciones…</p>;
  if (error) return <p style={{ color: '#b00020' }}>{error}</p>;

  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {medicaciones.map((m) => (
        <li key={m.id} style={{ padding: '12px 0', borderBottom: '1px solid #ddd' }}>
          <strong>{m.nombre_comercial || m.droga}</strong> · {m.droga} {m.concentracion}
          <div style={{ fontSize: 14, color: '#555' }}>
            {m.cantidad_por_toma} {m.forma} · {m.estado}
            {m.es_sos && ' · SOS'}
          </div>
        </li>
      ))}
    </ul>
  );
}
