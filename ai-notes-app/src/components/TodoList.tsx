'use client';

import { useState, useMemo } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Todo } from '@/types/todo';
import { Check, Trash2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TodoItem from './TodoItem';
import AddTodoForm from './AddTodoForm';

export default function TodoList() {
  const [todos, setTodos] = useLocalStorage<Todo[]>('todos', []);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'title'>('date');

  const addTodo = (newTodo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => {
    const todo: Todo = {
      ...newTodo,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setTodos([todo, ...todos]);
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo =>
      todo.id === id
        ? { ...todo, completed: !todo.completed, updatedAt: new Date().toISOString() }
        : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const updateTodo = (id: string, updates: Partial<Todo>) => {
    setTodos(todos.map(todo =>
      todo.id === id
        ? { ...todo, ...updates, updatedAt: new Date().toISOString() }
        : todo
    ));
  };

  const filteredAndSortedTodos = useMemo(() => {
    let filtered = todos;

    if (filter === 'active') {
      filtered = filtered.filter(todo => !todo.completed);
    } else if (filter === 'completed') {
      filtered = filtered.filter(todo => todo.completed);
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'title':
          return a.title.localeCompare(b.title);
        case 'date':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [todos, filter, sortBy]);

  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const active = total - completed;
    return { total, completed, active };
  }, [todos]);


  return (
    <div className="flex-1 p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">待办事项</h1>
        <p className="text-muted-foreground text-lg">管理您的日常任务</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">总任务</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Check className="h-4 w-4 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">进行中</p>
              <p className="text-2xl font-bold">{stats.active}</p>
            </div>
            <div className="h-8 w-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-4 w-4 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">已完成</p>
              <p className="text-2xl font-bold">{stats.completed}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Check className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <AddTodoForm onAddTodo={addTodo} />

      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex gap-2">
          <span className="text-sm text-muted-foreground">筛选:</span>
          {(['all', 'active', 'completed'] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
              className="text-xs px-3 py-1 rounded-lg"
            >
              {f === 'all' ? '全部' : f === 'active' ? '进行中' : '已完成'}
            </Button>
          ))}
        </div>

        <div className="flex gap-2">
          <span className="text-sm text-muted-foreground">排序:</span>
          {(['date', 'priority', 'title'] as const).map((s) => (
            <Button
              key={s}
              variant={sortBy === s ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy(s)}
              className="text-xs px-3 py-1 rounded-lg"
            >
              {s === 'date' ? '日期' : s === 'priority' ? '优先级' : '标题'}
            </Button>
          ))}
        </div>
      </div>

      {filteredAndSortedTodos.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            <Check className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">
              {filter === 'completed' 
                ? '没有已完成的任务' 
                : filter === 'active' 
                ? '没有进行中的任务' 
                : '还没有任务'}
            </p>
            <p className="text-sm mt-2">
              {filter === 'all' ? '点击上方按钮创建第一个任务' : '尝试其他筛选条件'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAndSortedTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
              onUpdate={updateTodo}
            />
          ))}
        </div>
      )}

      {stats.completed > 0 && (
        <div className="mt-8 text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (confirm('确定要清除所有已完成的任务吗？')) {
                setTodos(todos.filter(todo => !todo.completed));
              }
            }}
            className="text-sm rounded-lg"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            清除已完成任务
          </Button>
        </div>
      )}
    </div>
  );
}