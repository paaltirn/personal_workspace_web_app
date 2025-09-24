'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, Save, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PromptTemplate } from '@/types/note';

interface PromptTemplateManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: PromptTemplate[];
  onUpdateTemplates: (templates: PromptTemplate[]) => void;
}

export default function PromptTemplateManager({
  open,
  onOpenChange,
  templates,
  onUpdateTemplates
}: PromptTemplateManagerProps) {
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    content: '',
    category: '通用'
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleAddTemplate = () => {
    if (!newTemplate.name.trim() || !newTemplate.content.trim()) {
      return;
    }
    
    const template: PromptTemplate = {
      id: crypto.randomUUID(),
      name: newTemplate.name.trim(),
      content: newTemplate.content.trim(),
      category: newTemplate.category.trim() || '通用',
      createdAt: new Date().toISOString()
    };
    
    onUpdateTemplates([...templates, template]);
    setNewTemplate({ name: '', content: '', category: '通用' });
    
    // 显示成功提示
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleUpdateTemplate = (updatedTemplate: PromptTemplate) => {
    onUpdateTemplates(templates.map(t => 
      t.id === updatedTemplate.id ? updatedTemplate : t
    ));
    setEditingTemplate(null);
  };

  const handleDeleteTemplate = (id: string) => {
    onUpdateTemplates(templates.filter(t => t.id !== id));
  };

  const handleEditTemplate = (template: PromptTemplate) => {
    setEditingTemplate(template);
  };

  const handleSaveEdit = () => {
    if (editingTemplate) {
      handleUpdateTemplate(editingTemplate);
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col">
        <DialogHeader className="border-b border-border pb-4 flex-shrink-0">
          <DialogTitle className="text-lg font-semibold">提示词模板管理</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 p-6 flex-1 overflow-y-auto">
          {/* 添加新模板 */}
          <div className="space-y-4 h-fit">
            <h3 className="text-sm font-medium">添加新模板</h3>
            <div className="space-y-3">
              <div>
                <Label>名称</Label>
                <Input
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  placeholder="模板名称"
                />
              </div>
              <div>
                <Label>分类</Label>
                <Input
                  value={newTemplate.category}
                  onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                  placeholder="分类"
                />
              </div>
              <div>
                <Label>内容</Label>
                <Textarea
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                  placeholder="模板内容"
                  rows={6}
                  className="resize-none"
                />
              </div>
              <Button
                onClick={handleAddTemplate}
                disabled={!newTemplate.name.trim() || !newTemplate.content.trim()}
                className="w-full"
              >
                {showSuccess ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    添加成功
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    添加模板
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* 现有模板列表 */}
          <div className="space-y-4 h-fit">
            <h3 className="text-sm font-medium">现有模板 ({templates.length})</h3>
            <div className="space-y-2 max-h-[350px] overflow-y-auto">
              {templates.length === 0 ? (
                <p className="text-sm text-muted-foreground">暂无模板</p>
              ) : (
                templates.map((template) => (
                  <div
                    key={template.id}
                    className="p-4 border rounded-lg space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-sm">{template.name}</h4>
                        <p className="text-xs text-muted-foreground">{template.category}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditTemplate(template)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {template.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 编辑模板对话框 */}
        {editingTemplate && (
          <Dialog open={!!editingTemplate} onOpenChange={() => setEditingTemplate(null)}>
            <DialogContent className="max-w-2xl rounded-2xl border border-border bg-card shadow-2xl">
              <DialogHeader>
                <DialogTitle>编辑模板</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 p-6">
                <div>
                  <Label>名称</Label>
                  <Input
                    value={editingTemplate.name}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>分类</Label>
                  <Input
                    value={editingTemplate.category}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, category: e.target.value })}
                  />
                </div>
                <div>
                  <Label>内容</Label>
                  <Textarea
                    value={editingTemplate.content}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, content: e.target.value })}
                    rows={8}
                    className="resize-none"
                  />
                </div>
              </div>

              <DialogFooter className="p-6 pt-0">
                <Button variant="outline" onClick={() => setEditingTemplate(null)}>
                  取消
                </Button>
                <Button onClick={handleSaveEdit}>
                  <Save className="h-4 w-4 mr-2" />
                  保存
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        <DialogFooter className="border-t border-border pt-4 px-6 pb-6 flex-shrink-0">
          <Button onClick={() => onOpenChange(false)}>
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}