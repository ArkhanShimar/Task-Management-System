import { Router } from 'express';
import {
  createTask, deleteTask, emptyRecycleBin, getTask, listDeletedTasks, listTasks,
  permanentlyDeleteTask, restoreTask, taskSummary, updateTask,
} from '../controllers/task.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const taskRouter = Router();
taskRouter.use(requireAuth);
taskRouter.get('/summary', taskSummary);
taskRouter.get('/recycle-bin', listDeletedTasks);
taskRouter.delete('/recycle-bin', emptyRecycleBin);
taskRouter.patch('/:id/restore', restoreTask);
taskRouter.delete('/:id/permanent', permanentlyDeleteTask);
taskRouter.get('/', listTasks);
taskRouter.get('/:id', getTask);
taskRouter.post('/', createTask);
taskRouter.put('/:id', updateTask);
taskRouter.delete('/:id', deleteTask);
