import { prisma } from '../lib/prisma.js';
import { fromDateOnly, isUuid, toDateOnly, toIso } from '../lib/serialize.js';

// cuidador_id fijo hasta C13: ahí lo reemplaza el uid de Supabase Auth.
// Es el mismo UUID que crea el seed.
export const CAREGIVER_ID = process.env.CAREGIVER_ID ?? '00000000-0000-4000-8000-000000000001';

const editableFields = [
  'nombre_completo',
  'fecha_nacimiento',
  'dni',
  'parentesco',
  'obra_social',
  'numero_afiliado',
  'notas'
];

function calculateAge(fechaNacimiento) {
  // La edad se deriva de la fecha de nacimiento y nunca se persiste.
  const [year, month, day] = fechaNacimiento.split('-').map(Number);
  const today = new Date();
  let age = today.getUTCFullYear() - year;
  const birthdayHasPassed =
    today.getUTCMonth() + 1 > month ||
    (today.getUTCMonth() + 1 === month && today.getUTCDate() >= day);

  if (!birthdayHasPassed) age -= 1;
  return age;
}

function serialize(row) {
  const fecha_nacimiento = toDateOnly(row.fecha_nacimiento);
  return {
    ...row,
    fecha_nacimiento,
    created_at: toIso(row.created_at),
    updated_at: toIso(row.updated_at),
    edad: calculateAge(fecha_nacimiento)
  };
}

function pickEditable(data) {
  const out = {};
  for (const field of editableFields) {
    if (Object.hasOwn(data, field)) out[field] = data[field];
  }
  if (Object.hasOwn(out, 'fecha_nacimiento')) {
    out.fecha_nacimiento = fromDateOnly(out.fecha_nacimiento);
  }
  return out;
}

async function getAll() {
  const rows = await prisma.persona_a_cargo.findMany({
    where: { cuidador_id: CAREGIVER_ID },
    orderBy: { created_at: 'asc' }
  });
  return rows.map(serialize);
}

async function getById(id) {
  if (!isUuid(id)) return null;
  const row = await prisma.persona_a_cargo.findFirst({
    where: { id, cuidador_id: CAREGIVER_ID }
  });
  return row ? serialize(row) : null;
}

async function create(data) {
  const row = await prisma.persona_a_cargo.create({
    data: { ...pickEditable(data), cuidador_id: CAREGIVER_ID }
  });
  return serialize(row);
}

async function update(id, data) {
  if (!(await getById(id))) return null;
  const row = await prisma.persona_a_cargo.update({
    where: { id },
    data: pickEditable(data)
  });
  return serialize(row);
}

async function remove(id) {
  const existing = await getById(id);
  if (!existing) return null;
  // ON DELETE CASCADE: Postgres borra sus medicaciones, condiciones y médicos.
  await prisma.persona_a_cargo.delete({ where: { id } });
  return existing;
}

export default { getAll, getById, create, update, remove };
