// Estructura base. Los componentes llegan en el segundo prompt de C10.
export default function App() {
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>CuidAR</h1>
      <p>Frontend conectado a la API en /api (proxy de Vite → localhost:3000).</p>
    </main>
  );
}
