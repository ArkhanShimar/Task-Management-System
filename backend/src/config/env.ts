import { z } from 'zod';
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000), FRONTEND_URL: z.string().default('http://localhost:5173'),
  JWT_SECRET: z.string().min(16).default('local-dev-secret-change-me'), JWT_EXPIRES_IN: z.string().default('8h'),
  DB_HOST: z.string().default('localhost'), DB_PORT: z.coerce.number().default(3306),
  DB_NAME: z.string().default('daymark'), DB_USER: z.string().default('root'), DB_PASSWORD: z.string().default(''),
});
export const env = schema.parse(process.env);
