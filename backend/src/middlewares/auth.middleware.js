// Autenticación con Supabase Auth.
//
// El front manda el access token de la sesión en `Authorization: Bearer <token>`.
// Acá lo verificamos (firma, emisor, audiencia, vencimiento) y dejamos el usuario
// en req.user. A partir de ese momento, el dueño de los datos es req.user.id:
// el backend NUNCA confía en un caregiver_id que venga en el body, la URL o un header.
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { prisma } from '../lib/prisma.js';

const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/$/, '');
const ISSUER = SUPABASE_URL ? `${SUPABASE_URL}/auth/v1` : null;

// Proyectos nuevos de Supabase firman con claves asimétricas: se verifica contra
// las claves públicas del proyecto (JWKS). Proyectos viejos con el "JWT secret"
// compartido (HS256) pueden usar SUPABASE_JWT_SECRET.
const verificador = process.env.SUPABASE_JWT_SECRET
  ? new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET)
  : ISSUER && createRemoteJWKSet(new URL(`${ISSUER}/.well-known/jwks.json`));

// Sin Supabase configurado, en desarrollo se usa el cuidador del seed
// (así las clases C9–C12 y la colección de Postman siguen andando).
// En producción eso no se permite: el server no arranca.
const DEV_CAREGIVER_ID = '00000000-0000-4000-8000-000000000001';
export const AUTH_ENABLED = Boolean(ISSUER);

if (!AUTH_ENABLED) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Falta SUPABASE_URL: en producción la API no puede correr sin autenticación');
  }
  console.warn(`⚠️  Auth desactivada (falta SUPABASE_URL). Todas las requests usan el cuidador ${DEV_CAREGIVER_ID}`);
}

// Cada usuario de Supabase Auth tiene su fila en `cuidador` (la FK de persona_a_cargo
// apunta ahí). Se crea la primera vez que el usuario le pega a la API.
const cuidadoresConocidos = new Set();
async function asegurarCuidador(user) {
  if (cuidadoresConocidos.has(user.id)) return;
  await prisma.cuidador.upsert({
    where: { id: user.id },
    update: {},
    create: { id: user.id, nombre: user.email ?? 'Cuidador' }
  });
  cuidadoresConocidos.add(user.id);
}

function noAutorizado(res, message) {
  return res.status(401).json({ status: 'error', data: { message } });
}

export async function requireAuth(req, res, next) {
  if (!AUTH_ENABLED) {
    req.user = { id: DEV_CAREGIVER_ID, email: 'dev@local' };
    return next();
  }

  const [tipo, token] = (req.headers.authorization ?? '').split(' ');
  if (tipo !== 'Bearer' || !token) return noAutorizado(res, 'Falta el token de sesión');

  try {
    const { payload } = await jwtVerify(token, verificador, {
      issuer: ISSUER,
      audience: 'authenticated'
    });
    req.user = { id: payload.sub, email: payload.email };
  } catch {
    return noAutorizado(res, 'Sesión inválida o vencida');
  }

  await asegurarCuidador(req.user);
  return next();
}
