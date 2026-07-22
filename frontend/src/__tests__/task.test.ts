import { describe,expect,it } from 'vitest';
import type { Task } from '../types';
describe('task model',()=>{it('keeps API task dates as date-only strings',()=>{const task:Task={id:1,title:'Plan sprint',description:null,priority:'high',status:'pending',dueDate:'2026-07-23',reminderDaysBefore:1,createdAt:'',updatedAt:''};expect(task.dueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);});});
