import express from 'express';
import cors from 'cors';
import indexRoutes from './routes/index.routes.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api', indexRoutes);

// Errores: siempre al final
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
