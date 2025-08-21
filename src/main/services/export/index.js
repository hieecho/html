const PdfExportService = require('./PdfExportService');
const ImageExportService = require('./ImageExportService');

/**
 * 导出管理器
 * 提供统一的导出接口，管理所有导出服务
 */
class ExportManager {
  constructor() {
    this.services = {
      pdf: new PdfExportService(),
      png: new ImageExportService(),
      jpg: new ImageExportService()
    };
  }

  /**
   * 导出内容
   * @param {string} content HTML内容
   * @param {string} format 导出格式（pdf, png, jpg）
   * @param {Object} options 导出选项
   * @returns {Promise<Buffer>} 导出的文件Buffer
   */
  async export(content, format, options = {}) {
    const service = this.services[format.toLowerCase()];
    if (!service) {
      throw new Error(`不支持的导出格式: ${format}`);
    }

    if (format.toLowerCase() === 'pdf') {
      return service.exportToPDF(content, options);
    } else if (format.toLowerCase() === 'png') {
      return service.exportToPNG(content, options);
    } else if (format.toLowerCase() === 'jpg' || format.toLowerCase() === 'jpeg') {
      return service.exportToJPG(content, options);
    } else {
      throw new Error(`不支持的导出格式: ${format}`);
    }
  }

  /**
   * 获取支持的格式列表
   * @returns {Array<string>} 支持的格式列表
   */
  getSupportedFormats() {
    return Object.keys(this.services);
  }

  /**
   * 获取指定格式的导出选项模板
   * @param {string} format 格式
   * @returns {Object} 选项模板
   */
  getOptionsTemplate(format) {
    const service = this.services[format.toLowerCase()];
    if (!service) {
      throw new Error(`不支持的导出格式: ${format}`);
    }
    return service.getOptionsTemplate();
  }

  /**
   * 获取指定格式的预设配置
   * @param {string} format 格式
   * @returns {Object} 预设配置
   */
  getPresets(format) {
    const service = this.services[format.toLowerCase()];
    if (!service) {
      throw new Error(`不支持的导出格式: ${format}`);
    }
    
    if (service.getPresetSizes) {
      return service.getPresetSizes();
    }
    
    return {};
  }
}

// 创建单例实例
const exportManager = new ExportManager();

module.exports = exportManager;