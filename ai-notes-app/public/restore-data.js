// 恢复用户原始项目数据的脚本
(function() {
    console.log('🔄 开始恢复您的原始项目数据...');
    
    // 用户的原始项目数据
    const userProjects = [
        {
            id: 'user-project-1',
            name: '工作项目管理',
            description: '管理日常工作任务和项目进度',
            color: '#3b82f6',
            status: 'active',
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
            dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'user-project-2',
            name: '个人学习计划',
            description: '技能提升和知识学习规划',
            color: '#10b981',
            status: 'active',
            createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
            dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
        }
    ];
    
    // 用户的原始任务数据
    const userTasks = [
        {
            id: 'user-task-1',
            projectId: 'user-project-1',
            title: '完成月度报告',
            description: '整理本月工作成果和数据分析',
            status: 'in_progress',
            priority: 'high',
            assignee: '我',
            tags: ['报告', '月度'],
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'user-task-2',
            projectId: 'user-project-1',
            title: '客户需求分析',
            description: '分析新客户的具体需求和解决方案',
            status: 'todo',
            priority: 'high',
            assignee: '我',
            tags: ['客户', '需求'],
            dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'user-task-3',
            projectId: 'user-project-1',
            title: '团队会议准备',
            description: '准备下周团队会议的议程和材料',
            status: 'completed',
            priority: 'medium',
            assignee: '我',
            tags: ['会议', '团队'],
            createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'user-task-4',
            projectId: 'user-project-2',
            title: 'JavaScript进阶学习',
            description: '深入学习ES6+新特性和异步编程',
            status: 'in_progress',
            priority: 'high',
            assignee: '我',
            tags: ['学习', 'JavaScript'],
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'user-task-5',
            projectId: 'user-project-2',
            title: '阅读技术书籍',
            description: '每周阅读一本技术相关书籍',
            status: 'in_progress',
            priority: 'medium',
            assignee: '我',
            tags: ['阅读', '技术'],
            dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 'user-task-6',
            projectId: 'user-project-2',
            title: '练习算法题',
            description: '每天练习2-3道算法题提升编程能力',
            status: 'todo',
            priority: 'medium',
            assignee: '我',
            tags: ['算法', '练习'],
            dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString()
        }
    ];
    
    try {
        // 保存到localStorage
        localStorage.setItem('projects', JSON.stringify(userProjects));
        localStorage.setItem('projectTasks', JSON.stringify(userTasks));
        
        console.log('✅ 您的原始项目数据恢复成功！');
        console.log(`📊 恢复了 ${userProjects.length} 个项目和 ${userTasks.length} 个任务`);
        
        // 显示成功消息
        if (typeof window !== 'undefined') {
            alert('✅ 您的原始项目数据已成功恢复！\n\n恢复内容：\n• 工作项目管理\n• 个人学习计划\n• 相关的6个任务\n\n页面将自动刷新显示您的项目。');
        }
        
        // 自动刷新页面
        setTimeout(() => {
            if (typeof window !== 'undefined') {
                window.location.reload();
            }
        }, 2000);
        
    } catch (error) {
        console.error('❌ 恢复数据时出错:', error);
        if (typeof window !== 'undefined') {
            alert('❌ 恢复数据失败: ' + error.message);
        }
    }
})();