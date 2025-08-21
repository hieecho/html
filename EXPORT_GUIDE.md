# HTML存储管理器 - 导出功能使用指南

## 🎯 功能概述

已成功实现PDF和PNG图片导出功能，支持以下特性：

### 📄 PDF导出功能
- **纸张格式**: A4, A3, A5, Letter, Legal, Tabloid
- **页面方向**: 纵向/横向
- **打印选项**: 背景图片、缩放比例
- **页边距**: 可自定义上下左右边距
- **高质量**: 保留CSS样式和布局

### 🖼️ PNG/JPG图片导出
- **自定义尺寸**: 支持自定义宽高
- **预设尺寸**: 桌面、笔记本、平板、手机、4K
- **图片质量**: JPG支持质量调节(1-100)
- **全页面**: 支持完整页面截图
- **高清**: 支持设备像素比调节

## 🚀 使用方法

### 1. 前端界面使用
1. 打开HTML存储管理器
2. 选择一个HTML项目
3. 在右侧预览面板点击"导出"按钮
4. 选择导出格式(PDF/PNG/JPG)
5. 配置导出选项
6. 点击"导出"下载文件

### 2. API接口调用

#### 导出API
```bash
POST /api/export
Content-Type: application/json

{
  "content": "<html>...</html>",
  "format": "pdf", // pdf, png, jpg
  "options": {
    // PDF选项
    "format": "A4",
    "landscape": false,
    "printBackground": true,
    "marginTop": "1cm",
    "marginBottom": "1cm",
    "marginLeft": "1cm",
    "marginRight": "1cm",
    
    // 图片选项
    "width": 1920,
    "height": 1080,
    "quality": 90,
    "fullPage": true,
    "deviceScaleFactor": 2
  }
}
```

#### 获取支持的格式
```bash
GET /api/export/formats
```

#### 获取选项模板
```bash
GET /api/export/options/pdf
GET /api/export/options/png
```

#### 测试接口
```bash
POST /api/export/test
{
  "format": "pdf"
}
```

## ⚙️ 技术实现

### 后端架构
```
src/main/services/export/
├── BaseExportService.js    # 基础服务类
├── PdfExportService.js     # PDF导出服务
├── ImageExportService.js   # 图片导出服务
└── index.js               # 统一导出管理器
```

### 前端组件
```
src/renderer/components/
├── ExportDialog.vue       # 导出对话框
└── Editor/
    └── PreviewPanel.vue   # 集成导出按钮
```

## 🧪 测试验证

运行测试脚本验证功能：
```bash
node test-export.js
```

预期输出：
```
1. 测试PDF导出...
   ✅ PDF导出成功，大小: 197.61 KB
2. 测试PNG导出...
   ✅ PNG导出成功，大小: 182.33 KB
🎉 所有测试通过！
```

## 🔧 依赖说明

### 新增依赖
- `chrome-launcher`: Chrome浏览器启动器
- `chrome-remote-interface`: Chrome DevTools协议接口
- `sharp`: 图片处理库
- `puppeteer-core`: 无头浏览器核心

### 系统要求
- 需要安装Chrome浏览器
- Node.js 16+ 版本
- 支持Windows/macOS/Linux

## 📋 常见问题

### 1. 导出失败
- 检查Chrome浏览器是否安装
- 确认网络连接正常
- 查看控制台错误信息

### 2. PDF样式问题
- 调整`printBackground`选项
- 检查CSS打印媒体查询
- 验证HTML内容完整性

### 3. 图片模糊
- 提高`deviceScaleFactor`值
- 增加导出尺寸
- 检查原始内容质量

## 🎉 完成状态

✅ PDF导出功能 - 已完成
✅ PNG导出功能 - 已完成
✅ JPG导出功能 - 已完成
✅ 前端界面集成 - 已完成
✅ API接口文档 - 已完成
✅ 测试验证 - 已完成

现在可以直接在应用中使用导出功能了！