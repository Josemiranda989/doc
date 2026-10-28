import { useEffect, useState } from 'react';
import { create, update } from '../services/medications.service.js';
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
  estado: 'activa',
};

// Alta y edición. Si recibe `editando`, carga esa medicación y guarda con update (PATCH).
export default function MedicacionForm({ editando, onSaved, onCancel }) {
  // El form se inicializa con lo que se edita. La página lo remonta con key
  // cada vez que cambia `editando`, así no hace falta sincronizar con un effect.
  const [form, setForm] = useState(editando ? { ...vacio, ...pick(editando) } : vacio);
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
    const datos = { ...form, cantidad_por_toma: Number(form.cantidad_por_toma) };
    try {
      if (editando) {
        await update(editando.id, datos);
        onSaved?.('Medicación actualizada');
      } else {
        await create(datos);
        setForm({ ...vacio, persona_id: form.persona_id });
        onSaved?.('Medicación creada');
      }
    } catch (err) {
      setError(err.response?.data?.data?.message ?? 'No se pudo guardar la medicación.');
    } finally {
      setEnviando(false);
    }
  };

  const campo = { display: 'block', width: '100%', padding: 8, marginTop: 4, boxSizing: 'border-box' };

  return (
    <form onSubmit={enviar} style={{ display: 'grid', gap: 12, marginBottom: 24, padding: 16, background: editando ? '#fff8e1' : 'transparent' }}>
      {editando && <strong>Editando: {editando.nombre_comercial || editando.droga}</strong>}
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
      {editando && (
        <label>
          Estado
          <select name="estado" value={form.estado} onChange={cambiar} style={campo}>
            <option value="activa">activa</option>
            <option value="discontinuada">discontinuada</option>
          </select>
        </label>
      )}
      {error && <p style={{ color: '#b00020', margin: 0 }}>{error}</p>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" disabled={enviando} style={{ padding: 10, flex: 1 }}>
          {enviando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Agregar medicación'}
        </button>
        {editando && <button type="button" onClick={onCancel} style={{ padding: 10 }}>Cancelar</button>}
      </div>
    </form>
  );
}

// Solo los campos que el form edita (el resto no se manda en el PATCH).
function pick(m) {
  const { persona_id, droga, nombre_comercial, concentracion, cantidad_por_toma, forma, es_sos, fecha_inicio, estado } = m;
  return { persona_id, droga, nombre_comercial: nombre_comercial ?? '', concentracion, cantidad_por_toma, forma, es_sos, fecha_inicio, estado };
}
