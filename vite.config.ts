import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

function authApiPlugin(): Plugin {
  return {
    name: 'auth-api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/auth/signin' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });

          req.on('end', () => {
            try {
              let parsed: { email?: string; password?: string } = {};
              if (body) {
                try {
                  parsed = JSON.parse(body);
                } catch {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ ok: false, error: 'INVALID_PAYLOAD' }));
                  return;
                }
              }

              const { email, password } = parsed;

              if (!email || typeof email !== 'string' || !email.trim() || !password || typeof password !== 'string') {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ ok: false, error: 'INVALID_PAYLOAD' }));
                return;
              }

              const normalizedEmail = email.trim().toLowerCase();

              // Role checking & credential validation
              let role: 'admin' | 'faculty' | 'student' | null = null;
              let userId = 'u_default';
              let allowedPasswords: string[] = [];

              if (normalizedEmail.includes('admin') || normalizedEmail.includes('dean') || normalizedEmail === 'robert.vance@bcafly.edu') {
                role = 'admin';
                userId = 'admin-1';
                allowedPasswords = ['admin123', 'bca2026!', 'secret123', 'bca2026'];
              } else if (normalizedEmail.includes('student') || normalizedEmail === 'alex.smith@student.bcafly.edu') {
                role = 'student';
                userId = 's-1';
                allowedPasswords = ['student123', 'bca2026!', 'secret123', 'bca2026'];
              } else if (normalizedEmail.includes('faculty') || normalizedEmail.endsWith('@bcafly.edu') || normalizedEmail.includes('sarah.jenkins') || normalizedEmail.includes('rajesh.sharma')) {
                role = 'faculty';
                userId = 'fac-1';
                allowedPasswords = ['faculty123', 'bca2026!', 'secret123', 'bca2026'];
              }

              const isPasswordValid = role !== null && allowedPasswords.includes(password);

              if (!role || !isPasswordValid) {
                res.statusCode = 401;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ ok: false, error: 'INVALID_CREDENTIALS' }));
                return;
              }

              // Generate mock JWT token
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

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  ok: true,
                  user: {
                    id: userId,
                    email: normalizedEmail,
                    role
                  },
                  token
                })
              );
            } catch {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: false, error: 'INTERNAL_SERVER_ERROR' }));
            }
          });
          return;
        }
        next();
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), authApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâ€”file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
