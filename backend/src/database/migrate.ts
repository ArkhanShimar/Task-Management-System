import 'dotenv/config';
import { readFile, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import { pool } from './pool.js';

const directory = resolve(process.cwd(), 'src/database/migrations');

try {
  await pool.query('CREATE TABLE IF NOT EXISTS migrations (name VARCHAR(255) PRIMARY KEY, applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)');
  const files = (await readdir(directory)).filter((file) => file.endsWith('.sql')).sort();
  for (const file of files) {
    const [rows] = await pool.execute('SELECT name FROM migrations WHERE name = ?', [file]);
    if ((rows as unknown[]).length) continue;
    const sql = await readFile(join(directory, file), 'utf8');
    for (const statement of sql.split(';').map((item) => item.trim()).filter(Boolean)) await pool.query(statement);
    await pool.execute('INSERT INTO migrations (name) VALUES (?)', [file]);
    console.log('Applied ' + file);
  }
  console.log('Database tables are ready.');
} finally { await pool.end(); }
