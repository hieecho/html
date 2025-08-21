const path = require('path');
const fs = require('fs').promises;

/**
 * 基础导出服务类
 * 提供通用的导出功能和工具方法
 */
class BaseExportService {
  constructor() {
    this.tempDir = path.join(__dirname, '../../../temp');
    this.ensureTempDir();
  }

  /**
   * 确保临时目录存在
   */
  async ensureTempDir() {
    try {
      await fs.access(this.tempDir);
    } catch (error) {
      await fs.mkdir(this.tempDir, { recursive: true });
    }
  }

  /**
   * 生成临时文件名
   * @param {string} extension 文件扩展名
   * @returns {string} 临时文件路径
   */
  generateTempFile(extension) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return path.join(this.tempDir, `export_${timestamp}_${random}.${extension}`);
  }

  /**
   * 清理临时文件
   * @param {string} filePath 文件路径
   */
  async cleanup(filePath) {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.warn('清理临时文件失败:', error.message);
    }
  }

  /**
   * 验证HTML内容
   * @param {string} htmlContent HTML内容
   * @returns {boolean} 是否有效
   */
  validateHtml(htmlContent) {
    return typeof htmlContent === 'string' && htmlContent.trim().length > 0;
  }

  /**
   * 添加基础HTML模板
   * @param {string} content 内容
   * @param {Object} options 选项
   * @returns {string} 完整HTML
   */
  wrapWithTemplate(content, options = {}) {
    const {
      title = '导出的HTML内容',
      charset = 'UTF-8',
      viewport = 'width=device-width, initial-scale=1.0'
    } = options;

    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="${charset}">
    <meta name="viewport" content="${viewport}">
    <title>${title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 100%;
            margin: 0 auto;
            padding: 20px;
        }
        img {
            max-width: 100%;
            height: auto;
        }
        pre {
            background: #f5f5f5;
            padding: 10px;
            border-radius: 4px;
            overflow-x: auto;
        }
        code {
            background: #f5f5f5;
            padding: 2px 4px;
            border-radius: 2px;
        }
    </style>
</head>
<body>
    ${content}
</body>
</html>`;
  }
}

module.exports = BaseExportService;