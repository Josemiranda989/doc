import { prisma } from '../lib/prisma.js';
import { fromDateOnly, isUuid, toDateOnly, toIso } from '../lib/serialize.js';

// Autorización: todas las funciones reciben el caregiverId del usuario logueado
// (req.user.id, que sale del token verificado) y solo ven sus propias personas.

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

async function getAll(caregiverId) {
  const rows = await prisma.persona_a_cargo.findMany({
    where: { cuidador_id: caregiverId },
    orderBy: { created_at: 'asc' }
  });
  return rows.map(serialize);
}

async function getById(id, caregiverId) {
  if (!isUuid(id)) return null;
  const row = await prisma.persona_a_cargo.findFirst({
    where: { id, cuidador_id: caregiverId }
  });
  return row ? serialize(row) : null;
}

async function create(data, caregiverId) {
  const row = await prisma.persona_a_cargo.create({
    data: { ...pickEditable(data), cuidador_id: caregiverId }
  });
  return serialize(row);
}

async function update(id, data, caregiverId) {
  if (!(await getById(id, caregiverId))) return null;
  const row = await prisma.persona_a_cargo.update({
    where: { id },
    data: pickEditable(data)
  });
  return serialize(row);
}

async function remove(id, caregiverId) {
  const existing = await getById(id, caregiverId);
  if (!existing) return null;
  // ON DELETE CASCADE: Postgres borra sus medicaciones, condiciones y médicos.
  await prisma.persona_a_cargo.delete({ where: { id } });
  return existing;
}

export default { getAll, getById, create, update, remove };
