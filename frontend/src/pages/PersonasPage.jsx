import { useCallback, useState } from 'react';
import PersonaACargoList from '../components/PersonaACargoList.jsx';
import PersonaACargoForm from '../components/PersonaACargoForm.jsx';
import Feedback from '../components/Feedback.jsx';

export default function PersonasPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [editando, setEditando] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const limpiarMensaje = useCallback(() => setMensaje(''), []);

  const guardado = (texto) => {
    setEditando(null);
    setMensaje(texto);
    setRefreshTrigger((n) => n + 1);
  };

  return (
    <>
      <Feedback mensaje={mensaje} onDone={limpiarMensaje} />
      <h2>{editando ? 'Editar persona a cargo' : 'Nueva persona a cargo'}</h2>
      <PersonaACargoForm key={editando?.id ?? 'nuevo'} editando={editando} onSaved={guardado} onCancel={() => setEditando(null)} />
      <h2>Personas a cargo</h2>
      <PersonaACargoList
        refreshTrigger={refreshTrigger}
        onEdit={(m) => { setEditando(m); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        onDeleted={(m) => {
          if (editando?.id === m.id) setEditando(null);
          setMensaje('Persona eliminada (y su medicación)');
        }}
      />
    </>
  );
}
