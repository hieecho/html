import { Router } from 'express';
import { htmlService } from '../services/HtmlService.js';

const router = Router();

// 获取所有HTML项目
router.get('/', async (req, res) => {
  try {
    const htmls = await htmlService.getAllHtmls();
    res.json(htmls);
  } catch (error) {
    res.status(500).json({ error: '获取HTML列表失败' });
  }
});

// 获取单个HTML项目
router.get('/:id', async (req, res) => {
  try {
    const html = await htmlService.getHtmlById(req.params.id);
    if (!html) {
      return res.status(404).json({ error: 'HTML项目不存在' });
    }
    res.json(html);
  } catch (error) {
    res.status(500).json({ error: '获取HTML项目失败' });
  }
});

// 创建新的HTML项目
router.post('/', async (req, res) => {
  try {
    const html = await htmlService.createHtml(req.body);
    res.status(201).json(html);
  } catch (error) {
    res.status(500).json({ error: '创建HTML项目失败' });
  }
});

// 更新HTML项目
router.put('/:id', async (req, res) => {
  try {
    const html = await htmlService.updateHtml(req.params.id, req.body);
    if (!html) {
      return res.status(404).json({ error: 'HTML项目不存在' });
    }
    res.json(html);
  } catch (error) {
    res.status(500).json({ error: '更新HTML项目失败' });
  }
});

// 删除HTML项目
router.delete('/:id', async (req, res) => {
  try {
    const success = await htmlService.deleteHtml(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'HTML项目不存在' });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: '删除HTML项目失败' });
  }
});

// 搜索HTML项目
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: '搜索参数不能为空' });
    }
    
    const results = await htmlService.searchHtmls(q);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: '搜索失败' });
  }
});

// 通过URL导入网页
router.post('/import-url', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL不能为空' });
    }
    
    const html = await htmlService.importFromUrl(url);
    res.status(201).json(html);
  } catch (error) {
    res.status(500).json({ error: 'URL导入失败' });
  }
});

export default router;