import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { pool } from './pool.js';
const seedEmail = process.env.SEED_USER_EMAIL || 'admin@test.com';
const seedPassword = process.env.SEED_USER_PASSWORD || '123456';
const seedName = process.env.SEED_USER_NAME || 'Admin User';
try {
  const password = await bcrypt.hash(seedPassword, 12);
  await pool.execute('INSERT INTO users (name, email, password) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE email = VALUES(email)', [seedName, seedEmail.toLowerCase(), password]);
  console.log('Default assessment user is ready.');
} finally { await pool.end(); }
