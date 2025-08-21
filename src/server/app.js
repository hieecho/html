import express from 'express';
import cors from 'cors';
import { join } from 'path';
import { promises as fs } from 'fs';

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 数据存储
let data = {
  htmls: [],
  folders: [],
  tags: []
};

// 初始化数据
async function initData() {
  try {
    await fs.access('./data/database.json');
    const fileContent = await fs.readFile('./data/database.json', 'utf-8');
    data = JSON.parse(fileContent);
  } catch (error) {
    // 使用默认数据
    data = {
      htmls: [
        {
          id: '1',
          title: '示例HTML页面',
          content: '<!DOCTYPE html><html><head><title>示例</title></head><body><h1>示例页面</h1></body></html>',
          contentType: 'code',
          folderId: '1',
          tags: ['示例'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      folders: [
        { id: '1', name: '全部内容', createdAt: new Date().toISOString() },
        { id: '2', name: '网页源码', parentId: '1', createdAt: new Date().toISOString() },
        { id: '3', name: '网页快照', parentId: '1', createdAt: new Date().toISOString() }
      ],
      tags: [
        { id: '1', name: '示例', color: '#409eff' },
        { id: '2', name: '前端', color: '#67c23a' }
      ]
    };
    await fs.writeFile('./data/database.json', JSON.stringify(data, null, 2));
  }
}

// API路由
// HTML相关路由
app.get('/api/htmls', (req, res) => {
  res.json(data.htmls);
});

app.get('/api/htmls/:id', (req, res) => {
  const html = data.htmls.find(item => item.id === req.params.id);
  if (!html) return res.status(404).json({ error: 'HTML项目不存在' });
  res.json(html);
});

app.post('/api/htmls', async (req, res) => {
  const newHtml = {
    id: Date.now().toString(),
    ...req.body,
    tags: req.body.tags || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  data.htmls.push(newHtml);
  await fs.writeFile('./data/database.json', JSON.stringify(data, null, 2));
  res.status(201).json(newHtml);
});

app.put('/api/htmls/:id', async (req, res) => {
  const index = data.htmls.findIndex(item => item.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'HTML项目不存在' });
  
  data.htmls[index] = { ...data.htmls[index], ...req.body, updatedAt: new Date().toISOString() };
  await fs.writeFile('./data/database.json', JSON.stringify(data, null, 2));
  res.json(data.htmls[index]);
});

app.delete('/api/htmls/:id', async (req, res) => {
  const index = data.htmls.findIndex(item => item.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'HTML项目不存在' });
  
  data.htmls.splice(index, 1);
  await fs.writeFile('./data/database.json', JSON.stringify(data, null, 2));
  res.json({ success: true });
});

app.get('/api/htmls/search', (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: '搜索参数不能为空' });
  
  const results = data.htmls.filter(item =>
    item.title.toLowerCase().includes(q.toLowerCase()) ||
    item.content.toLowerCase().includes(q.toLowerCase()) ||
    (item.tags && item.tags.some(tag => tag.toLowerCase().includes(q.toLowerCase())))
  );
  res.json(results);
});

// URL导入API
app.post('/api/htmls/import-url', async (req, res) => {
  const { url, title, tags = [], folderId = '1' } = req.body;
  
  if (!url) return res.status(400).json({ error: 'URL不能为空' });
  
  try {
    // 在实际应用中，这里应该使用后端服务获取网页内容
    // 这里模拟获取网页标题和内容
    const urlObj = new URL(url);
    const defaultTitle = title || urlObj.hostname;
    
    // 创建URL类型的HTML项目
    const newHtml = {
      id: Date.now().toString(),
      title: defaultTitle,
      content: url,
      contentType: 'url',
      originalUrl: url,
      folderId,
      tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    data.htmls.push(newHtml);
    await fs.writeFile('./data/database.json', JSON.stringify(data, null, 2));
    
    res.status(201).json(newHtml);
  } catch (error) {
    console.error('URL导入失败:', error);
    res.status(500).json({ error: 'URL导入失败' });
  }
});

// 文件夹相关路由
app.get('/api/folders', (req, res) => {
  res.json(data.folders);
});

app.get('/api/folders/tree', (req, res) => {
  const folderMap = new Map();
  const rootFolders = [];

  data.folders.forEach(folder => {
    folderMap.set(folder.id, { ...folder, children: [] });
  });

  data.folders.forEach(folder => {
    const node = folderMap.get(folder.id);
    if (folder.parentId && folderMap.has(folder.parentId)) {
      folderMap.get(folder.parentId).children.push(node);
    } else {
      rootFolders.push(node);
    }
  });

  res.json(rootFolders);
});

app.post('/api/folders', async (req, res) => {
  const newFolder = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  data.folders.push(newFolder);
  await fs.writeFile('./data/database.json', JSON.stringify(data, null, 2));
  res.status(201).json(newFolder);
});

// 标签相关路由
app.get('/api/tags', (req, res) => {
  res.json(data.tags);
});

app.get('/api/tags/popular', (req, res) => {
  res.json(data.tags.slice(0, 10));
});

app.post('/api/tags', async (req, res) => {
  const newTag = {
    id: Date.now().toString(),
    ...req.body
  };
  data.tags.push(newTag);
  await fs.writeFile('./data/database.json', JSON.stringify(data, null, 2));
  res.status(201).json(newTag);
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器内部错误' });
});

app.use((req, res) => {
  res.status(404).json({ error: '接口不存在' });
});

// 启动服务器
async function startServer() {
  try {
    await initData();
    console.log('数据库初始化完成');
    
    app.listen(PORT, () => {
      console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
      console.log('📋 API文档:');
      console.log('  GET    /api/htmls          - 获取所有HTML项目');
      console.log('  POST   /api/htmls          - 创建HTML项目');
      console.log('  GET    /api/htmls/:id      - 获取单个HTML项目');
      console.log('  PUT    /api/htmls/:id      - 更新HTML项目');
      console.log('  DELETE /api/htmls/:id      - 删除HTML项目');
      console.log('  GET    /api/htmls/search   - 搜索HTML项目');
      console.log('  GET    /api/folders        - 获取文件夹');
      console.log('  GET    /api/folders/tree   - 获取文件夹树');
      console.log('  POST   /api/folders        - 创建文件夹');
      console.log('  GET    /api/tags           - 获取标签');
      console.log('  GET    /api/tags/popular   - 获取热门标签');
      console.log('  POST   /api/tags           - 创建标签');
    });
  } catch (error) {
    console.error('启动服务器失败:', error);
  }
}

startServer();

export default app;