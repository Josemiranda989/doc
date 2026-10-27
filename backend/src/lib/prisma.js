// Cliente único de Prisma para toda la app.
// En runtime se conecta por DATABASE_URL (en Supabase: transaction pooler, 6543).
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.ts';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const prisma = new PrismaClient({ adapter });
