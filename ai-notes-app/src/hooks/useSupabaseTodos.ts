'use client';

import { useState, useEffect, useCallback } from 'react';
import { Todo } from '@/types/todo';
import { todosApi } from '@/lib/supabase-api';
import { supabase } from '@/lib/supabase';

export function useSupabaseTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTodos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await todosApi.getAll();
      setTodos(data);
    } catch (err) {
      console.error('Failed to load todos:', err);
      setError('加载待办事项失败');
    } finally {
      setLoading(false);
    }
  }, []);

  const addTodo = useCallback(async (newTodo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      const data = await todosApi.create(newTodo);
      
      if (!data) {
        throw new Error('创建待办事项失败');
      }
      
      // 映射数据库字段到 TypeScript 类型
      const todo: Todo = {
        id: data.id,
        title: data.title,
        completed: data.completed,
        priority: data.priority,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        dueDate: data.dueDate,
        tags: data.tags
      };
      
      setTodos(prev => [todo, ...prev]);
      return todo;
    } catch (err) {
      console.error('Failed to add todo:', err);
      setError('添加待办事项失败');
      throw err;
    }
  }, []);

  const updateTodo = useCallback(async (id: string, updates: Partial<Todo>) => {
    try {
      setError(null);
      const data = await todosApi.update(id, updates);
      
      if (!data) {
        throw new Error('更新待办事项失败');
      }
      
      // 映射数据库字段到 TypeScript 类型
      const updatedTodo: Todo = {
        id: data.id,
        title: data.title,
        completed: data.completed,
        priority: data.priority,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        dueDate: data.dueDate,
        tags: data.tags
      };
      
      setTodos(prev => prev.map(todo => 
        todo.id === id ? updatedTodo : todo
      ));
      return updatedTodo;
    } catch (err) {
      console.error('Failed to update todo:', err);
      setError('更新待办事项失败');
      throw err;
    }
  }, []);

  const deleteTodo = useCallback(async (id: string) => {
    try {
      setError(null);
      await todosApi.delete(id);
      setTodos(prev => prev.filter(todo => todo.id !== id));
    } catch (err) {
      console.error('Failed to delete todo:', err);
      setError('删除待办事项失败');
      throw err;
    }
  }, []);

  const toggleTodo = useCallback(async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    
    return updateTodo(id, { completed: !todo.completed });
  }, [todos, updateTodo]);

  // 设置实时监听
  useEffect(() => {
    loadTodos();

    const channel = supabase
      .channel('todos_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'todos'
        },
        (payload) => {
          console.log('Todo change received:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newTodo = payload.new as any;
            const todo: Todo = {
              id: newTodo.id,
              title: newTodo.title,
              completed: newTodo.completed,
              priority: newTodo.priority,
              createdAt: newTodo.created_at,
              updatedAt: newTodo.updated_at,
              dueDate: newTodo.due_date,
              tags: newTodo.tags
            };
            setTodos(prev => {
              if (prev.some(t => t.id === todo.id)) return prev;
              return [todo, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedTodo = payload.new as any;
            const todo: Todo = {
              id: updatedTodo.id,
              title: updatedTodo.title,
              completed: updatedTodo.completed,
              priority: updatedTodo.priority,
              createdAt: updatedTodo.created_at,
              updatedAt: updatedTodo.updated_at,
              dueDate: updatedTodo.due_date,
              tags: updatedTodo.tags
            };
            setTodos(prev => prev.map(t => t.id === todo.id ? todo : t));
          } else if (payload.eventType === 'DELETE') {
            const deletedTodo = payload.old as any;
            setTodos(prev => prev.filter(t => t.id !== deletedTodo.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadTodos]);

  return {
    todos,
    loading,
    error,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    refetch: loadTodos
  };
}