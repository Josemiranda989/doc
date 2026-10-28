import { useState } from 'react';
import { create, update } from '../services/dependents.service.js';

const vacio = {
  nombre_completo: '',
  fecha_nacimiento: '',
  dni: '',
  parentesco: '',
  obra_social: '',
  numero_afiliado: '',
  notas: '',
};
const CAMPOS = Object.keys(vacio);

// Los opcionales vacíos van como null, no como "".
const limpiar = (form) =>
  Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v === '' ? null : v]));

export default function PersonaACargoForm({ editando, onSaved, onCancel }) {
  // La página remonta el form con key cuando cambia `editando`.
  const [form, setForm] = useState(() =>
    editando ? Object.fromEntries(CAMPOS.map((c) => [c, editando[c] ?? ''])) : vacio
  );
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const enviar = async (e) => {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      if (editando) {
        await update(editando.id, limpiar(form));
        onSaved?.('Persona actualizada');
      } else {
        await create(limpiar(form));
        setForm(vacio);
        onSaved?.('Persona creada');
      }
    } catch (err) {
      setError(err.response?.data?.data?.message ?? 'No se pudo guardar la persona.');
    } finally {
      setEnviando(false);
    }
  };

  const campo = { display: 'block', width: '100%', padding: 8, marginTop: 4, boxSizing: 'border-box' };
  const input = (name, label, props = {}) => (
    <label style={{ flex: 1 }}>
      {label}
      <input name={name} value={form[name]} onChange={cambiar} style={campo} {...props} />
    </label>
  );

  return (
    <form onSubmit={enviar} style={{ display: 'grid', gap: 12, marginBottom: 24, padding: 16, background: editando ? '#fff8e1' : 'transparent' }}>
      {editando && <strong>Editando: {editando.nombre_completo}</strong>}
      {input('nombre_completo', 'Nombre completo', { required: true })}
      <div style={{ display: 'flex', gap: 12 }}>
        {input('fecha_nacimiento', 'Fecha de nacimiento', { type: 'date', required: true })}
        {input('dni', 'DNI')}
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        {input('parentesco', 'Parentesco', { placeholder: 'mamá, abuelo…' })}
        {input('obra_social', 'Obra social')}
        {input('numero_afiliado', 'N° de afiliado')}
      </div>
      <label>
        Notas
        <textarea name="notas" value={form.notas} onChange={cambiar} rows={3} style={campo} />
      </label>
      {error && <p style={{ color: '#b00020', margin: 0 }}>{error}</p>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" disabled={enviando} style={{ padding: 10, flex: 1 }}>
          {enviando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Agregar persona'}
        </button>
        {editando && <button type="button" onClick={onCancel} style={{ padding: 10 }}>Cancelar</button>}
      </div>
    </form>
  );
}
