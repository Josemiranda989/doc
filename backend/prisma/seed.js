// Datos de prueba: los mismos mocks de C9, ahora con UUIDs reales.
// Se corre con `npm run db:seed`. Es idempotente: se puede correr varias veces.
import 'dotenv/config';
import { prisma } from '../src/lib/prisma.js';

const CUIDADOR_ID = '00000000-0000-4000-8000-000000000001';
const ELSA_ID = '11111111-1111-4111-8111-111111111111';
const OTRO_ID = '22222222-2222-4222-8222-222222222222';

const d = (s) => new Date(`${s}T00:00:00.000Z`);

const medicaciones = [
  {
    id: 'aaaaaaaa-0000-4000-8000-000000000001',
    droga: 'enalapril', nombre_comercial: 'Enalapril', concentracion: '10 mg',
    motivo: 'Hipertensión', indicaciones: 'Una toma por día', es_sos: false
  },
  {
    id: 'aaaaaaaa-0000-4000-8000-000000000002',
    droga: 'levotiroxina', nombre_comercial: 'Levotiroxina', concentracion: '50 mcg',
    motivo: 'Hipotiroidismo', indicaciones: 'Una toma por día en ayunas', es_sos: false
  },
  {
    id: 'aaaaaaaa-0000-4000-8000-000000000003',
    droga: 'paracetamol', nombre_comercial: 'Paracetamol', concentracion: '500 mg',
    motivo: 'Dolor', indicaciones: null, es_sos: true
  }
];

async function main() {
  await prisma.cuidador.upsert({
    where: { id: CUIDADOR_ID },
    update: {},
    create: { id: CUIDADOR_ID, nombre: 'Marina' }
  });

  for (const [id, nombre_completo, fecha] of [
    [ELSA_ID, 'Elsa', '1948-01-01'],
    [OTRO_ID, 'Otra persona', '1955-01-01']
  ]) {
    await prisma.persona_a_cargo.upsert({
      where: { id },
      update: {},
      create: { id, cuidador_id: CUIDADOR_ID, nombre_completo, fecha_nacimiento: d(fecha) }
    });
  }

  for (const m of medicaciones) {
    await prisma.medicacion.upsert({
      where: { id: m.id },
      update: {},
      create: {
        ...m,
        persona_id: ELSA_ID,
        cantidad_por_toma: 1,
        forma: 'comprimido',
        via: 'oral',
        fecha_inicio: d('2025-01-01')
      }
    });
  }

  console.log('Seed listo: 1 cuidador, 2 personas a cargo, 3 medicaciones de Elsa');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
