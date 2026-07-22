import mysql from 'mysql2/promise';
import { env } from '../config/env.js';

export const pool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  ssl: env.DB_SSL_CA ? { ca: env.DB_SSL_CA, rejectUnauthorized: true } : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true,
});
