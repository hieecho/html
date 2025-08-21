const chromeLauncher = require('chrome-launcher');
const CDP = require('chrome-remote-interface');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const BaseExportService = require('./BaseExportService');

/**
 * 图片导出服务
 * 基于Chrome DevTools Protocol实现高质量PNG截图
 */
class ImageExportService extends BaseExportService {
  constructor() {
    super();
    this.defaultOptions = {
      format: 'png',
      quality: 90,
      width: 1920,
      height: 1080,
      fullPage: true,
      clip: null,
      deviceScaleFactor: 2,
      mobile: false,
      timeout: 30000
    };
  }

  /**
   * 导出HTML内容为PNG图片
   * @param {string} htmlContent HTML内容
   * @param {Object} options 导出选项
   * @returns {Promise<Buffer>} 图片Buffer
   */
  async exportToPNG(htmlContent, options = {}) {
    return this.exportToImage(htmlContent, { ...options, format: 'png' });
  }

  /**
   * 导出HTML内容为JPG图片
   * @param {string} htmlContent HTML内容
   * @param {Object} options 导出选项
   * @returns {Promise<Buffer>} 图片Buffer
   */
  async exportToJPG(htmlContent, options = {}) {
    return this.exportToImage(htmlContent, { ...options, format: 'jpeg' });
  }

  /**
   * 导出HTML内容为图片
   * @param {string} htmlContent HTML内容
   * @param {Object} options 导出选项
   * @returns {Promise<Buffer>} 图片Buffer
   */
  async exportToImage(htmlContent, options = {}) {
    if (!this.validateHtml(htmlContent)) {
      throw new Error('无效的HTML内容');
    }

    const exportOptions = { ...this.defaultOptions, ...options };
    const fullHtml = this.wrapWithTemplate(htmlContent, { title: options.title || '导出的图片' });

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
          '--disable-features=VizDisplayCompositor',
          '--hide-scrollbars',
          '--disable-extensions'
        ]
      });

      // 连接到Chrome DevTools Protocol
      const client = await CDP({ port: chrome.port });
      const { Page, Runtime, Emulation } = client;

      try {
        // 启用必要的域
        await Promise.all([
          Page.enable(),
          Runtime.enable()
        ]);

        // 设置设备参数
        await Emulation.setDeviceMetricsOverride({
          width: exportOptions.width,
          height: exportOptions.height,
          deviceScaleFactor: exportOptions.deviceScaleFactor,
          mobile: exportOptions.mobile,
          fitWindow: true
        });

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

        // 获取页面尺寸
        const result = await Runtime.evaluate({
          expression: `(
            () => {
              const body = document.body;
              const html = document.documentElement;
              return {
                width: Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth),
                height: Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight)
              };
            }
          )()`
        });

        const pageSize = result.result?.value || { width: exportOptions.width, height: exportOptions.height };

        // 设置截图参数
        let screenshotOptions = {
          format: exportOptions.format === 'jpeg' ? 'jpeg' : 'png',
          fromSurface: true
        };

        if (exportOptions.fullPage) {
          // 全页面截图
          await Emulation.setDeviceMetricsOverride({
            width: pageSize.width,
            height: pageSize.height,
            deviceScaleFactor: exportOptions.deviceScaleFactor,
            mobile: exportOptions.mobile,
            fitWindow: false
          });
          screenshotOptions = {
            ...screenshotOptions,
            clip: {
              x: 0,
              y: 0,
              width: pageSize.width,
              height: pageSize.height,
              scale: exportOptions.deviceScaleFactor
            }
          };
        } else if (exportOptions.clip) {
          // 自定义截图区域
          screenshotOptions.clip = {
            ...exportOptions.clip,
            scale: exportOptions.deviceScaleFactor
          };
        }

        // 执行截图
        const screenshot = await Page.captureScreenshot(screenshotOptions);
        
        // 将Base64转换为Buffer
        let buffer = Buffer.from(screenshot.data, 'base64');

        // 使用sharp进行后期处理
        if (exportOptions.format === 'jpeg') {
          buffer = await sharp(buffer)
            .jpeg({ quality: exportOptions.quality })
            .toBuffer();
        } else if (exportOptions.format === 'png') {
          buffer = await sharp(buffer)
            .png({ quality: exportOptions.quality })
            .toBuffer();
        }

        // 如果需要调整尺寸
        if (options.width || options.height) {
          const resizeOptions = {};
          if (options.width) resizeOptions.width = options.width;
          if (options.height) resizeOptions.height = options.height;
          resizeOptions.fit = options.fit || 'inside';
          
          buffer = await sharp(buffer)
            .resize(resizeOptions)
            .toBuffer();
        }

        return buffer;

      } finally {
        await client.close();
      }

    } catch (error) {
      console.error('图片导出失败:', error);
      throw new Error(`图片导出失败: ${error.message}`);
    } finally {
      if (chrome) {
        await chrome.kill();
      }
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
        options: ['png', 'jpeg'],
        default: 'png',
        label: '图片格式'
      },
      quality: {
        type: 'range',
        min: 1,
        max: 100,
        step: 1,
        default: 90,
        label: '图片质量'
      },
      width: {
        type: 'number',
        min: 100,
        max: 4000,
        step: 100,
        default: 1920,
        label: '宽度(px)'
      },
      height: {
        type: 'number',
        min: 100,
        max: 4000,
        step: 100,
        default: 1080,
        label: '高度(px)'
      },
      fullPage: {
        type: 'checkbox',
        default: true,
        label: '全页面截图'
      },
      deviceScaleFactor: {
        type: 'range',
        min: 1,
        max: 3,
        step: 0.5,
        default: 2,
        label: '设备像素比'
      }
    };
  }

  /**
   * 获取预设尺寸
   * @returns {Object} 预设尺寸
   */
  getPresetSizes() {
    return {
      '桌面': { width: 1920, height: 1080 },
      '笔记本': { width: 1366, height: 768 },
      '平板': { width: 768, height: 1024 },
      '手机': { width: 375, height: 667 },
      '4K': { width: 3840, height: 2160 }
    };
  }
}

module.exports = ImageExportService;