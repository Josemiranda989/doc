// Manejador de errores central. Express 5 ya captura los errores async;
// acá los convertimos al contrato { status, data } en vez del HTML por defecto.

const prismaErrors = {
  P2025: [404, 'Recurso no encontrado'],
  P2003: [400, 'La referencia (FK) apunta a un registro que no existe'],
  P2002: [409, 'Ya existe un registro con ese valor único']
};

export function notFoundHandler(req, res) {
  res.status(404).json({ status: 'error', data: { message: `No existe ${req.method} ${req.originalUrl}` } });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  // Body con JSON mal formado
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ status: 'error', data: { message: 'El body no es un JSON válido' } });
  }

  const known = err.code && prismaErrors[err.code];
  if (known) {
    const [status, message] = known;
    return res.status(status).json({ status: 'error', data: { message } });
  }

  console.error(err);
  return res.status(500).json({ status: 'error', data: { message: 'Error interno del servidor' } });
}
