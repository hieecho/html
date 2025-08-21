const express = require('express');
const router = express.Router();
const tagService = require('../services/tagService');

// 获取所有标签
router.get('/', async (req, res) => {
  try {
    const tags = await tagService.getAllTags();
    res.json(tags);
  } catch (error) {
    console.error('获取标签失败:', error);
    res.status(500).json({ error: '获取标签失败' });
  }
});

// 获取热门标签
router.get('/popular', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const tags = await tagService.getPopularTags(limit);
    res.json(tags);
  } catch (error) {
    console.error('获取热门标签失败:', error);
    res.status(500).json({ error: '获取热门标签失败' });
  }
});

// 创建标签
router.post('/', async (req, res) => {
  try {
    const { name, color } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: '标签名称不能为空' });
    }

    const tag = await tagService.createTag({ name: name.trim(), color });
    res.status(201).json(tag);
  } catch (error) {
    console.error('创建标签失败:', error);
    if (error.message.includes('不能为空')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: '创建标签失败' });
    }
  }
});

// 更新标签
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: '标签名称不能为空' });
    }

    const tag = await tagService.updateTag(id, { name: name.trim(), color });
    res.json(tag);
  } catch (error) {
    console.error('更新标签失败:', error);
    if (error.message === '标签不存在') {
      res.status(404).json({ error: '标签不存在' });
    } else {
      res.status(500).json({ error: '更新标签失败' });
    }
  }
});

// 删除标签
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await tagService.deleteTag(id);
    res.json({ message: '标签已删除' });
  } catch (error) {
    console.error('删除标签失败:', error);
    if (error.message === '标签不存在') {
      res.status(404).json({ error: '标签不存在' });
    } else {
      res.status(500).json({ error: '删除标签失败' });
    }
  }
});

module.exports = router;