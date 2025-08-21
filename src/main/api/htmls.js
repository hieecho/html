const express = require('express');
const router = express.Router();
const htmlService = require('../services/htmlService');

// 获取所有HTML项目
router.get('/', async (req, res) => {
  try {
    const htmls = await htmlService.getAllHtmls();
    res.json(htmls);
  } catch (error) {
    console.error('获取HTML列表失败:', error);
    res.status(500).json({ error: '获取HTML列表失败' });
  }
});

// 获取单个HTML项目
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const html = await htmlService.getHtmlById(id);
    res.json(html);
  } catch (error) {
    console.error('获取HTML详情失败:', error);
    if (error.message === 'HTML项目不存在') {
      res.status(404).json({ error: 'HTML项目不存在' });
    } else {
      res.status(500).json({ error: '获取HTML详情失败' });
    }
  }
});

// 创建HTML项目
router.post('/', async (req, res) => {
  try {
    const { title, content, contentType, originalUrl, folderId, tags } = req.body;
    
    if (!title || !content || !contentType) {
      return res.status(400).json({ error: '标题、内容和类型不能为空' });
    }

    const html = await htmlService.createHtml({
      title: title.trim(),
      content: content.trim(),
      contentType: contentType.toLowerCase(),
      originalUrl: originalUrl?.trim(),
      folderId,
      tags: tags || []
    });
    
    res.status(201).json(html);
  } catch (error) {
    console.error('创建HTML失败:', error);
    if (error.message.includes('不能为空')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: '创建HTML失败' });
    }
  }
});

// 更新HTML项目
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, contentType, originalUrl, folderId, tags } = req.body;
    
    if (!title || !content || !contentType) {
      return res.status(400).json({ error: '标题、内容和类型不能为空' });
    }

    const html = await htmlService.updateHtml(id, {
      title: title.trim(),
      content: content.trim(),
      contentType: contentType.toLowerCase(),
      originalUrl: originalUrl?.trim(),
      folderId,
      tags
    });
    
    res.json(html);
  } catch (error) {
    console.error('更新HTML失败:', error);
    if (error.message === 'HTML项目不存在') {
      res.status(404).json({ error: 'HTML项目不存在' });
    } else {
      res.status(500).json({ error: '更新HTML失败' });
    }
  }
});

// 删除HTML项目
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await htmlService.deleteHtml(id);
    res.json({ message: 'HTML项目已删除' });
  } catch (error) {
    console.error('删除HTML失败:', error);
    if (error.message === 'HTML项目不存在') {
      res.status(404).json({ error: 'HTML项目不存在' });
    } else {
      res.status(500).json({ error: '删除HTML失败' });
    }
  }
});

// 搜索HTML项目
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim() === '') {
      return res.status(400).json({ error: '搜索关键词不能为空' });
    }

    const results = await htmlService.searchHtmls(q.trim());
    res.json(results);
  } catch (error) {
    console.error('搜索失败:', error);
    res.status(500).json({ error: '搜索失败' });
  }
});

// 通过URL导入HTML
router.post('/import-url', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url || url.trim() === '') {
      return res.status(400).json({ error: 'URL不能为空' });
    }

    const html = await htmlService.importFromUrl(url.trim());
    const newHtml = await htmlService.createHtml(html);
    
    res.status(201).json(newHtml);
  } catch (error) {
    console.error('URL导入失败:', error);
    res.status(500).json({ error: 'URL导入失败' });
  }
});

module.exports = router;