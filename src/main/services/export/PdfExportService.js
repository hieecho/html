const chromeLauncher = require('chrome-launcher');
const CDP = require('chrome-remote-interface');
const fs = require('fs').promises;
const path = require('path');
const BaseExportService = require('./BaseExportService');

/**
 * PDF导出服务
 * 基于Chrome DevTools Protocol实现高质量PDF导出
 */
class PdfExportService extends BaseExportService {
  constructor() {
    super();
    this.defaultOptions = {
      format: 'A4',
      landscape: false,
      printBackground: true,
      scale: 1.0,
      marginTop: '1cm',
      marginBottom: '1cm',
      marginLeft: '1cm',
      marginRight: '1cm',
      displayHeaderFooter: false,
      preferCSSPageSize: false
    };
  }

  /**
   * 导出HTML内容为PDF
   * @param {string} htmlContent HTML内容
   * @param {Object} options 导出选项
   * @returns {Promise<Buffer>} PDF文件Buffer
   */
  async exportToPDF(htmlContent, options = {}) {
    if (!this.validateHtml(htmlContent)) {
      throw new Error('无效的HTML内容');
    }

    const exportOptions = { ...this.defaultOptions, ...options };
    const fullHtml = this.wrapWithTemplate(htmlContent, { title: options.title || '导出的PDF文档' });

    let chrome;
    try {
      // 启动Chrome实例
      chrome = await chromeLauncher.launch({
        chromeFlags: [
          '--headless',
          '--disable-gpu',
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ]
      });

      // 连接到Chrome DevTools Protocol
      const client = await CDP({ port: chrome.port });
      const { Page, Runtime } = client;

      try {
        // 启用必要的域
        await Promise.all([
          Page.enable(),
          Runtime.enable()
        ]);

        // 导航到空白页面并设置内容
        await Page.navigate({ url: 'about:blank' });
        await Page.loadEventFired();

        // 设置HTML内容
        await Runtime.evaluate({
          expression: `
            document.open();
            document.write(\`${fullHtml.replace(/`/g, '\\`').replace(/\\/g, '\\\\')}\`);
            document.close();
          `
        });

        // 等待页面完全加载
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 生成PDF
        const pdfData = await Page.printToPDF({
          landscape: exportOptions.landscape,
          printBackground: exportOptions.printBackground,
          scale: exportOptions.scale,
          paperWidth: this.getPaperWidth(exportOptions.format),
          paperHeight: this.getPaperHeight(exportOptions.format),
          marginTop: this.convertMarginToInches(exportOptions.marginTop),
          marginBottom: this.convertMarginToInches(exportOptions.marginBottom),
          marginLeft: this.convertMarginToInches(exportOptions.marginLeft),
          marginRight: this.convertMarginToInches(exportOptions.marginRight),
          displayHeaderFooter: exportOptions.displayHeaderFooter,
          preferCSSPageSize: exportOptions.preferCSSPageSize
        });

        // 将Base64转换为Buffer
        const buffer = Buffer.from(pdfData.data, 'base64');
        return buffer;

      } finally {
        await client.close();
      }

    } catch (error) {
      console.error('PDF导出失败:', error);
      throw new Error(`PDF导出失败: ${error.message}`);
    } finally {
      if (chrome) {
        await chrome.kill();
      }
    }
  }

  /**
   * 获取纸张宽度（单位：英寸）
   * @param {string} format 纸张格式
   * @returns {number} 宽度（英寸）
   */
  getPaperWidth(format) {
    const formats = {
      'A4': 8.27,
      'A3': 11.69,
      'A5': 5.83,
      'Letter': 8.5,
      'Legal': 8.5,
      'Tabloid': 11.0
    };
    return formats[format] || formats['A4'];
  }

  /**
   * 获取纸张高度（单位：英寸）
   * @param {string} format 纸张格式
   * @returns {number} 高度（英寸）
   */
  getPaperHeight(format) {
    const formats = {
      'A4': 11.69,
      'A3': 16.54,
      'A5': 8.27,
      'Letter': 11.0,
      'Legal': 14.0,
      'Tabloid': 17.0
    };
    return formats[format] || formats['A4'];
  }

  /**
   * 将边距字符串转换为英寸数值
   * @param {string} margin 边距字符串（如 '1cm', '10mm', '0.5in'）
   * @returns {number} 英寸数值
   */
  convertMarginToInches(margin) {
    const value = parseFloat(margin);
    const unit = margin.replace(/[\d.\s]/g, '');
    
    switch (unit.toLowerCase()) {
      case 'cm':
        return value / 2.54;
      case 'mm':
        return value / 25.4;
      case 'in':
        return value;
      case 'px':
        return value / 96; // 96px = 1inch
      default:
        return value / 2.54; // 默认按cm处理
    }
  }

  /**
   * 获取导出选项模板
   * @returns {Object} 选项模板
   */
  getOptionsTemplate() {
    return {
      format: {
        type: 'select',
        options: ['A4', 'A3', 'A5', 'Letter', 'Legal', 'Tabloid'],
        default: 'A4',
        label: '纸张格式'
      },
      landscape: {
        type: 'checkbox',
        default: false,
        label: '横向布局'
      },
      printBackground: {
        type: 'checkbox',
        default: true,
        label: '打印背景'
      },
      scale: {
        type: 'range',
        min: 0.1,
        max: 2.0,
        step: 0.1,
        default: 1.0,
        label: '缩放比例'
      },
      marginTop: {
        type: 'text',
        default: '1cm',
        label: '上边距'
      },
      marginBottom: {
        type: 'text',
        default: '1cm',
        label: '下边距'
      },
      marginLeft: {
        type: 'text',
        default: '1cm',
        label: '左边距'
      },
      marginRight: {
        type: 'text',
        default: '1cm',
        label: '右边距'
      }
    };
  }
}

module.exports = PdfExportService;