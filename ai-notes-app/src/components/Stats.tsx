'use client';

import { useState, useEffect } from 'react';
import { FileText, Tag, Clock, BarChart3 } from 'lucide-react';
import { Note } from '@/types/note';

interface StatsProps {
  notes: Note[];
}

export default function Stats({ notes }: StatsProps) {
  const [todayNotes, setTodayNotes] = useState(0);
  const [thisWeekNotes, setThisWeekNotes] = useState(0);
  const [thisMonthNotes, setThisMonthNotes] = useState(0);
  
  const totalNotes = notes.length;
  const totalTags = new Set(notes.flatMap(note => note.tags)).size;
  const totalContentLength = notes.reduce((sum, note) => sum + note.content.length, 0);
  const averageContentLength = totalNotes > 0 ? Math.round(totalContentLength / totalNotes) : 0;

  useEffect(() => {
    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const todayCount = notes.filter(note => {
      const noteDate = new Date(note.createdAt);
      return noteDate.toDateString() === today.toDateString();
    }).length;

    const weekCount = notes.filter(note => {
      const noteDate = new Date(note.createdAt);
      return noteDate >= weekAgo;
    }).length;

    const monthCount = notes.filter(note => {
      const noteDate = new Date(note.createdAt);
      return noteDate >= monthAgo;
    }).length;

    setTodayNotes(todayCount);
    setThisWeekNotes(weekCount);
    setThisMonthNotes(monthCount);
  }, [notes]);

  const tagFrequency = notes
    .flatMap(note => note.tags)
    .reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const topTags = Object.entries(tagFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="flex-1 p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">统计信息</h1>
        <p className="text-muted-foreground text-lg">查看您的笔记使用统计</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">总笔记数</p>
              <p className="text-2xl font-bold">{totalNotes}</p>
            </div>
            <FileText className="h-8 w-8 text-primary" />
          </div>
        </div>

        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">总标签数</p>
              <p className="text-2xl font-bold">{totalTags}</p>
            </div>
            <Tag className="h-8 w-8 text-primary" />
          </div>
        </div>

        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">今日新增</p>
              <p className="text-2xl font-bold">{todayNotes}</p>
            </div>
            <Clock className="h-8 w-8 text-primary" />
          </div>
        </div>

        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">平均长度</p>
              <p className="text-2xl font-bold">{averageContentLength}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-primary" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">最近活动</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">今日</span>
              <span className="text-sm font-medium">{todayNotes} 篇</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">本周</span>
              <span className="text-sm font-medium">{thisWeekNotes} 篇</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">本月</span>
              <span className="text-sm font-medium">{thisMonthNotes} 篇</span>
            </div>
          </div>
        </div>

        {topTags.length > 0 && (
          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">热门标签</h3>
            <div className="space-y-2">
              {topTags.map(([tag, count]) => (
                <div key={tag} className="flex justify-between items-center">
                  <span className="text-sm bg-secondary px-2 py-1 rounded">{tag}</span>
                  <span className="text-sm text-muted-foreground">{count} 次使用</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {notes.length > 0 && (
        <div className="mt-6 bg-card border rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">内容统计</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{totalContentLength}</p>
              <p className="text-sm text-muted-foreground">总字符数</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{Math.round(totalContentLength / 100)}</p>
              <p className="text-sm text-muted-foreground">总字数(估算)</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {notes.length > 0 ? Math.round(totalContentLength / notes.length) : 0}
              </p>
              <p className="text-sm text-muted-foreground">平均每篇长度</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}