export interface Task{
    id:number;
    title: string;
    description: string;
    priority: 'High' | 'Medium' | 'Low';
    dueDate: string;
    status: 'Completed' | 'Pending';
}
export interface CreateTaskPayload {
    title: string;
    description: string;
    priority: 'High' | 'Medium' | 'Low';
    dueDate: string;
    status: 'Completed' | 'Pending';
  }