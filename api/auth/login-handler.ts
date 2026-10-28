export default function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const password = req.body?.password;
  const expectedPassword = process.env.ADMIN_PASSWORD || 'nest2026';

  if (typeof password !== 'string' || password !== expectedPassword) {
    return res.status(401).json({ error: 'Invalid admin password' });
  }

  const token = `admin_session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  return res.status(200).json({
    token,
    user: {
      name: 'Store Owner',
      role: 'administrator',
      email: 'owner@littlenest.pk'
    }
  });
}
