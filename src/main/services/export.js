const PDFDocument = require('pdfkit');
const sharp = require('sharp');
const { Readable } = require('stream');

class ExportManager {
  /**
   * 导出HTML内容为指定格式
   * @param {string} content HTML内容
   * @param {string} format 导出格式
   * @param {Object} options 导出选项
   * @returns {Promise<Buffer>} 文件缓冲区
   */
  async export(content, format, options = {}) {
    const formatLower = format.toLowerCase();
    
    switch (formatLower) {
      case 'pdf':
        return await this.exportToPDF(content, options);
      case 'png':
        return await this.exportToPNG(content, options);
      case 'jpg':
      case 'jpeg':
        return await this.exportToJPEG(content, options);
      default:
        throw new Error(`不支持的格式: ${format}`);
    }
  }

  /**
   * 导出为PDF
   * @param {string} html HTML内容
   * @param {Object} options 选项
   * @returns {Promise<Buffer>} PDF缓冲区
   */
  async exportToPDF(html, options = {}) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument();
        const buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        // 添加标题和内容
        doc.fontSize(20).text('HTML导出', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(html.replace(/<[^>]*>/g, ''));
        
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 导出为PNG
   * @param {string} html HTML内容
   * @param {Object} options 选项
   * @returns {Promise<Buffer>} PNG缓冲区
   */
  async exportToPNG(html, options = {}) {
    const svg = `
      <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
        <rect width="800" height="600" fill="white"/>
        <text x="20" y="40" font-family="Arial" font-size="16" fill="black">
          ${html.replace(/<[^>]*>/g, '').replace(/[&]/g, '&amp;').replace(/[<]/g, '&lt;').replace(/[>]/g, '&gt;')}
        </text>
      </svg>
    `;
    
    return await sharp(Buffer.from(svg))
      .png()
      .toBuffer();
  }

  /**
   * 导出为JPEG
   * @param {string} html HTML内容
   * @param {Object} options 选项
   * @returns {Promise<Buffer>} JPEG缓冲区
   */
  async exportToJPEG(html, options = {}) {
    const svg = `
      <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
        <rect width="800" height="600" fill="white"/>
        <text x="20" y="40" font-family="Arial" font-size="16" fill="black">
          ${html.replace(/<[^>]*>/g, '').replace(/[&]/g, '&amp;').replace(/[<]/g, '&lt;').replace(/[>]/g, '&gt;')}
        </text>
      </svg>
    `;
    
    return await sharp(Buffer.from(svg))
      .jpeg({ quality: options.quality || 90 })
      .toBuffer();
  }

  /**
   * 获取支持的导出格式
   * @returns {Array<string>} 格式列表
   */
  getSupportedFormats() {
    return ['pdf', 'png', 'jpg', 'jpeg'];
  }

  /**
   * 获取指定格式的导出选项模板
   * @param {string} format 格式
   * @returns {Object} 选项模板
   */
  getOptionsTemplate(format) {
    const templates = {
      pdf: {
        format: {
          type: 'select',
          label: '纸张格式',
          options: ['A4', 'A3', 'A5', 'Letter', 'Legal'],
          default: 'A4'
        },
        landscape: {
          type: 'checkbox',
          label: '横向布局',
          default: false
        },
        printBackground: {
          type: 'checkbox',
          label: '打印背景',
          default: true
        },
        marginTop: {
          type: 'text',
          label: '上边距',
          default: '20px'
        },
        marginRight: {
          type: 'text',
          label: '右边距',
          default: '20px'
        },
        marginBottom: {
          type: 'text',
          label: '下边距',
          default: '20px'
        },
        marginLeft: {
          type: 'text',
          label: '左边距',
          default: '20px'
        }
      },
      png: {
        fullPage: {
          type: 'checkbox',
          label: '完整页面',
          default: true
        },
        width: {
          type: 'number',
          label: '宽度（像素）',
          default: 1920
        },
        height: {
          type: 'number',
          label: '高度（像素）',
          default: 1080
        },
        quality: {
          type: 'range',
          label: '质量',
          min: 1,
          max: 100,
          default: 90
        }
      },
      jpg: {
        fullPage: {
          type: 'checkbox',
          label: '完整页面',
          default: true
        },
        width: {
          type: 'number',
          label: '宽度（像素）',
          default: 1920
        },
        height: {
          type: 'number',
          label: '高度（像素）',
          default: 1080
        },
        quality: {
          type: 'range',
          label: '质量',
          min: 1,
          max: 100,
          default: 90
        }
      },
      jpeg: {
        fullPage: {
          type: 'checkbox',
          label: '完整页面',
          default: true
        },
        width: {
          type: 'number',
          label: '宽度（像素）',
          default: 1920
        },
        height: {
          type: 'number',
          label: '高度（像素）',
          default: 1080
        },
        quality: {
          type: 'range',
          label: '质量',
          min: 1,
          max: 100,
          default: 90
        }
      }
    };

    return templates[format.toLowerCase()] || {};
  }

  /**
   * 获取预设配置
   * @param {string} format 格式
   * @returns {Object} 预设配置
   */
  getPresets(format) {
    const presets = {
      pdf: {
        '标准A4': {
          format: 'A4',
          landscape: false,
          printBackground: true,
          marginTop: '20px',
          marginRight: '20px',
          marginBottom: '20px',
          marginLeft: '20px'
        },
        '横向A4': {
          format: 'A4',
          landscape: true,
          printBackground: true,
          marginTop: '20px',
          marginRight: '20px',
          marginBottom: '20px',
          marginLeft: '20px'
        },
        '无边距': {
          format: 'A4',
          landscape: false,
          printBackground: true,
          marginTop: '0px',
          marginRight: '0px',
          marginBottom: '0px',
          marginLeft: '0px'
        }
      },
      png: {
        '完整高清': {
          fullPage: true,
          quality: 90
        },
        '网页截图': {
          fullPage: true,
          quality: 80
        },
        '缩略图': {
          fullPage: false,
          width: 800,
          height: 600,
          quality: 70
        }
      },
      jpg: {
        '高质量': {
          fullPage: true,
          quality: 95
        },
        '中等质量': {
          fullPage: true,
          quality: 75
        },
        '低质量': {
          fullPage: true,
          quality: 50
        }
      },
      jpeg: {
        '高质量': {
          fullPage: true,
          quality: 95
        },
        '中等质量': {
          fullPage: true,
          quality: 75
        },
        '低质量': {
          fullPage: true,
          quality: 50
        }
      }
    };

    return presets[format.toLowerCase()] || {};
  }
}

// 创建单例实例
const exportManager = new ExportManager();

module.exports = exportManager;