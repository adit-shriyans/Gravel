/**
 * Validate required environment variables at startup.
 * Prevents runtime errors by failing fast with a clear message.
 */
function validateEnvAtStartup() {
  if (process.env.JEST_WORKER_ID !== undefined || process.env.NODE_ENV === 'test') {
    return;
  }
  const required = ['MONGODB_URI', 'JWT_SECRET', 'NEXTAUTH_SECRET'];
  const missing = required.filter((name) => {
    const value = process.env[name];
    return value === undefined || String(value).trim() === '';
  });
  if (missing.length > 0) {
    const message = [
      'Missing required environment variable(s):',
      ...missing.map((n) => `  - ${n}`),
      '',
      'Add them to .env or .env.local and restart the application.',
    ].join('\n');
    throw new Error(message);
  }
}
validateEnvAtStartup();

/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      appDir: true,
      serverComponentsExternalPackages: ["mongoose"],
    },
    images: {
      domains: ['lh3.googleusercontent.com'],
    },
    webpack(config) {
      config.experiments = {
        ...config.experiments,
        topLevelAwait: true,
      }
      return config
    }
  }
  
  module.exports = nextConfig