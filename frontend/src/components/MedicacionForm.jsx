import { useEffect, useState } from 'react';
import { create } from '../services/medications.service.js';
import { getAll as getPersonas } from '../services/dependents.service.js';

const FORMAS = ['comprimido', 'gota', 'ml', 'aplicacion'];
const hoy = () => new Date().toISOString().slice(0, 10);

const vacio = {
  persona_id: '',
  droga: '',
  nombre_comercial: '',
  concentracion: '',
  cantidad_por_toma: '',
  forma: 'comprimido',
  es_sos: false,
  fecha_inicio: hoy(),
};

// Alta de medicación. El persona_id sale del <select>, no se tipea a mano.
export default function MedicacionForm({ onCreated }) {
  const [form, setForm] = useState(vacio);
  const [personas, setPersonas] = useState([]);
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    getPersonas()
      .then(setPersonas)
      .catch(() => setError('No se pudieron cargar las personas a cargo.'));
  }, []);

  const cambiar = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const enviar = async (e) => {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      await create({ ...form, cantidad_por_toma: Number(form.cantidad_por_toma) });
      setForm({ ...vacio, persona_id: form.persona_id });
      onCreated?.();
    } catch (err) {
      // El backend explica qué falló en data.message
      setError(err.response?.data?.data?.message ?? 'No se pudo guardar la medicación.');
    } finally {
      setEnviando(false);
    }
  };

  const campo = { display: 'block', width: '100%', padding: 8, marginTop: 4, boxSizing: 'border-box' };

  return (
    <form onSubmit={enviar} style={{ display: 'grid', gap: 12, marginBottom: 24 }}>
      <label>
        Persona a cargo
        <select name="persona_id" value={form.persona_id} onChange={cambiar} required style={campo}>
          <option value="">Elegí una persona…</option>
          {personas.map((p) => (
            <option key={p.id} value={p.id}>{p.nombre_completo}</option>
          ))}
        </select>
      </label>
      <label>
        Droga
        <input name="droga" value={form.droga} onChange={cambiar} required style={campo} />
      </label>
      <label>
        Nombre comercial
        <input name="nombre_comercial" value={form.nombre_comercial} onChange={cambiar} style={campo} />
      </label>
      <label>
        Concentración
        <input name="concentracion" value={form.concentracion} onChange={cambiar} placeholder="10 mg" required style={campo} />
      </label>
      <div style={{ display: 'flex', gap: 12 }}>
        <label style={{ flex: 1 }}>
          Cantidad por toma
          <input name="cantidad_por_toma" type="number" step="0.25" min="0.25" value={form.cantidad_por_toma} onChange={cambiar} required style={campo} />
        </label>
        <label style={{ flex: 1 }}>
          Forma
          <select name="forma" value={form.forma} onChange={cambiar} style={campo}>
            {FORMAS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </label>
      </div>
      <label>
        Fecha de inicio
        <input name="fecha_inicio" type="date" value={form.fecha_inicio} onChange={cambiar} required style={campo} />
      </label>
      <label>
        <input name="es_sos" type="checkbox" checked={form.es_sos} onChange={cambiar} /> Es SOS (solo si hace falta)
      </label>
      {error && <p style={{ color: '#b00020', margin: 0 }}>{error}</p>}
      <button type="submit" disabled={enviando} style={{ padding: 10 }}>
        {enviando ? 'Guardando…' : 'Agregar medicación'}
      </button>
    </form>
  );
}
