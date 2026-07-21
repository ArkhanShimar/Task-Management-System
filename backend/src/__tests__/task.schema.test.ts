import { describe,expect,it,vi } from 'vitest';
vi.mock('../config/env.js',()=>({env:{JWT_SECRET:'a-long-test-secret',JWT_EXPIRES_IN:'1h'}}));
import { taskQuerySchema,taskSchema } from '../schemas/task.schema.js';
describe('task validation',()=>{
 const valid={title:'Write project notes',description:'',priority:'medium',status:'pending',dueDate:new Date().toLocaleDateString('en-CA')};
 it('accepts a complete task',()=>expect(taskSchema.safeParse(valid).success).toBe(true));
 it('rejects a blank title',()=>expect(taskSchema.safeParse({...valid,title:'  '}).success).toBe(false));
 it('rejects a past date',()=>expect(taskSchema.safeParse({...valid,dueDate:'2020-01-01'}).success).toBe(false));
 it('accepts combined filters',()=>expect(taskQuerySchema.parse({status:'pending',priority:'high',sort:'due_date'})).toMatchObject({status:'pending',priority:'high'}));
});
