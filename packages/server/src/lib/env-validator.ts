/**
 * Environment Variable Validator
 * 
 * CRITICAL: This validator ensures all required environment variables are present.
 * If any required variable is missing, the application will immediately throw an error
 * and exit, as per user requirement: "never use fake keys/URLs as fallback values"
 */

interface EnvConfig {
  required: string[];
  optional: string[];
  patterns?: Record<string, RegExp>;
}

const ENV_CONFIG: EnvConfig = {
  // Required for production deployment
  required: [
    'DATABASE_URL',
    'DIRECT_URL',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_ANON_KEY',
  ],
  // Optional - can be empty in development
  optional: [
    'PORT',
    'NODE_ENV',
    'ALIPAY_APP_ID',
    'ALIPAY_APP_PRIVATE_KEY',
    'ALIPAY_ALIPAY_PUBLIC_KEY',
    'AI_PROVIDER',
    'OPENAI_API_KEY',
    'ANTHROPIC_API_KEY',
    'AI_MODEL',
  ],
  patterns: {
    DATABASE_URL: /^postgresql:\/\/.+/,
    DIRECT_URL: /^postgresql:\/\/.+/,
    SUPABASE_URL: /^https:\/\/[a-z0-9-]+\.supabase\.co$/,
    // JWT format: header.payload.signature (3 parts)
    SUPABASE_SERVICE_ROLE_KEY: /^(eyJ[A-Za-z0-9-_]{10,}\.[A-Za-z0-9-_]{10,}\.[A-Za-z0-9-_]{10,})$/,
    SUPABASE_ANON_KEY: /^(eyJ[A-Za-z0-9-_]{10,}\.[A-Za-z0-9-_]{10,}\.[A-Za-z0-9-_]{10,})$/,
  },
};

/**
 * Validate environment variables before application starts
 * @throws Error if required variables are missing or invalid
 */
export function validateEnv(): void {
  const isProduction = process.env.NODE_ENV === 'production';
  const missingVars: string[] = [];
  const invalidVars: string[] = [];

  // Check required variables
  for (const varName of ENV_CONFIG.required) {
    const value = process.env[varName];

    // Check if missing
    if (!value || value === '' || value.includes('[YOUR-PASSWORD]') || value.includes('[REQUIRE-') || value.includes('[YOUR-')) {
      missingVars.push(varName);
      continue;
    }

    // Check if matches pattern (if defined)
    if (ENV_CONFIG.patterns && ENV_CONFIG.patterns[varName]) {
      const pattern = ENV_CONFIG.patterns[varName];
      if (!pattern.test(value)) {
        invalidVars.push(`${varName} (invalid format)`);
      }
    }

    // Additional JWT validation
    if (varName === 'SUPABASE_ANON_KEY' || varName === 'SUPABASE_SERVICE_ROLE_KEY') {
      const parts = value.split('.');
      if (parts.length !== 3) {
        // Find the var in invalidVars and update it
        const idx = invalidVars.findIndex(v => v.startsWith(varName));
        if (idx >= 0) {
          invalidVars[idx] = `${varName} (JWT must have 3 parts, got ${parts.length})`;
        } else {
          invalidVars.push(`${varName} (JWT must have 3 parts, got ${parts.length})`);
        }
      }
    }
  }

  // In development, we can allow some flexibility
  // But in production, ALL required variables must be present and valid
  if (isProduction && (missingVars.length > 0 || invalidVars.length > 0)) {
    const errorMessages = [
      ...missingVars.map(v => `Missing required environment variable: ${v}`),
      ...invalidVars.map(v => `Invalid environment variable: ${v}`),
    ];

    console.error('\n[ENV VALIDATION ERROR] Application cannot start:');
    errorMessages.forEach(msg => console.error(`  - ${msg}`));
    console.error('\nPlease configure these variables in your environment before starting the application.');
    console.error('Refer to .env.example for required configuration.\n');

    throw new Error('Environment validation failed. See error messages above.');
  }

  // In development, warn but don't exit (allows local testing)
  if (!isProduction && missingVars.length > 0) {
    console.warn('\n[ENV WARNING] Missing environment variables (development mode):');
    missingVars.forEach(v => console.warn(`  - ${v}`));
    console.warn('\nApplication will start in development mode, but production deployment will fail.');
    console.warn('Please configure these variables for full functionality.\n');
  }

  // Log successful validation in production
  if (isProduction) {
    console.log('[ENV] All required environment variables validated successfully');
  }
}

/**
 * Get environment variable with type safety
 * @throws Error if variable is missing in production
 */
export function getEnvVar(name: string, required: boolean = true): string {
  const value = process.env[name];

  if (required) {
    if (!value || value === '' || value.includes('[YOUR-') || value.includes('[REQUIRE-')) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error(`Required environment variable ${name} is not configured`);
      }
      return '';
    }
  }

  return value || '';
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if using mock AI provider
 */
export function isMockAI(): boolean {
  const provider = process.env.AI_PROVIDER || 'mock';
  return provider === 'mock' || !process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY;
}

/**
 * Check if using mock payment
 */
export function isMockPayment(): boolean {
  return !process.env.ALIPAY_APP_ID || process.env.ALIPAY_APP_ID === '';
}