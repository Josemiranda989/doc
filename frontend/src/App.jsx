import { useState } from 'react';
import MedicacionList from './components/MedicacionList.jsx';
import MedicacionForm from './components/MedicacionForm.jsx';
import DependentList from './components/DependentList.jsx';

// C10: todo apilado en una sola pantalla. La navegación llega en C11.
export default function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>CuidAR</h1>

      <h2>Nueva medicación</h2>
      <MedicacionForm onCreated={() => setRefreshTrigger((n) => n + 1)} />

      <h2>Medicaciones</h2>
      <MedicacionList refreshTrigger={refreshTrigger} />

      <h2>Personas a cargo</h2>
      <DependentList />
    </main>
  );
}
