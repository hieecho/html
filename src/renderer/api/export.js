import axios from 'axios';

/**
 * 导出API服务
 */
export const exportApi = {
  /**
   * 导出HTML内容为指定格式
   * @param {string} content HTML内容
   * @param {string} format 导出格式
   * @param {Object} options 导出选项
   * @returns {Promise<Blob>} 文件Blob
   */
  async exportContent(content, format, options = {}) {
    try {
      const response = await axios.post('/api/export', {
        content,
        format,
        options
      }, {
        responseType: 'blob'
      });

      return new Blob([response.data], { 
        type: response.headers['content-type'] 
      });
    } catch (error) {
      console.error('导出失败:', error);
      throw new Error(error.response?.data?.message || '导出失败');
    }
  },

  /**
   * 获取支持的导出格式
   * @returns {Promise<Array>} 格式列表
   */
  async getSupportedFormats() {
    try {
      const response = await axios.get('/api/export/formats');
      return response.data.data;
    } catch (error) {
      console.error('获取格式列表失败:', error);
      throw new Error('获取格式列表失败');
    }
  },

  /**
   * 获取导出选项模板
   * @param {string} format 格式
   * @returns {Promise<Object>} 选项模板
   */
  async getOptionsTemplate(format) {
    try {
      const response = await axios.get(`/api/export/options/${format}`);
      return response.data.data;
    } catch (error) {
      console.error('获取选项模板失败:', error);
      throw new Error('获取选项模板失败');
    }
  },

  /**
   * 测试导出功能
   * @param {string} format 格式
   * @returns {Promise<Blob>} 测试文件
   */
  async testExport(format) {
    try {
      const response = await axios.post('/api/export/test', {
        format
      }, {
        responseType: 'blob'
      });

      return new Blob([response.data], { 
        type: response.headers['content-type'] 
      });
    } catch (error) {
      console.error('测试导出失败:', error);
      throw new Error('测试导出失败');
    }
  }
};