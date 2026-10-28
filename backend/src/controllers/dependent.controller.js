import dependentModel from '../models/dependent.model.js';
import { isDateString } from '../lib/serialize.js';

const requiredFields = ['nombre_completo', 'fecha_nacimiento'];

function sendBadRequest(res, message) {
  return res.status(400).json({ status: 'error', data: { message } });
}

// Valida lo que llegó en el body. En create todo lo obligatorio tiene que estar;
// en update (PATCH) solo se valida lo que vino, pero lo obligatorio no puede vaciarse.
function validate(body, { partial }) {
  for (const field of requiredFields) {
    const present = Object.hasOwn(body, field);
    if (!present && partial) continue;
    if (typeof body[field] !== 'string' || !body[field].trim()) {
      return `${field} es obligatorio y no puede estar vacío`;
    }
  }
  if (Object.hasOwn(body, 'fecha_nacimiento') && !isDateString(body.fecha_nacimiento)) {
    return 'fecha_nacimiento debe tener formato YYYY-MM-DD';
  }
  return null;
}

function sendNotFound(res) {
  return res.status(404).json({
    status: 'error',
    data: { message: 'Persona a cargo no encontrada' }
  });
}

async function getAll(req, res) {
  const dependents = await dependentModel.getAll(req.user.id);
  return res.status(200).json({ status: 'success', data: dependents });
}

async function getById(req, res) {
  const dependent = await dependentModel.getById(req.params.id, req.user.id);
  if (!dependent) return sendNotFound(res);

  return res.status(200).json({ status: 'success', data: dependent });
}

async function create(req, res) {
  const body = req.body ?? {};
  const error = validate(body, { partial: false });
  if (error) return sendBadRequest(res, error);

  const dependent = await dependentModel.create(body, req.user.id);
  return res.status(201).json({ status: 'success', data: dependent });
}

async function update(req, res) {
  const body = req.body ?? {};
  const error = validate(body, { partial: true });
  if (error) return sendBadRequest(res, error);

  const dependent = await dependentModel.update(req.params.id, body, req.user.id);
  if (!dependent) return sendNotFound(res);

  return res.status(200).json({ status: 'success', data: dependent });
}

async function remove(req, res) {
  const dependent = await dependentModel.remove(req.params.id, req.user.id);
  if (!dependent) return sendNotFound(res);

  return res.status(200).json({ status: 'success', data: dependent });
}

export default { getAll, getById, create, update, remove };
