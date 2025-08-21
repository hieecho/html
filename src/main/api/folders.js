const express = require('express');
const router = express.Router();
const folderService = require('../services/folderService');

// 获取所有文件夹
router.get('/', async (req, res) => {
  try {
    const folders = await folderService.getAllFolders();
    res.json(folders);
  } catch (error) {
    console.error('获取文件夹失败:', error);
    res.status(500).json({ error: '获取文件夹失败' });
  }
});

// 获取文件夹树结构
router.get('/tree', async (req, res) => {
  try {
    const tree = await folderService.getFolderTree();
    res.json(tree);
  } catch (error) {
    console.error('获取文件夹树失败:', error);
    res.status(500).json({ error: '获取文件夹树失败' });
  }
});

// 创建文件夹
router.post('/', async (req, res) => {
  try {
    const { name, parentId } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: '文件夹名称不能为空' });
    }

    const folder = await folderService.createFolder({ name: name.trim(), parentId });
    res.status(201).json(folder);
  } catch (error) {
    console.error('创建文件夹失败:', error);
    res.status(500).json({ error: '创建文件夹失败' });
  }
});

// 更新文件夹
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, parentId } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: '文件夹名称不能为空' });
    }

    const folder = await folderService.updateFolder(id, { name: name.trim(), parentId });
    res.json(folder);
  } catch (error) {
    console.error('更新文件夹失败:', error);
    if (error.message === '文件夹不存在') {
      res.status(404).json({ error: '文件夹不存在' });
    } else {
      res.status(500).json({ error: '更新文件夹失败' });
    }
  }
});

// 删除文件夹
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await folderService.deleteFolder(id);
    res.json({ message: '文件夹已删除' });
  } catch (error) {
    console.error('删除文件夹失败:', error);
    if (error.message === '文件夹不存在') {
      res.status(404).json({ error: '文件夹不存在' });
    } else {
      res.status(500).json({ error: '删除文件夹失败' });
    }
  }
});

module.exports = router;