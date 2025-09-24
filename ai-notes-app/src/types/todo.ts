export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  tags?: string[];
}