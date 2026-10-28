import { useEffect } from 'react';

// Mensaje de éxito que se borra solo a los 3 segundos.
export default function Feedback({ mensaje, onDone }) {
  useEffect(() => {
    if (!mensaje) return;
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [mensaje, onDone]);

  if (!mensaje) return null;
  return (
    <p role="status" style={{ background: '#e6f4ea', color: '#1e6b35', padding: '10px 12px', margin: '0 0 16px' }}>
      {mensaje}
    </p>
  );
}
