import 'dotenv/config'; import { app } from './app.js'; import { env } from './config/env.js'; import { pool } from './database/pool.js';
const server=app.listen(env.PORT, '0.0.0.0',()=>console.log('Daymark API listening on port '+env.PORT));
const close=async()=>{server.close();await pool.end();process.exit(0);}; process.on('SIGINT',close); process.on('SIGTERM',close);
