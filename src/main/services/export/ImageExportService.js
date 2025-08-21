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
    console.log('=== 开始图片导出 ===');
    console.log('导出选项:', JSON.stringify(options, null, 2));
    console.log('HTML内容长度:', htmlContent.length);
    console.log('HTML内容预览:', htmlContent.substring(0, 200) + '...');
    
    if (!this.validateHtml(htmlContent)) {
      throw new Error('无效的HTML内容');
    }

    const exportOptions = { ...this.defaultOptions, ...options };
    console.log('合并后的导出选项:', JSON.stringify(exportOptions, null, 2));
    
    const fullHtml = this.wrapWithTemplate(htmlContent, { title: options.title || '导出的图片' });
    console.log('包装后的HTML长度:', fullHtml.length);

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
          '--disable-extensions',
          '--allow-running-insecure-content',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding'
        ]
      });

      // 连接到Chrome DevTools Protocol
      const client = await CDP({ port: chrome.port });
      const { Page, Runtime, Emulation, Network } = client;

      try {
        // 启用必要的域
        await Promise.all([
          Page.enable(),
          Runtime.enable(),
          Network.enable()
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

        // 等待DOM完全加载
        await Page.loadEventFired();
        
        // 等待JavaScript执行完成
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 等待所有资源加载完成
        await Runtime.evaluate({
          expression: `
            new Promise((resolve) => {
              if (document.readyState === 'complete') {
                resolve();
              } else {
                window.addEventListener('load', resolve);
                setTimeout(resolve, 3000); // 超时保护
              }
            })
          `
        });

        // 等待CSS和字体加载
        await Runtime.evaluate({
          expression: `
            new Promise((resolve) => {
              const checkFonts = () => {
                if (document.fonts && document.fonts.ready) {
                  document.fonts.ready.then(resolve);
                } else {
                  setTimeout(resolve, 1000);
                }
              };
              checkFonts();
            })
          `
        });

        // 再次等待确保渲染完成
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 获取页面尺寸 - 改进版本，支持内部滚动容器和iframe
        console.log('开始获取页面尺寸...');
        const pageSizeResult = await this.getAccuratePageSize(Runtime, exportOptions);
        const pageSize = pageSizeResult || { width: exportOptions.width, height: exportOptions.height };
        console.log('最终页面尺寸:', pageSize);

        // 设置截图参数
        console.log('设置截图参数...');
        let screenshotOptions = {
          format: exportOptions.format === 'jpeg' ? 'jpeg' : 'png',
          fromSurface: true
        };
        
        console.log('基础截图选项:', screenshotOptions);

        if (exportOptions.fullPage || exportOptions.captureSelector) {
          let clipArea = {
            x: 0,
            y: 0,
            width: Math.min(pageSize.width, 16384),
            height: Math.min(pageSize.height, 16384)
          };

          // 如果指定了captureSelector且获取到了位置信息，使用该区域
          if (exportOptions.captureSelector && pageSize.x !== undefined && pageSize.y !== undefined) {
            clipArea = {
              x: Math.max(0, pageSize.x),
              y: Math.max(0, pageSize.y),
              width: Math.min(pageSize.width, 16384),
              height: Math.min(pageSize.height, 16384)
            };
          }

          // 设置视口大小
          await Emulation.setDeviceMetricsOverride({
            width: Math.min(pageSize.width, 16384),
            height: Math.min(pageSize.height, 16384),
            deviceScaleFactor: exportOptions.deviceScaleFactor,
            mobile: exportOptions.mobile,
            fitWindow: false
          });

          // 等待页面重新渲染
          await new Promise(resolve => setTimeout(resolve, 500));

          screenshotOptions = {
            ...screenshotOptions,
            clip: {
              ...clipArea,
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
        console.log('执行截图，最终选项:', JSON.stringify(screenshotOptions, null, 2));
        const screenshot = await Page.captureScreenshot(screenshotOptions);
        console.log('截图完成，数据大小:', screenshot.data.length);
        
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
   * 获取准确的页面尺寸
   * @param {Object} Runtime Chrome DevTools Runtime对象
   * @param {Object} options 导出选项
   * @returns {Promise<Object>} 页面尺寸 {width, height}
   */
  async getAccuratePageSize(Runtime, options = {}) {
    try {
      // 方法1: 使用captureSelector指定的元素
      if (options.captureSelector) {
        const selectorResult = await Runtime.evaluate({
          expression: `
            (() => {
              const element = document.querySelector('${options.captureSelector}');
              if (element) {
                const rect = element.getBoundingClientRect();
                return {
                  width: Math.max(element.scrollWidth, element.offsetWidth, rect.width),
                  height: Math.max(element.scrollHeight, element.offsetHeight, rect.height),
                  x: rect.x,
                  y: rect.y
                };
              }
              return null;
            })()
          `,
          returnByValue: true
        });
        
        if (selectorResult.result?.value) {
          console.log('使用captureSelector获取页面尺寸:', selectorResult.result.value);
          return selectorResult.result.value;
        }
      }

      // 方法2: 遍历所有元素获取最大边界
      const elementsResult = await Runtime.evaluate({
        expression: `
          (() => {
            const elements = document.querySelectorAll('*');
            let maxWidth = 0;
            let maxHeight = 0;
            
            // 检查根文档尺寸
            const body = document.body;
            const html = document.documentElement;
            maxWidth = Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth);
            maxHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
            
            // 遍历所有元素，找到最大边界
            for (let element of elements) {
              try {
                const rect = element.getBoundingClientRect();
                const computedStyle = window.getComputedStyle(element);
                
                // 跳过不可见元素
                if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
                  continue;
                }
                
                // 计算元素的实际边界
                const elementRight = rect.left + Math.max(element.scrollWidth, element.offsetWidth, rect.width);
                const elementBottom = rect.top + Math.max(element.scrollHeight, element.offsetHeight, rect.height);
                
                maxWidth = Math.max(maxWidth, elementRight);
                maxHeight = Math.max(maxHeight, elementBottom);
                
                // 特别处理iframe
                if (element.tagName === 'IFRAME' && element.contentDocument) {
                  try {
                    const iframeBody = element.contentDocument.body;
                    const iframeHtml = element.contentDocument.documentElement;
                    if (iframeBody && iframeHtml) {
                      const iframeHeight = Math.max(
                        iframeBody.scrollHeight,
                        iframeBody.offsetHeight,
                        iframeHtml.scrollHeight,
                        iframeHtml.offsetHeight
                      );
                      maxHeight = Math.max(maxHeight, rect.top + iframeHeight);
                    }
                  } catch (e) {
                    // 跨域iframe无法访问，忽略
                  }
                }
              } catch (e) {
                // 忽略无法访问的元素
              }
            }
            
            return {
              width: Math.ceil(maxWidth),
              height: Math.ceil(maxHeight)
            };
          })()
        `,
        returnByValue: true
      });

      console.log('遍历元素方法完整结果:', elementsResult);
      
      if (elementsResult.result?.value) {
        const size = elementsResult.result.value;
        console.log('通过遍历元素获取页面尺寸:', size);
        
        // 确保尺寸合理（不超过极限值）
        const maxDimension = 16384; // Chrome截图的大致上限
        size.width = Math.min(size.width, maxDimension);
        size.height = Math.min(size.height, maxDimension);
        
        return size;
      } else {
        console.log('遍历元素方法失败，尝试回退方法');
      }

      // 方法3: 回退到原始方法
      const fallbackResult = await Runtime.evaluate({
        expression: `(
          () => {
            const body = document.body;
            const html = document.documentElement;
            const result = {
              width: Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth),
              height: Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight)
            };
            console.log('页面内部计算结果:', result);
            return result;
          }
        )()`,
        returnByValue: true
      });

      console.log('回退方法完整结果:', fallbackResult);
      console.log('使用回退方法获取页面尺寸:', fallbackResult.result?.value);
      
      if (fallbackResult.result?.value) {
        return fallbackResult.result.value;
      } else {
        console.error('回退方法也失败了，使用默认尺寸');
        return { width: 1200, height: 800 };
      }

    } catch (error) {
      console.error('获取页面尺寸失败:', error);
      return null;
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
      captureSelector: {
        type: 'text',
        label: '捕获选择器',
        default: '',
        placeholder: '例如: #main-content, .container'
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