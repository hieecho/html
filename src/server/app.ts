import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { db } from './database/db.js';

import htmlRoutes from './routes/htmlRoutes.js';
import folderRoutes from './routes/folderRoutes.js';
import tagRoutes from './routes/tagRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use('/static', express.static(join(__dirname, '../../public')));

// API路由
app.use('/api/htmls', htmlRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/tags', tagRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 错误处理中间件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器内部错误' });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({ error: '接口不存在' });
});

// 初始化数据库并启动服务器
async function startServer() {
  try {
    await db.init();
    console.log('数据库初始化完成');
    
    app.listen(PORT, () => {
      console.log(`服务器运行在 http://localhost:${PORT}`);
      console.log('API文档:');
      console.log('  GET    /api/htmls          - 获取所有HTML项目');
      console.log('  POST   /api/htmls          - 创建HTML项目');
      console.log('  GET    /api/htmls/:id      - 获取单个HTML项目');
      console.log('  PUT    /api/htmls/:id      - 更新HTML项目');
      console.log('  DELETE /api/htmls/:id      - 删除HTML项目');
      console.log('  GET    /api/htmls/search   - 搜索HTML项目');
      console.log('  POST   /api/htmls/import-url - URL导入');
      console.log('  GET    /api/folders        - 获取文件夹');
      console.log('  GET    /api/folders/tree   - 获取文件夹树');
      console.log('  POST   /api/folders        - 创建文件夹');
      console.log('  GET    /api/tags           - 获取标签');
    });
  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;