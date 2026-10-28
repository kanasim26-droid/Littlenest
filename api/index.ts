import type { Request, Response } from 'express';
import { app } from '../server';

// Vercel rewrites /api/* to this function and passes the original path in
// __path so the existing Express API routes receive their expected URL.
export default function handler(req: Request, res: Response) {
  const route = req.query.__path;
  const originalPath = Array.isArray(route) ? route[0] : route;
  if (typeof originalPath !== 'string' || !originalPath) {
    return res.status(400).json({ error: 'Missing API route path' });
  }

  const query = new URL(req.url || '/', 'http://localhost').searchParams;
  query.delete('__path');
  const queryString = query.toString();
  req.url = `/api/${originalPath.replace(/^\/+/, '')}${queryString ? `?${queryString}` : ''}`;

  return app(req, res);
}
