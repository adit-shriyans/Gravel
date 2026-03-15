/**
 * Startup validation for required environment variables.
 * Prevents runtime errors by failing fast with a clear message.
 */

const REQUIRED_ENV_VARS = [
  'MONGODB_URI',
  'JWT_SECRET',
] as const;

const OPTIONAL_ENV_VARS = [
  'GOOGLE_ID',
  'GOOGLE_CLIENT_SECRET',
  'NEXT_PUBLIC_GOOGLE_CLIENT_ID',
] as const;

export function validateEnv(): void {
  if (process.env.JEST_WORKER_ID !== undefined || process.env.NODE_ENV === 'test') {
    return;
  }

  const missing: string[] = [];

  for (const name of REQUIRED_ENV_VARS) {
    const value = process.env[name];
    if (value === undefined || value.trim() === '') {
      missing.push(name);
    }
  }

  if (missing.length > 0) {
    const message = [
      'Missing required environment variable(s):',
      missing.map((n) => `  - ${n}`).join('\n'),
      '',
      'Add them to .env or .env.local and restart the application.',
      'See .env.example for reference.',
    ].join('\n');
    throw new Error(message);
  }
}

export { REQUIRED_ENV_VARS, OPTIONAL_ENV_VARS };
