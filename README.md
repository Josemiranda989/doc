# CuidAR · backend con Prisma + frontend React

Proyecto paralelo a [`cuidar-ia-app`](https://github.com/Josemiranda989/cuidar-ia-app), armado siguiendo las clases del trayecto: el mismo backend de C9 (Node + Express 5, MVC, ES modules), con los mocks reemplazados por **PostgreSQL + Prisma 7**. Sirve para probar de punta a punta los pasos de deploy del trayecto (C12: Supabase + Render) antes de darlos en clase.

**El contrato de la API no cambió.** Mismas rutas, mismo `{ status, data }`, mismos campos en snake_case, mismos tipos. La colección de Postman de `backend/docs/` pasa 15/15 igual que contra los mocks; lo único que cambia son los IDs, que ahora son UUID.

---

## Qué cambió respecto de los mocks

| Capa | Antes (C9) | Ahora |
|---|---|---|
| `src/models/*.model.js` | arrays en memoria | Prisma. **Es la única capa que se reescribió** (la regla de MVC de C8) |
| `src/controllers/*` | validación básica | + fechas `YYYY-MM-DD`, `cantidad_por_toma` numérica, obligatorios que no se pueden vaciar por PATCH |
| `src/middlewares/error.middleware.js` | — | errores siempre como `{ status, data }`: JSON mal formado, rutas inexistentes, errores de Prisma |
| `GET /api/health` | `{ status: 'ok' }` | `{ status: 'ok', db: 'ok' }`: también comprueba la base |
| IDs | `'elsa-01'`, `'cuidador-123'` | UUIDs fijos del seed (abajo) |

Bugs de los mocks que esta versión ya no tiene:

- El PATCH de medicación ponía `medico_id = null` siempre. Ahora no lo toca.
- `PATCH { fecha_nacimiento: 123 }` hacía explotar `calculateAge` y devolvía un 500. Ahora devuelve 400.
- Borrar una persona dejaba sus medicaciones huérfanas. Ahora `ON DELETE CASCADE` lo resuelve en Postgres.

### IDs fijos del seed

| Qué | UUID |
|---|---|
| Cuidador (Marina) | `00000000-0000-4000-8000-000000000001` |
| Elsa | `11111111-1111-4111-8111-111111111111` |
| Otra persona | `22222222-2222-4222-8222-222222222222` |
| Medicaciones de Elsa | `aaaaaaaa-0000-4000-8000-00000000000{1,2,3}` |

El `cuidador_id` sigue fijo hasta C13, cuando lo reemplaza el uid de Supabase Auth. Se puede pisar con la variable `CAREGIVER_ID`.

---

## Estructura

```
backend/
├── prisma/
│   ├── schema.prisma          ← el modelo de docs/modelo-datos.md, las 6 entidades
│   ├── migrations/            ← SQL versionado (se commitea)
│   └── seed.js                ← Marina, Elsa y sus 3 medicaciones
├── prisma.config.ts           ← config del CLI: URL para migrar, seed
├── src/
│   ├── lib/prisma.js          ← cliente único (driver adapter pg)
│   ├── lib/serialize.js       ← Date/Decimal → contrato de la API
│   ├── middlewares/error.middleware.js
│   ├── models/ controllers/ routes/
│   └── generated/prisma/      ← cliente generado (NO se commitea)
└── index.js
```

La migración crea las 6 tablas del modelo. La API expone solo `persona_a_cargo` y `medicacion`, igual que en C9. `cuidador`, `condicion`, `medico` y `horario_toma` ya existen en la base y esperan su CRUD.

---

## Correrlo en local

Requiere **Node ≥ 20.19** y un Postgres. Con Docker:

```bash
docker run -d --name cuidar-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=cuidar -p 5432:5432 postgres:16
```

```bash
cd backend
cp .env.example .env          # en Windows: copy .env.example .env
npm install                   # corre prisma generate solo (postinstall)
npm run db:migrate            # aplica prisma/migrations a tu base
npm run db:seed
npm run dev                   # http://localhost:3000/api/health → { status: 'ok', db: 'ok' }
```

| Script | Qué hace |
|---|---|
| `npm run dev` / `npm start` | levanta la API con `tsx` (ver la nota de Prisma 7) |
| `npm run db:migrate` | `prisma migrate dev`: crea una migración nueva si cambiaste el schema y la aplica |
| `npm run db:deploy` | `prisma migrate deploy`: aplica las pendientes sin generar nuevas (producción) |
| `npm run db:seed` | carga los datos de prueba. Es idempotente |
| `npm run db:studio` | abre Prisma Studio para ver y editar datos |
| `npm run build` | `generate` + `migrate deploy`, para Render |

**Para cambiar el modelo:** editás `schema.prisma`, corrés `npm run db:migrate -- --name lo_que_cambiaste`, **leés el `migration.sql` que generó** (es la auditoría del output técnico) y commiteás la migración.

### Nota: Prisma 7 y JavaScript

Prisma 7 genera el cliente en **TypeScript** (`src/generated/prisma/*.ts`) y no tiene opción de salida `.js`. Por eso la app corre con [`tsx`](https://tsx.is), que ejecuta el código JS de siempre y puede importar ese cliente. El código del proyecto sigue siendo 100% JavaScript. La alternativa es el generador viejo `prisma-client-js`, que está deprecado.

---

## Deploy: Supabase (base) + Render (API)

### 1 · Supabase

1. Crear el proyecto en [supabase.com](https://supabase.com) y **guardar la contraseña de la base**.
2. Ir a **Connect** (arriba en el dashboard). Ahí están las connection strings:
   - **Transaction pooler** (puerto **6543**) → `DATABASE_URL`. Es la que usa la app en runtime.
   - **Session pooler** (puerto **5432**) → `DIRECT_URL`. Es la que usa `prisma migrate`.
   Reemplazá `[YOUR-PASSWORD]` en las dos.
3. En tu `.env` local poné las dos URLs de Supabase y corré:
   ```bash
   npm run db:deploy     # crea las tablas en Supabase
   npm run db:seed
   ```
   En **Table Editor** tienen que aparecer las 6 tablas, con Elsa y sus 3 medicaciones.

> **Por qué session pooler y no "direct connection":** la conexión directa de Supabase es solo IPv6, y Render (y muchas redes) no salen por IPv6. El session pooler va por IPv4 y soporta todo lo que necesita `migrate`.
>
> Si la URL trae `?pgbouncer=true`, se puede dejar: el adapter de `pg` la ignora (verificado).
>
> **Prisma se saltea el RLS de Supabase.** Se conecta como el dueño de la base, así que las políticas de Row Level Security no aplican. La autorización la hace el backend, filtrando por `cuidador_id`. En C13 ese id sale del JWT.

### 2 · Render

1. Subir este repo a GitHub.
2. En [render.com](https://render.com): **New → Web Service**, conectar el repo.
3. Configuración:

   | Campo | Valor |
   |---|---|
   | Root Directory | `backend` |
   | Runtime | Node |
   | Build Command | `npm install && npm run build` |
   | Start Command | `npm start` |
   | Health Check Path | `/api/health` |

4. **Environment** → agregar `DATABASE_URL` (6543) y `DIRECT_URL` (5432), las mismas de Supabase.
5. Deploy. El build corre `prisma migrate deploy`: si agregás una migración y pusheás, Render la aplica sola en el próximo deploy.

### 3 · Verificar

```bash
curl https://<tu-servicio>.onrender.com/api/health
# → {"status":"ok","db":"ok"}
```

Y la colección de Postman con `baseUrl` = `https://<tu-servicio>.onrender.com/api`: 15/15.

> El plan free de Render duerme el servicio sin tráfico. El primer request después de un rato tarda ~30–50 s. No es un error: avisarlo antes de la demo.

### Si algo falla

| Síntoma | Causa probable |
|---|---|
| `{"status":"error","db":"unreachable"}` | `DATABASE_URL` mal copiada o con `[YOUR-PASSWORD]` sin reemplazar |
| `P1001: Can't reach database server` en el build | `DIRECT_URL` apunta a la direct connection (IPv6). Usá el session pooler |
| `prepared statement "…" already exists` | Pasa con el transaction pooler. Probá `DATABASE_URL` con el session pooler (5432) |
| `Cannot find module '../generated/prisma/client.ts'` | No corrió `prisma generate`. Revisá que el build sea `npm install && npm run build` |
| `SyntaxError` al arrancar en Render | Node viejo. `engines` pide ≥ 20.19; si no lo toma, agregá `NODE_VERSION=22` en Environment |

---

## Frontend (`frontend/`) — C10, C11 y C13

Vite + React + axios + React Router. Sigue las clases:

| Clase | Qué agrega |
|---|---|
| C10 | scaffold con proxy de Vite, `medications.service.js` y `dependents.service.js`, lista + form con `<select>` de persona |
| C11 | navegación, editar/eliminar con feedback, loading / error con Reintentar / empty en las dos entidades |
| C13 (parte 1) | `VITE_API_URL` centralizada en `src/config.js` + `src/services/api.js`; `vercel.json` |

### Correrlo en local

Con el backend corriendo en el 3000:

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

Sin `.env`, las llamadas van a `/api` y las resuelve el proxy de Vite. Con `VITE_API_URL` en `.env`, van directo a esa URL (el backend tiene CORS abierto).

### Deploy en Vercel

| Campo | Valor |
|---|---|
| Framework Preset | Vite (lo detecta solo) |
| Root Directory | `frontend` |
| Environment Variables | `VITE_API_URL` = URL de Render, **sin** `/api` al final |

`vercel.json` reescribe todas las rutas a `index.html`. Sin eso, entrar directo a `/personas` (o recargar ahí) da **404 en Vercel**: el router vive en el navegador y Vercel busca un archivo `/personas` que no existe.

> `VITE_API_URL` se "hornea" en el build. Si la cambiás en Vercel, hay que **redeployar** para que tome el valor nuevo.
