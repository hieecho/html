import { Router } from 'express';
import { folderService } from '../services/FolderService.js';

const router = Router();

// 获取所有文件夹
router.get('/', async (req, res) => {
  try {
    const folders = await folderService.getAllFolders();
    res.json(folders);
  } catch (error) {
    res.status(500).json({ error: '获取文件夹失败' });
  }
});

// 获取文件夹树结构
router.get('/tree', async (req, res) => {
  try {
    const tree = await folderService.getFolderTree();
    res.json(tree);
  } catch (error) {
    res.status(500).json({ error: '获取文件夹树失败' });
  }
});

// 创建新文件夹
router.post('/', async (req, res) => {
  try {
    const folder = await folderService.createFolder(req.body);
    res.status(201).json(folder);
  } catch (error) {
    res.status(500).json({ error: '创建文件夹失败' });
  }
});

export default router;