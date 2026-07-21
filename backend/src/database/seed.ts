import 'dotenv/config'; import bcrypt from 'bcryptjs'; import { pool } from './pool.js';
try {
 const password=await bcrypt.hash('123456',12);
 await pool.execute('INSERT INTO users (name,email,password) VALUES (?,?,?) ON DUPLICATE KEY UPDATE name=VALUES(name),password=VALUES(password)',['Alex Morgan','admin@test.com',password]);
 const [rows]=await pool.execute('SELECT id FROM users WHERE email=?',['admin@test.com']); const userId=(rows as Array<{id:number}>)[0]!.id;
 const [counts]=await pool.execute('SELECT COUNT(*) count FROM tasks WHERE user_id=?',[userId]);
 if(Number((counts as Array<{count:number}>)[0]!.count)===0) await pool.execute("INSERT INTO tasks (user_id,title,description,priority,status,due_date) VALUES (?,'Review weekly priorities','Check the plan and make room for anything urgent.','medium','pending',DATE_ADD(CURDATE(),INTERVAL 2 DAY)),(?,'Prepare product notes','Pull together the key points before the team catch-up.','high','in_progress',DATE_ADD(CURDATE(),INTERVAL 1 DAY)),(?,'Tidy project workspace','Archive old files and update the shared folder.','low','completed',CURDATE())",[userId,userId,userId]);
 console.log('Default user and starter tasks are ready.');
} finally { await pool.end(); }
