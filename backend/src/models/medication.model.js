import { prisma } from '../lib/prisma.js';
import { fromDateOnly, isUuid, toDateOnly } from '../lib/serialize.js';

const editableFields = [
  'persona_id',
  'droga',
  'nombre_comercial',
  'concentracion',
  'cantidad_por_toma',
  'forma',
  'via',
  'motivo',
  'indicaciones',
  'es_sos',
  'estado',
  'fecha_inicio',
  'fecha_fin',
  'motivo_baja'
];

const dateFields = ['fecha_inicio', 'fecha_fin'];

function serialize(row) {
  return {
    ...row,
    cantidad_por_toma: Number(row.cantidad_por_toma),
    fecha_inicio: toDateOnly(row.fecha_inicio),
    fecha_fin: toDateOnly(row.fecha_fin)
  };
}

function pickEditable(data) {
  const out = {};
  for (const field of editableFields) {
    if (Object.hasOwn(data, field)) out[field] = data[field];
  }
  for (const field of dateFields) {
    if (Object.hasOwn(out, field)) out[field] = fromDateOnly(out[field]);
  }
  // medico_id no se toca: hasta que exista la entidad medico queda como está.
  return out;
}

async function getAll(personaId) {
  // Con ?personaId= inválido no hay resultados (igual que con los mocks).
  if (personaId !== undefined && !isUuid(personaId)) return [];
  const rows = await prisma.medicacion.findMany({
    where: personaId ? { persona_id: personaId } : {},
    orderBy: { fecha_inicio: 'asc' }
  });
  return rows.map(serialize);
}

async function getById(id) {
  if (!isUuid(id)) return null;
  const row = await prisma.medicacion.findUnique({ where: { id } });
  return row ? serialize(row) : null;
}

async function create(data) {
  const row = await prisma.medicacion.create({ data: pickEditable(data) });
  return serialize(row);
}

async function update(id, data) {
  if (!(await getById(id))) return null;
  const row = await prisma.medicacion.update({ where: { id }, data: pickEditable(data) });
  return serialize(row);
}

async function remove(id) {
  const existing = await getById(id);
  if (!existing) return null;
  await prisma.medicacion.delete({ where: { id } });
  return existing;
}

export default { getAll, getById, create, update, remove };
