export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'METHOD_NOT_ALLOWED' });
    return;
  }

  const { email, password } = req.body || {};

  if (!email || typeof email !== 'string' || !email.trim() || !password || typeof password !== 'string') {
    res.status(400).json({ ok: false, error: 'INVALID_PAYLOAD' });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  let role = null;
  let userId = 'u_default';
  let allowedPasswords = [];

  if (
    normalizedEmail.includes('admin') ||
    normalizedEmail.includes('dean') ||
    normalizedEmail === 'robert.vance@bcafly.edu'
  ) {
    role = 'admin';
    userId = 'admin-1';
    allowedPasswords = ['admin123', 'bca2026!', 'secret123', 'bca2026'];
  } else if (
    normalizedEmail.includes('student') ||
    normalizedEmail === 'alex.smith@student.bcafly.edu'
  ) {
    role = 'student';
    userId = 's-1';
    allowedPasswords = ['student123', 'bca2026!', 'secret123', 'bca2026'];
  } else if (
    normalizedEmail.includes('faculty') ||
    normalizedEmail.endsWith('@bcafly.edu') ||
    normalizedEmail.includes('sarah.jenkins') ||
    normalizedEmail.includes('rajesh.sharma')
  ) {
    role = 'faculty';
    userId = 'fac-1';
    allowedPasswords = ['faculty123', 'bca2026!', 'secret123', 'bca2026'];
  }

  const isPasswordValid = role !== null && allowedPasswords.includes(password);

  if (!role || !isPasswordValid) {
    res.status(401).json({ ok: false, error: 'INVALID_CREDENTIALS' });
    return;
  }

  // Generate JWT token
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const payload = Buffer.from(
    JSON.stringify({
      sub: userId,
      email: normalizedEmail,
      role,
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60
    })
  ).toString('base64');
  const token = `${header}.${payload}.sig_token_${Date.now()}`;

  res.status(200).json({
    ok: true,
    user: {
      id: userId,
      email: normalizedEmail,
      role
    },
    token
  });
}
