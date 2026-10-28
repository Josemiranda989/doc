import { useCallback, useState } from 'react';
import MedicacionList from '../components/MedicacionList.jsx';
import MedicacionForm from '../components/MedicacionForm.jsx';
import Feedback from '../components/Feedback.jsx';

export default function MedicacionesPage() {
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
      <h2>{editando ? 'Editar medicación' : 'Nueva medicación'}</h2>
      <MedicacionForm key={editando?.id ?? 'nuevo'} editando={editando} onSaved={guardado} onCancel={() => setEditando(null)} />
      <h2>Medicaciones</h2>
      <MedicacionList
        refreshTrigger={refreshTrigger}
        onEdit={(m) => { setEditando(m); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        onDeleted={(m) => {
          if (editando?.id === m.id) setEditando(null);
          setMensaje('Medicación eliminada');
        }}
      />
    </>
  );
}
