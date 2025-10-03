import { useState, useEffect, useCallback } from 'react';
import { notesApi } from '@/lib/supabase-api';
import { Note } from '@/types/note';
import { createClient } from '@/lib/supabase-client';

const supabase = createClient();

export function useSupabaseNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // 加载笔记
  const loadNotes = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await notesApi.getAll();
      if (data) {
        const mappedNotes: Note[] = data.map(note => ({
          id: note.id,
          title: note.title,
          content: note.content,
          tags: note.tags || [],
          createdAt: note.createdAt,
          updatedAt: note.updatedAt,
          isFavorite: note.isFavorite || false
        }));
        setNotes(mappedNotes);
      }
    } catch (error) {
      console.error('加载笔记失败:', error);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, []);

  // 初始化加载
  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  // 设置实时监听
  useEffect(() => {
    const setupRealtimeSubscription = async () => {
      try {
        const user = await supabase.auth.getUser();
        if (!user.data.user) return;

        const subscription = supabase
          .channel('notes_changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'notes',
              filter: `user_id=eq.${user.data.user.id}`
            },
            (payload) => {
              console.log('实时更新:', payload);
              // 重新加载数据以保持同步
              loadNotes();
            }
          )
          .subscribe();

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('设置实时监听失败:', error);
      }
    };

    if (isInitialized) {
      setupRealtimeSubscription();
    }
  }, [isInitialized, loadNotes]);

  // 添加笔记
  const addNote = useCallback(async (): Promise<Note | null> => {
    console.log('useSupabaseNotes: 开始创建笔记');
    const newNoteData = {
      title: '新笔记',
      content: '',
      tags: []
    };

    try {
      console.log('useSupabaseNotes: 调用 notesApi.create');
      const data = await notesApi.create(newNoteData);
      console.log('useSupabaseNotes: notesApi.create 返回结果:', data);
      
      if (data) {
        // 直接使用 API 返回的数据，它已经包含正确的字段名
        setNotes(prevNotes => {
          console.log('useSupabaseNotes: 更新笔记列表，添加新笔记');
          return [data, ...prevNotes];
        });
        return data;
      }
      console.log('useSupabaseNotes: notesApi.create 返回 null');
      return null;
    } catch (error) {
      console.error('useSupabaseNotes: 创建笔记失败:', error);
      return null;
    }
  }, []);

  // 更新笔记
  const updateNote = useCallback(async (updatedNote: Note): Promise<boolean> => {
    try {
      const result = await notesApi.update(updatedNote.id, {
        title: updatedNote.title,
        content: updatedNote.content,
        tags: updatedNote.tags
      });

      if (result) {
        setNotes(prevNotes => 
          prevNotes.map(note => 
            note.id === updatedNote.id ? result : note
          )
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error('更新笔记失败:', error);
      return false;
    }
  }, []);

  // 删除笔记
  const deleteNote = useCallback(async (noteId: string): Promise<boolean> => {
    try {
      const success = await notesApi.delete(noteId);
      if (success) {
        setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
        return true;
      }
      return false;
    } catch (error) {
      console.error('删除笔记失败:', error);
      return false;
    }
  }, []);

  // 根据 ID 获取笔记
  const getNoteById = useCallback((noteId: string): Note | undefined => {
    return notes.find(note => note.id === noteId);
  }, [notes]);

  const toggleFavorite = async (noteId: string): Promise<boolean> => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        console.error('用户未登录');
        return false;
      }

      // 获取当前笔记状态
      const { data: currentNote, error: fetchError } = await supabase
        .from('notes')
        .select('is_favorite')
        .eq('id', noteId)
        .eq('user_id', user.data.user.id)
        .single();

      if (fetchError) {
        console.error('获取笔记状态失败:', fetchError);
        return false;
      }

      // 切换收藏状态
      const { error } = await supabase
        .from('notes')
        .update({ 
          is_favorite: !currentNote.is_favorite,
          updated_at: new Date().toISOString()
        })
        .eq('id', noteId)
        .eq('user_id', user.data.user.id);

      if (error) {
        console.error('切换收藏状态失败:', error);
        return false;
      }

      // 更新本地状态
      setNotes(prev => prev.map(note => 
        note.id === noteId 
          ? { ...note, isFavorite: !currentNote.is_favorite, updatedAt: new Date().toISOString() }
          : note
      ));

      return true;
    } catch (error) {
      console.error('切换收藏状态失败:', error);
      return false;
    }
  };

  return {
    notes,
    isLoading,
    isInitialized,
    addNote,
    updateNote,
    deleteNote,
    getNoteById,
    toggleFavorite,
    refreshNotes: loadNotes
  };
}