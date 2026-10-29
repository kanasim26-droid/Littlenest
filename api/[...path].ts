// Vercel catch-all function for the existing Express API routes.
// Requests such as /api/auth/login and /api/products are forwarded to Express.
import { app } from '../server.ts';

export default app;
