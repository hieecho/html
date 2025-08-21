# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述
这是一个HTML存储管理工具的桌面应用程序，用于收集、存储和管理各种形式的HTML内容，提供分类管理和实时预览功能。

## 技术栈
- **桌面应用框架**: Electron
- **前端框架**: Vue.js 3 + Element Plus
- **后端**: Node.js + Express (内嵌在Electron中)
- **数据库**: SQLite
- **网页抓取**: Puppeteer
- **代码编辑器**: Monaco Editor

## 核心命令

### 开发环境启动
```bash
# 安装依赖
npm install

# 开发模式启动
npm run dev

# 构建生产版本
npm run build

# 打包桌面应用
npm run electron:build
```

### 数据库操作
```bash
# 初始化数据库
npm run db:init

# 重置数据库
npm run db:reset
```

### 测试
```bash
# 运行单元测试
npm test

# 运行端到端测试
npm run test:e2e

# 运行单个测试文件
npm test -- --testNamePattern="API"
```

## 项目结构

### 前端 (src/renderer)
```
src/renderer/
├── components/          # Vue组件
│   ├── Sidebar/        # 左侧边栏组件
│   ├── ContentList/    # 中间列表组件
│   └── Preview/        # 右侧预览组件
├── views/              # 页面视图
├── store/              # Vuex状态管理
├── api/                # API接口调用
└── assets/             # 静态资源
```

### 后端 (src/main)
```
src/main/
├── api/                # Express API路由
├── database/           # SQLite数据库操作
├── services/           # 业务逻辑层
│   ├── htmlService.js  # HTML处理服务
│   ├── folderService.js # 文件夹服务
│   └── tagService.js   # 标签服务
└── utils/              # 工具函数
```

### 数据库模型
- **htmls**: HTML项目存储表
- **folders**: 文件夹结构表
- **tags**: 标签管理表

## API端点

### HTML管理
- `GET /api/htmls` - 获取所有HTML项目
- `POST /api/htmls` - 创建新HTML项目
- `GET /api/htmls/:id` - 获取单个HTML项目
- `PUT /api/htmls/:id` - 更新HTML项目
- `DELETE /api/htmls/:id` - 删除HTML项目

### 搜索和导入
- `GET /api/htmls/search?q=keyword` - 搜索HTML项目
- `POST /api/htmls/import-url` - 通过URL导入网页

### 文件夹管理
- `GET /api/folders` - 获取文件夹结构
- `POST /api/folders` - 创建新文件夹

### 标签管理
- `GET /api/tags` - 获取所有标签

## 开发阶段
项目分为6个开发阶段：
1. 项目搭建 (Electron + Vue.js + SQLite)
2. 核心功能 (CRUD API + 基础UI)
3. 预览功能 (Monaco Editor + Webview)
4. 导入功能 (HTML粘贴/URL抓取/文件导入)
5. 高级功能 (搜索/标签/导出)
6. 优化完善 (性能/打包发布)

## 关键配置
- **数据库文件**: `src/main/database/app.db`
- **配置文件**: `electron-builder.yml`
- **环境变量**: `.env` (数据库路径、端口等)
- **资源存储**: `resources/` 目录存储HTML依赖资源

## 使用说明
- 始终用中文回复我