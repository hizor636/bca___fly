import { SignInRequest, SignInResponse, SignInSuccessResponse, SignInErrorResponse, UserRole } from '../types';
import { INITIAL_ADMINS, INITIAL_FACULTY, INITIAL_STUDENTS, INITIAL_COUNSELORS } from '../data/mockStore';

export const VALID_CREDENTIALS_MAP: Record<string, { id: string; name: string; email: string; role: UserRole; validPasswords: string[] }> = {
  // Admin credentials
  'dean.academic@bcafly.edu': {
    id: 'admin-1',
    name: 'Academic Dean Dr. V. Swaminathan',
    email: 'dean.academic@bcafly.edu',
    role: 'admin',
    validPasswords: ['admin123', 'bca2026!', 'bca2026', 'password']
  },
  'admin@bcafly.edu': {
    id: 'admin-1',
    name: 'Academic Dean Dr. V. Swaminathan',
    email: 'admin@bcafly.edu',
    role: 'admin',
    validPasswords: ['admin123', 'bca2026!', 'bca2026', 'password']
  },
  'robert.vance@bcafly.edu': {
    id: 'admin-1',
    name: 'Dean Robert Vance',
    email: 'robert.vance@bcafly.edu',
    role: 'admin',
    validPasswords: ['admin123', 'bca2026!', 'bca2026', 'password']
  },

  // Faculty credentials
  'sarah.jenkins@bcafly.edu': {
    id: 'fac-1',
    name: 'Dr. Sarah Jenkins',
    email: 'sarah.jenkins@bcafly.edu',
    role: 'faculty',
    validPasswords: ['faculty123', 'bca2026!', 'bca2026', 'password']
  },
  'faculty@bcafly.edu': {
    id: 'fac-1',
    name: 'Dr. Sarah Jenkins',
    email: 'faculty@bcafly.edu',
    role: 'faculty',
    validPasswords: ['faculty123', 'bca2026!', 'bca2026', 'password']
  },
  'rajesh.sharma@bcafly.edu': {
    id: 'fac-2',
    name: 'Prof. Rajesh Sharma',
    email: 'rajesh.sharma@bcafly.edu',
    role: 'faculty',
    validPasswords: ['faculty123', 'bca2026!', 'bca2026', 'password']
  },
  'priya.nambiar@bcafly.edu': {
    id: 'fac-3',
    name: 'Dr. Priya Nambiar',
    email: 'priya.nambiar@bcafly.edu',
    role: 'faculty',
    validPasswords: ['faculty123', 'bca2026!', 'bca2026', 'password']
  },

  // Student credentials
  'alex.smith@student.bcafly.edu': {
    id: 's-1',
    name: 'Alex Smith',
    email: 'alex.smith@student.bcafly.edu',
    role: 'student',
    validPasswords: ['student123', 'bca2026!', 'bca2026', 'password']
  },
  'student@bcafly.edu': {
    id: 's-1',
    name: 'Alex Smith',
    email: 'student@bcafly.edu',
    role: 'student',
    validPasswords: ['student123', 'bca2026!', 'bca2026', 'password']
  },
  'alex@student.bcafly.edu': {
    id: 's-1',
    name: 'Alex Smith',
    email: 'alex@student.bcafly.edu',
    role: 'student',
    validPasswords: ['student123', 'bca2026!', 'bca2026', 'password']
  }
};

/**
 * Generates a mock JWT session token with embedded payload
 */
export function generateSessionToken(user: { id: string; email: string; role: string }): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 // 7 days
    })
  );
  const signature = btoa(`sig_${user.id}_${Date.now()}`).substring(0, 32);
  return `${header}.${payload}.${signature}`;
}

/**
 * Validates credentials synchronously according to the POST /api/auth/signin specification
 */
export function validateAuthCredentials(
  email?: string,
  password?: string
): { status: number; body: SignInResponse } {
  // Validate payload
  if (!email || typeof email !== 'string' || !email.trim() || !password || typeof password !== 'string') {
    return {
      status: 400,
      body: {
        ok: false,
        error: 'INVALID_PAYLOAD'
      }
    };
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Check known credentials map
  const mappedUser = VALID_CREDENTIALS_MAP[normalizedEmail];
  if (mappedUser) {
    const isPasswordValid = mappedUser.validPasswords.includes(password);
    if (isPasswordValid) {
      const token = generateSessionToken(mappedUser);
      return {
        status: 200,
        body: {
          ok: true,
          user: {
            id: mappedUser.id,
            email: mappedUser.email,
            role: mappedUser.role,
            name: mappedUser.name
          },
          token
        }
      };
    }
  }

  // Dynamic user match (Faculty, Students, Admin, Counselors)
  let foundUser: { id: string; name: string; email: string; role: UserRole } | null = null;
  let allowedPass: string[] = [];

  if (normalizedEmail.includes('admin') || normalizedEmail.includes('dean')) {
    foundUser = INITIAL_ADMINS[0];
    allowedPass = ['admin123', 'bca2026!', 'secret123', 'bca2026'];
  } else if (normalizedEmail.includes('student')) {
    const st = INITIAL_STUDENTS.find((s) => s.email.toLowerCase() === normalizedEmail) || INITIAL_STUDENTS[0];
    foundUser = { id: st.id, name: st.name, email: st.email, role: 'student' };
    allowedPass = ['student123', 'bca2026!', 'secret123', 'bca2026'];
  } else if (normalizedEmail.includes('counselor')) {
    foundUser = INITIAL_COUNSELORS[0];
    allowedPass = ['counselor123', 'bca2026!', 'secret123', 'bca2026'];
  } else if (normalizedEmail.endsWith('@bcafly.edu') || normalizedEmail.includes('faculty')) {
    const fac = INITIAL_FACULTY.find((f) => f.email.toLowerCase() === normalizedEmail) || INITIAL_FACULTY[0];
    foundUser = { id: fac.id, name: fac.name, email: fac.email, role: 'faculty' };
    allowedPass = ['faculty123', 'bca2026!', 'secret123', 'bca2026'];
  }

  const isValidPass = Boolean(foundUser && allowedPass.includes(password));

  if (foundUser && isValidPass) {
    const token = generateSessionToken(foundUser);
    return {
      status: 200,
      body: {
        ok: true,
        user: {
          id: foundUser.id,
          email: foundUser.email,
          role: foundUser.role,
          name: foundUser.name
        },
        token
      }
    };
  }

  // Invalid credentials
  return {
    status: 401,
    body: {
      ok: false,
      error: 'INVALID_CREDENTIALS'
    }
  };
}

/**
 * Client API function that calls POST /api/auth/signin
 */
export async function apiSignIn(req: SignInRequest): Promise<{ status: number; data: SignInResponse }> {
  try {
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req)
    });

    const data = (await response.json()) as SignInResponse;
    return {
      status: response.status,
      data
    };
  } catch {
    // If network / fetch fails (e.g. static bundling or client-only mock), fall back to local validation
    const local = validateAuthCredentials(req.email, req.password);
    return {
      status: local.status,
      data: local.body
    };
  }
}
