import { Router } from 'express';
import { tagService } from '../services/TagService.js';

const router = Router();

// 获取所有标签
router.get('/', async (req, res) => {
  try {
    const tags = await tagService.getAllTags();
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: '获取标签失败' });
  }
});

// 获取热门标签
router.get('/popular', async (req, res) => {
  try {
    const tags = await tagService.getPopularTags();
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: '获取热门标签失败' });
  }
});

// 创建新标签
router.post('/', async (req, res) => {
  try {
    const tag = await tagService.createTag(req.body);
    res.status(201).json(tag);
  } catch (error) {
    res.status(500).json({ error: '创建标签失败' });
  }
});

export default router;