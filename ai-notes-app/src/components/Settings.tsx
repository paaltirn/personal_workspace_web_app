'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings as SettingsIcon } from 'lucide-react';
import { Settings as SettingsType } from '@/types/note';

interface SettingsPageProps {
  settings: SettingsType;
  onUpdateSettings: (settings: SettingsType) => void;
}

export default function SettingsPage({ settings, onUpdateSettings }: SettingsPageProps) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleSave = () => {
    onUpdateSettings(localSettings);
  };

  const handleTestConnection = async () => {
    console.log('🔍 测试连接 - API密钥状态:', {
      hasKey: !!localSettings.openRouterApiKey,
      keyLength: localSettings.openRouterApiKey?.length || 0,
      keyPrefix: localSettings.openRouterApiKey?.substring(0, 10) + '...',
      model: localSettings.aiModel
    });
    
    if (!localSettings.openRouterApiKey) {
      setTestResult('请输入API密钥');
      return;
    }
    
    // 检查API密钥格式
    if (!localSettings.openRouterApiKey.startsWith('sk-or-')) {
      setTestResult('⚠️ API密钥格式可能不正确，OpenRouter密钥应以"sk-or-"开头');
      console.warn('API密钥格式警告: OpenRouter密钥通常以sk-or-开头');
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      console.log('🔍 开始API连接测试...');
      console.log('🌐 请求URL: https://openrouter.ai/api/v1/chat/completions');
      console.log('🔑 API密钥长度:', localSettings.openRouterApiKey?.length);
      console.log('🤖 使用模型:', localSettings.aiModel || 'deepseek/deepseek-chat-v3.1');
      console.log('🏠 Referer:', window.location.origin);
      
      // 使用与实际AI功能相同的端点进行测试
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localSettings.openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Personal Workspace'
        },
        body: JSON.stringify({
          model: localSettings.aiModel || 'deepseek/deepseek-chat-v3.1',
          messages: [{
            role: 'user',
            content: '测试连接，请回复"连接成功"'
          }],
          temperature: 0.7,
          max_tokens: 50
        })
      });
      
      console.log('📡 响应状态:', response.status, response.statusText);
      console.log('📋 响应头:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const data = await response.json();
        setTestResult('✅ 连接成功！API密钥有效');
        console.log('✅ API测试成功:', data);
      } else {
        const errorText = await response.text();
        console.error('❌ API测试失败:', response.status, response.statusText, errorText);
        
        let errorMessage = `连接失败：${response.status} ${response.statusText}`;
        
        if (response.status === 401) {
          errorMessage += '\n\n🔑 可能的原因：\n• API密钥无效或已过期\n• API密钥格式错误（应以sk-or-开头）\n• 账户余额不足\n• API密钥权限不足';
        } else if (response.status === 429) {
          errorMessage += '\n\n⏰ 请求过于频繁，请稍后再试';
        } else if (response.status === 403) {
          errorMessage += '\n\n🚫 访问被拒绝，请检查API密钥权限';
        }
        
        setTestResult(errorMessage);
        
        // 尝试解析错误详情
        try {
          const errorData = JSON.parse(errorText);
          console.error('📋 详细错误信息:', errorData);
        } catch {
          console.error('📋 原始错误文本:', errorText);
        }
      }
    } catch (error) {
      console.error('❌ 网络错误:', error);
      setTestResult('连接失败：网络错误');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="flex-1 p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <SettingsIcon className="h-6 w-6" />
          <h1 className="text-2xl font-bold">设置</h1>
        </div>
        <p className="text-muted-foreground">
          配置您的个人工作台设置
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label htmlFor="apiKey" className="text-base">
            OpenRouter API密钥
          </Label>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-blue-900 mb-2">🔑 如何获取API密钥：</h4>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>访问 <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">OpenRouter API Keys</a></li>
              <li>登录或注册账户</li>
              <li>创建新的API密钥</li>
              <li>复制密钥（格式：sk-or-xxxxxxxxxx）</li>
              <li>确保账户有足够余额</li>
            </ol>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            用于访问AI功能的API密钥。
          </p>
          <Input
            id="apiKey"
            type="password"
            value={localSettings.openRouterApiKey}
            onChange={(e) => setLocalSettings({ ...localSettings, openRouterApiKey: e.target.value })}
            placeholder="sk-or-v1-..."
            className={localSettings.openRouterApiKey && !localSettings.openRouterApiKey.startsWith('sk-or-') ? 'border-red-300 focus:border-red-500' : ''}
          />
          {localSettings.openRouterApiKey && (
            <div className="mt-2 text-sm">
              {localSettings.openRouterApiKey.startsWith('sk-or-') ? (
                <span className="text-green-600 flex items-center gap-1">
                  ✅ API密钥格式正确
                </span>
              ) : (
                <span className="text-red-600 flex items-center gap-1">
                  ❌ API密钥格式错误，应以 &ldquo;sk-or-&rdquo; 开头
                </span>
              )}
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="model" className="text-base">
            AI模型
          </Label>
          <p className="text-sm text-muted-foreground mb-2">
            选择用于生成标题、标签和优化内容的AI模型。
          </p>
          <Input
            id="model"
            value={localSettings.aiModel}
            onChange={(e) => setLocalSettings({ ...localSettings, aiModel: e.target.value })}
            placeholder="deepseek/deepseek-chat-v3.1"
          />
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleTestConnection}
            disabled={isTesting}
            variant="outline"
          >
            {isTesting ? '测试中...' : '测试连接'}
          </Button>
          <Button onClick={handleSave}>
            保存设置
          </Button>
        </div>

        {testResult && (
          <div className={`p-3 rounded-lg text-sm ${
            testResult.includes('成功') 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {testResult}
          </div>
        )}

        <div className="mt-8 pt-6 border-t">
          <h3 className="text-lg font-semibold mb-2">API密钥获取方法</h3>
          <div className="text-sm text-muted-foreground space-y-2 mb-4">
            <p>1. 访问 <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenRouter.ai</a> 注册账户</p>
            <p>2. 在账户设置中创建API密钥</p>
            <p>3. 将API密钥粘贴到上方输入框中</p>
            <p>4. 推荐使用 deepseek/deepseek-chat-v3.1 模型（性价比高）</p>
          </div>
          
          <h3 className="text-lg font-semibold mb-2 text-orange-600">常见问题解决</h3>
          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>HTTP 401错误：</strong> 通常表示API密钥无效或格式错误</p>
            <p><strong>API密钥格式：</strong> OpenRouter密钥应以 &ldquo;sk-or-&rdquo; 开头</p>
            <p><strong>余额不足：</strong> 请检查OpenRouter账户余额</p>
            <p><strong>网络问题：</strong> 请检查网络连接和防火墙设置</p>
          </div>
          
          <h3 className="text-lg font-semibold mb-2">功能说明</h3>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>• 配置API密钥后，编辑笔记时会自动生成标签</p>
            <p>• 点击&apos;生成标题&apos;可基于内容自动生成简洁标题</p>
            <p>• 点击&apos;生成标签&apos;可手动重新生成标签</p>
            <p>• 点击&apos;优化内容&apos;可改进文本表达，支持预览和确认</p>
            <p>• 所有数据保存在浏览器本地，不会上传到服务器</p>
          </div>
        </div>
      </div>
    </div>
  );
}