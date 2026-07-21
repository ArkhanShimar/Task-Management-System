export type Priority='low'|'medium'|'high'; export type Status='pending'|'in_progress'|'completed';
export type Task={id:number;title:string;description:string|null;priority:Priority;status:Status;dueDate:string;createdAt:string;updatedAt:string};
export type TaskInput={title:string;description:string;priority:Priority;status:Status;dueDate:string};
export type User={id:number;name:string;email:string}; export type Summary={total:number;pending:number;inProgress:number;completed:number;overdue:number};
