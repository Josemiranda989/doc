// Configuración del CLI de Prisma (migrate, generate, seed, studio).
// Prisma 7 no lee el .env solo: lo cargamos con dotenv.
import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.js',
  },
  datasource: {
    // Las migraciones van por la conexión directa / session pooler (5432).
    // En local DIRECT_URL y DATABASE_URL pueden ser la misma.
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? '',
  },
});
