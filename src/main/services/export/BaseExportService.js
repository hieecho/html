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
        * {
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 100%;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
        }
        
        h1, h2, h3, h4, h5, h6 {
            margin-top: 1.5em;
            margin-bottom: 0.5em;
            font-weight: 600;
            line-height: 1.25;
        }
        
        h1 { font-size: 2em; color: #2c3e50; }
        h2 { font-size: 1.75em; color: #34495e; }
        h3 { font-size: 1.5em; color: #7f8c8d; }
        
        p {
            margin-bottom: 1em;
            text-align: justify;
        }
        
        img {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 1em auto;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        pre {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
            overflow-x: auto;
            border-left: 4px solid #007acc;
            margin: 1em 0;
            font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
            font-size: 14px;
            line-height: 1.4;
        }
        
        code {
            background: #f1f3f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
            font-size: 0.9em;
            color: #d73a49;
        }
        
        pre code {
            background: none;
            padding: 0;
            color: inherit;
        }
        
        blockquote {
            border-left: 4px solid #42b883;
            margin: 1em 0;
            padding: 0.5em 1em;
            background: #f8f9fa;
            font-style: italic;
            color: #666;
        }
        
        ul, ol {
            margin: 1em 0;
            padding-left: 2em;
        }
        
        li {
            margin-bottom: 0.5em;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 1em 0;
            font-size: 14px;
        }
        
        th, td {
            border: 1px solid #ddd;
            padding: 8px 12px;
            text-align: left;
        }
        
        th {
            background-color: #f8f9fa;
            font-weight: 600;
        }
        
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        
        .highlight {
            background-color: #fff3cd;
            padding: 0.2em 0.4em;
            border-radius: 3px;
        }
        
        .note {
            background-color: #e7f3ff;
            border: 1px solid #b3d9ff;
            border-radius: 4px;
            padding: 10px;
            margin: 1em 0;
        }
        
        .warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 4px;
            padding: 10px;
            margin: 1em 0;
        }
        
        .error {
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            border-radius: 4px;
            padding: 10px;
            margin: 1em 0;
        }
        
        @media print {
            body {
                padding: 0;
                margin: 0;
            }
            
            pre, blockquote {
                page-break-inside: avoid;
            }
            
            h1, h2, h3, h4, h5, h6 {
                page-break-after: avoid;
            }
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