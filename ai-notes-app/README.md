# 个人工作台

一个基于React和Next.js的AI原生个人工作台应用，专为MacBook用户设计的个人桌面Web应用。

## 功能特点

- 📝 **Markdown编辑器**：支持实时预览的Markdown编辑
- 🤖 **AI功能**：
  - 自动生成标题
  - 自动提取标签
  - 内容优化与润色
- 💾 **本地存储**：所有数据保存在浏览器localStorage中
- 🎨 **现代UI**：使用Shadcn/UI和Tailwind CSS构建
- ⚡ **快速响应**：实时保存，无需手动操作

## 技术栈

- **框架**：Next.js 15 (静态导出)
- **UI库**：Shadcn/UI + Tailwind CSS
- **状态管理**：React Hooks + 自定义Hooks
- **存储**：浏览器localStorage
- **AI集成**：OpenRouter API

## 快速开始

### 开发环境

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 导出静态文件
npm run export
```

### 配置AI功能

1. 访问 [OpenRouter.ai](https://openrouter.ai/keys) 获取API密钥
2. 在应用设置页面输入API密钥
3. 测试连接并开始使用AI功能

## 项目结构

```
src/
├── app/
│   ├── globals.css          # 全局样式
│   ├── layout.tsx          # 根布局
│   └── page.tsx            # 主页面
├── components/
│   ├── AppLayout.tsx       # 主布局组件
│   ├── Sidebar.tsx         # 侧边栏
│   ├── NoteList.tsx        # 笔记列表
│   ├── Editor.tsx          # 编辑器
│   ├── Settings.tsx        # 设置页面
│   ├── PolishModal.tsx     # 内容优化模态框
│   └── ui/                 # Shadcn UI组件
├── hooks/
│   ├── useLocalStorage.ts  # 本地存储Hook
│   └── useDebounce.ts      # 防抖Hook
└── types/
    └── note.ts             # 类型定义
```

## 使用说明

1. **创建笔记**：点击左侧笔记列表上方的"新笔记"按钮
2. **编辑内容**：在右侧编辑器中直接输入，支持Markdown语法
3. **AI功能**：
   - 点击"生成标题"自动根据内容生成标题
   - 点击"生成标签"自动提取关键词标签
   - 点击"优化内容"使用AI改进文本表达
4. **设置**：点击左侧齿轮图标配置API密钥

## 部署

应用已配置为静态导出，可以部署到任何静态文件托管服务：

```bash
npm run build
```

生成的静态文件位于 `out/` 目录，可直接部署到GitHub Pages、Vercel、Netlify等。

## 开发说明

- 所有数据存储在浏览器本地，无后端依赖
- 支持深色模式
- 响应式设计，适配不同屏幕尺寸
- 实时自动保存，无需手动操作
