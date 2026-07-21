import type { Summary,Task,TaskInput,User } from '../types';
const base=import.meta.env.VITE_API_URL||'/api';
class ApiError extends Error { constructor(message:string,public errors?:Record<string,string[]>){super(message);} }
async function request<T>(path:string,options:RequestInit={}):Promise<T>{
 const token=localStorage.getItem('daymark_token'); const response=await fetch(base+path,{...options,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{}),...options.headers}});
 if(response.status===204)return undefined as T; const data=await response.json().catch(()=>({message:'Could not reach the server.'}));
 if(!response.ok){if(response.status===401&&path!='/auth/login')localStorage.removeItem('daymark_token');throw new ApiError(data.message,data.errors);} return data;
}
export const api={
 login:(email:string,password:string)=>request<{token:string;user:User}>('/auth/login',{method:'POST',body:JSON.stringify({email,password})}),
 tasks:(query:string)=>request<{tasks:Task[]}>('/tasks'+query),
 summary:()=>request<{summary:Summary}>('/tasks/summary'),
 create:(task:TaskInput)=>request<{task:Task}>('/tasks',{method:'POST',body:JSON.stringify(task)}),
 update:(id:number,task:TaskInput)=>request<{task:Task}>('/tasks/'+id,{method:'PUT',body:JSON.stringify(task)}),
 remove:(id:number)=>request<void>('/tasks/'+id,{method:'DELETE'}),
}; export {ApiError};
