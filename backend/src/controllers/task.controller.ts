import type { RequestHandler } from 'express';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../database/pool.js';
import { taskQuerySchema, taskSchema } from '../schemas/task.schema.js';
import { AppError } from '../utils/appError.js';
interface TaskRow extends RowDataPacket { id:number; title:string; description:string|null; priority:string; status:string; dueDate:string; createdAt:string; updatedAt:string }
const fields = 'SELECT id, title, description, priority, status, due_date AS dueDate, created_at AS createdAt, updated_at AS updatedAt FROM tasks';
export const listTasks: RequestHandler = async (req,res,next) => { try {
  const q=taskQuerySchema.parse(req.query), where=['user_id = ?']; const values:Array<string|number>=[req.user!.id];
  if(q.search){where.push('title LIKE ?');values.push('%'+q.search+'%');} if(q.status){where.push('status = ?');values.push(q.status);} if(q.priority){where.push('priority = ?');values.push(q.priority);}
  const order=q.sort==='oldest'?'created_at ASC':q.sort==='due_date'?'due_date ASC, created_at DESC':'created_at DESC';
  const [tasks]=await pool.execute<TaskRow[]>(fields+' WHERE '+where.join(' AND ')+' ORDER BY '+order,values); res.json({tasks});
} catch(e){next(e);} };
export const getTask: RequestHandler = async(req,res,next)=>{try{const[t]=await pool.execute<TaskRow[]>(fields+' WHERE id = ? AND user_id = ?',[Number(req.params.id),req.user!.id]);if(!t[0])throw new AppError(404,'Task not found.');res.json({task:t[0]});}catch(e){next(e);}};
export const createTask: RequestHandler = async(req,res,next)=>{try{const i=taskSchema.parse(req.body);const[r]=await pool.execute<ResultSetHeader>('INSERT INTO tasks (user_id,title,description,priority,status,due_date) VALUES (?,?,?,?,?,?)',[req.user!.id,i.title,i.description||null,i.priority,i.status,i.dueDate]);const[t]=await pool.execute<TaskRow[]>(fields+' WHERE id = ?',[r.insertId]);res.status(201).json({task:t[0],message:'Task created.'});}catch(e){next(e);}};
export const updateTask: RequestHandler = async(req,res,next)=>{try{const i=taskSchema.parse(req.body);const[r]=await pool.execute<ResultSetHeader>('UPDATE tasks SET title=?,description=?,priority=?,status=?,due_date=? WHERE id=? AND user_id=?',[i.title,i.description||null,i.priority,i.status,i.dueDate,Number(req.params.id),req.user!.id]);if(!r.affectedRows)throw new AppError(404,'Task not found.');const[t]=await pool.execute<TaskRow[]>(fields+' WHERE id = ?',[Number(req.params.id)]);res.json({task:t[0],message:'Task updated.'});}catch(e){next(e);}};
export const deleteTask: RequestHandler = async(req,res,next)=>{try{const[r]=await pool.execute<ResultSetHeader>('DELETE FROM tasks WHERE id=? AND user_id=?',[Number(req.params.id),req.user!.id]);if(!r.affectedRows)throw new AppError(404,'Task not found.');res.status(204).send();}catch(e){next(e);}};
export const taskSummary: RequestHandler = async(req,res,next)=>{try{const[rows]=await pool.execute<RowDataPacket[]>("SELECT COUNT(*) total,SUM(status='pending') pending,SUM(status='in_progress') inProgress,SUM(status='completed') completed,SUM(due_date<CURDATE() AND status!='completed') overdue FROM tasks WHERE user_id=?",[req.user!.id]);const row=rows[0]!;res.json({summary:Object.fromEntries(Object.entries(row).map(([k,v])=>[k,Number(v)]))});}catch(e){next(e);}};

