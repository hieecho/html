# HTML存储管理器

一个基于Electron + Vue 3的HTML内容管理工具，支持存储、管理和预览HTML代码、网页链接和网页快照。

## ✨ 功能特性

- 📁 **三栏布局**：侧边栏 + 内容列表 + 预览面板
- 📝 **多种内容类型**：支持网页源码、网页链接、网页快照
- 🔍 **智能搜索**：支持标题、内容、标签全文搜索
- 🏷️ **标签管理**：灵活的标签分类系统
- 📂 **文件夹组织**：树形结构的文件夹管理
- 🔗 **URL导入**：从网页URL自动导入
- 📄 **文件导入**：支持HTML、HTM、TXT文件批量导入
- ✏️ **代码编辑**：内嵌代码编辑器，支持实时预览
- 💾 **自动保存**：编辑内容500ms延迟自动保存
- 🎨 **代码高亮**：深色主题的代码编辑体验

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 启动开发环境
```bash
# 启动后端API服务
npm run dev:server

# 启动前端开发环境（新终端）
npm run dev
```

### 构建生产版本
```bash
npm run build
```

## 📁 项目结构

```
src/
├── main/                 # Electron主进程
├── renderer/             # 渲染进程（Vue应用）
│   ├── components/       # Vue组件
│   │   ├── ContentList/  # 内容列表组件
│   │   ├── Editor/       # 编辑器和预览组件
│   │   ├── Import/       # 导入功能组件
│   │   └── Sidebar/      # 侧边栏组件
│   ├── store/            # Pinia状态管理
│   ├── api/              # API客户端
│   └── App.vue           # 主应用组件
└── server/               # Express后端API
    └── app.js            # 后端服务入口
```

## 🔧 技术栈

- **前端**：Vue 3 + TypeScript + Vite
- **UI框架**：Element Plus
- **状态管理**：Pinia
- **后端**：Express.js
- **存储**：JSON文件存储
- **构建工具**：Vite + Electron

## 📋 API接口

### HTML项目相关
- `GET /api/htmls` - 获取所有HTML项目
- `POST /api/htmls` - 创建HTML项目
- `GET /api/htmls/:id` - 获取单个HTML项目
- `PUT /api/htmls/:id` - 更新HTML项目
- `DELETE /api/htmls/:id` - 删除HTML项目
- `GET /api/htmls/search` - 搜索HTML项目
- `POST /api/htmls/import-url` - 从URL导入HTML

### 文件夹相关
- `GET /api/folders` - 获取文件夹列表
- `GET /api/folders/tree` - 获取文件夹树结构
- `POST /api/folders` - 创建文件夹

### 标签相关
- `GET /api/tags` - 获取标签列表
- `GET /api/tags/popular` - 获取热门标签
- `POST /api/tags` - 创建标签

## 🎯 使用指南

### 创建新内容
1. 点击"新建"按钮
2. 选择内容类型（网页源码/网页链接/网页快照）
3. 填写标题和内容
4. 添加标签和选择文件夹
5. 保存即可

### 导入内容
1. 点击"导入"按钮
2. 选择导入方式：
   - **URL导入**：输入网页URL，自动获取标题
   - **文件导入**：拖拽或选择HTML文件
   - **代码粘贴**：直接粘贴HTML代码
3. 设置标签和文件夹
4. 完成导入

### 编辑和预览
1. 在列表中选择项目
2. 右侧预览面板显示内容
3. 切换到编辑模式修改代码
4. 实时预览修改效果
5. 自动保存编辑内容

### 搜索和筛选
- 顶部搜索框支持全文搜索
- 可按内容类型筛选
- 可按标签筛选
- 实时显示搜索结果

## 🐛 常见问题

### 问题：页面空白或报错
**解决**：
1. 检查控制台错误信息
2. 确保后端API已启动（`npm run dev:server`）
3. 检查网络请求是否正常

### 问题：导入失败
**解决**：
1. 检查URL是否有效
2. 确保文件格式正确（HTML/HTM/TXT）
3. 检查网络连接

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目！

## 📄 许可证

MIT License