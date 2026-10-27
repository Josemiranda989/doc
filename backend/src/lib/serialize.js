// Prisma devuelve Date y Decimal. La API mantiene el contrato de C9:
// fechas DATE como "YYYY-MM-DD", timestamps como ISO y números como number.

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const isUuid = (value) => typeof value === 'string' && UUID_RE.test(value);

export const isDateString = (value) =>
  typeof value === 'string' && DATE_RE.test(value) && !Number.isNaN(Date.parse(value));

export const toDateOnly = (value) => (value ? value.toISOString().slice(0, 10) : null);

export const fromDateOnly = (value) => (value ? new Date(`${value}T00:00:00.000Z`) : null);

export const toIso = (value) => (value ? value.toISOString() : null);
