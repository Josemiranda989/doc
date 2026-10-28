import dependentModel from '../models/dependent.model.js';
import medicationModel from '../models/medication.model.js';
import { isDateString } from '../lib/serialize.js';

const validForms = ['comprimido', 'gota', 'ml', 'aplicacion'];
const validStates = ['activa', 'discontinuada'];
const requiredFields = [
  'persona_id',
  'droga',
  'concentracion',
  'cantidad_por_toma',
  'forma',
  'fecha_inicio'
];

function sendNotFound(res) {
  return res.status(404).json({
    status: 'error',
    data: { message: 'Medicación no encontrada' }
  });
}

function validateValues(body) {
  for (const field of ['fecha_inicio', 'fecha_fin']) {
    if (Object.hasOwn(body, field) && body[field] !== null && !isDateString(body[field])) {
      return `${field} debe tener formato YYYY-MM-DD`;
    }
  }
  if (Object.hasOwn(body, 'cantidad_por_toma')) {
    const n = Number(body.cantidad_por_toma);
    if (body.cantidad_por_toma === '' || !Number.isFinite(n) || n <= 0 || n >= 1000) {
      return 'cantidad_por_toma debe ser un número mayor a 0 (máximo 999.99)';
    }
  }
  if (Object.hasOwn(body, 'es_sos') && typeof body.es_sos !== 'boolean') {
    return 'es_sos debe ser true o false';
  }
  return validateEnums(body);
}

// En PATCH lo obligatorio puede no venir, pero si viene no puede estar vacío.
function findEmptyRequired(body) {
  return requiredFields.filter(
    (field) =>
      Object.hasOwn(body, field) &&
      (body[field] === null || body[field] === '')
  );
}

function validateEnums(body) {
  if (
    Object.hasOwn(body, 'forma') &&
    (typeof body.forma !== 'string' || !validForms.includes(body.forma))
  ) {
    return 'forma debe ser uno de: comprimido, gota, ml, aplicacion';
  }
  if (
    Object.hasOwn(body, 'estado') &&
    (typeof body.estado !== 'string' || !validStates.includes(body.estado))
  ) {
    return 'estado debe ser uno de: activa, discontinuada';
  }
  return null;
}

// La persona tiene que existir Y ser del usuario logueado.
async function validatePerson(personaId, caregiverId) {
  return typeof personaId === 'string' && (await dependentModel.getById(personaId, caregiverId));
}

async function getAll(req, res) {
  const medications = await medicationModel.getAll(req.query.personaId, req.user.id);
  return res.status(200).json({ status: 'success', data: medications });
}

async function getById(req, res) {
  const medication = await medicationModel.getById(req.params.id, req.user.id);
  if (!medication) return sendNotFound(res);

  return res.status(200).json({ status: 'success', data: medication });
}

async function create(req, res) {
  const body = req.body ?? {};
  const missingFields = requiredFields.filter(
    (field) => body[field] === undefined || body[field] === null || body[field] === ''
  );
  if (missingFields.length) {
    return res.status(400).json({
      status: 'error',
      data: { message: `Campos obligatorios: ${missingFields.join(', ')}` }
    });
  }

  const valueError = validateValues(body);
  if (valueError) {
    return res.status(400).json({ status: 'error', data: { message: valueError } });
  }
  if (!(await validatePerson(body.persona_id, req.user.id))) {
    return res.status(400).json({
      status: 'error',
      data: { message: 'persona_id debe corresponder a una persona a cargo existente' }
    });
  }

  const medication = await medicationModel.create(body);
  return res.status(201).json({ status: 'success', data: medication });
}

async function update(req, res) {
  const body = req.body ?? {};
  const emptyFields = findEmptyRequired(body);
  if (emptyFields.length) {
    return res.status(400).json({
      status: 'error',
      data: { message: `No se pueden vaciar: ${emptyFields.join(', ')}` }
    });
  }
  const valueError = validateValues(body);
  if (valueError) {
    return res.status(400).json({ status: 'error', data: { message: valueError } });
  }
  if (Object.hasOwn(body, 'persona_id') && !(await validatePerson(body.persona_id, req.user.id))) {
    return res.status(400).json({
      status: 'error',
      data: { message: 'persona_id debe corresponder a una persona a cargo existente' }
    });
  }

  const medication = await medicationModel.update(req.params.id, body, req.user.id);
  if (!medication) return sendNotFound(res);

  return res.status(200).json({ status: 'success', data: medication });
}

async function remove(req, res) {
  const medication = await medicationModel.remove(req.params.id, req.user.id);
  if (!medication) return sendNotFound(res);

  return res.status(200).json({ status: 'success', data: medication });
}

export default { getAll, getById, create, update, remove };
