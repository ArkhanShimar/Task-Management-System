import { useEffect,useState,type FormEvent } from 'react'; import { X } from 'lucide-react'; import type { Task,TaskInput } from '../types';
const blank=():TaskInput=>({title:'',description:'',priority:'medium',status:'pending',dueDate:new Date().toLocaleDateString('en-CA')});
export function TaskModal({task,onClose,onSave}:{task:Task|null;onClose:()=>void;onSave:(value:TaskInput)=>Promise<void>}){
 const[value,setValue]=useState<TaskInput>(blank()),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 useEffect(()=>{if(task)setValue({title:task.title,description:task.description||'',priority:task.priority,status:task.status,dueDate:task.dueDate});},[task]);
 const change=(key:keyof TaskInput,next:string)=>setValue(v=>({...v,[key]:next}));
 const submit=async(e:FormEvent)=>{e.preventDefault();if(!value.title.trim()){setError('Give this task a title.');return;}if(value.dueDate<new Date().toLocaleDateString('en-CA')){setError('Due date cannot be earlier than today.');return;}setBusy(true);try{await onSave(value)}catch(err){setError(err instanceof Error?err.message:'Could not save this task.');setBusy(false)}};
 return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><form className="task-modal" onSubmit={submit}><div className="modal-head"><div><p className="eyebrow">{task?'EDIT TASK':'NEW TASK'}</p><h2>{task?'Make a few changes.':'What needs doing?'}</h2></div><button type="button" className="icon-button" onClick={onClose}><X/></button></div>
  <label>Task title<input value={value.title} onChange={e=>change('title',e.target.value)} placeholder="e.g. Send the final proposal" maxLength={150} autoFocus required/></label>
  <label>Notes <span className="optional">optional</span><textarea value={value.description} onChange={e=>change('description',e.target.value)} placeholder="Add a little context…" rows={4} maxLength={2000}/></label>
  <div className="field-row"><label>Priority<select value={value.priority} onChange={e=>change('priority',e.target.value)}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label><label>Status<select value={value.status} onChange={e=>change('status',e.target.value)}><option value="pending">Pending</option><option value="in_progress">In progress</option><option value="completed">Completed</option></select></label></div>
  <label>Due date<input type="date" min={new Date().toLocaleDateString('en-CA')} value={value.dueDate} onChange={e=>change('dueDate',e.target.value)} required/></label>
  {error&&<p className="form-error">{error}</p>}<div className="modal-actions"><button type="button" className="secondary" onClick={onClose}>Cancel</button><button className="primary" disabled={busy}>{busy?'Saving…':task?'Save changes':'Add task'}</button></div>
 </form></div>;
}
