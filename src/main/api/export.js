const express = require('express');
const router = express.Router();
const exportManager = require('../services/export');

/**
 * POST /api/export
 * 导出HTML内容为指定格式
 * 
 * @body {string} content HTML内容
 * @body {string} format 导出格式（pdf, png, jpg）
 * @body {Object} options 导出选项
 */
router.post('/', async (req, res) => {
  try {
    const { content, format, options = {} } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({
        success: false,
        error: '缺少HTML内容'
      });
    }

    if (!format || !['pdf', 'png', 'jpg', 'jpeg'].includes(format.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: '无效的导出格式，支持：pdf, png, jpg'
      });
    }

    console.log(`开始导出为 ${format} 格式...`);
    
    const buffer = await exportManager.export(content, format, options);
    
    // 设置响应头
    const mimeTypes = {
      'pdf': 'application/pdf',
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg'
    };

    const extensions = {
      'pdf': 'pdf',
      'png': 'png',
      'jpg': 'jpg',
      'jpeg': 'jpg'
    };

    const filename = `export_${Date.now()}.${extensions[format.toLowerCase()]}`;

    res.set({
      'Content-Type': mimeTypes[format.toLowerCase()],
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length
    });

    res.send(buffer);

  } catch (error) {
    console.error('导出失败:', error);
    res.status(500).json({
      success: false,
      error: error.message || '导出失败'
    });
  }
});

/**
 * GET /api/export/formats
 * 获取支持的导出格式列表
 */
router.get('/formats', (req, res) => {
  try {
    const formats = exportManager.getSupportedFormats();
    res.json({
      success: true,
      data: formats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/export/options/:format
 * 获取指定格式的导出选项模板
 */
router.get('/options/:format', (req, res) => {
  try {
    const { format } = req.params;
    
    if (!exportManager.getSupportedFormats().includes(format.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: '不支持的格式'
      });
    }

    const template = exportManager.getOptionsTemplate(format);
    const presets = exportManager.getPresets(format);

    res.json({
      success: true,
      data: {
        template,
        presets
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/export/test
 * 测试导出功能
 */
router.post('/test', async (req, res) => {
  try {
    const { format = 'pdf' } = req.body;
    
    const testHtml = `
      <h1>测试导出功能</h1>
      <p>这是一个测试HTML内容，用于验证${format.toUpperCase()}导出功能是否正常工作。</p>
      <div style="background: #f0f0f0; padding: 20px; margin: 20px 0;">
        <h3>测试内容</h3>
        <ul>
          <li>列表项1</li>
          <li>列表项2</li>
          <li>列表项3</li>
        </ul>
        <p>当前时间: ${new Date().toLocaleString('zh-CN')}</p>
      </div>
      <pre><code>console.log('Hello, World!');</code></pre>
    `;

    const buffer = await exportManager.export(testHtml, format);
    
    const filename = `test_export_${Date.now()}.${format === 'pdf' ? 'pdf' : format}`;
    
    res.set({
      'Content-Type': format === 'pdf' ? 'application/pdf' : `image/${format}`,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length
    });

    res.send(buffer);

  } catch (error) {
    console.error('测试导出失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;