import { db } from '../database/db.js';
import { HtmlItem, CreateHtmlDto, UpdateHtmlDto } from '../models/HtmlModel.js';

export class HtmlService {
  async getAllHtmls(): Promise<HtmlItem[]> {
    return await db.getHtmls();
  }

  async getHtmlById(id: string): Promise<HtmlItem | null> {
    return await db.getHtmlById(id);
  }

  async createHtml(data: CreateHtmlDto): Promise<HtmlItem> {
    return await db.createHtml({
      ...data,
      tags: data.tags || []
    });
  }

  async updateHtml(id: string, data: UpdateHtmlDto): Promise<HtmlItem | null> {
    return await db.updateHtml(id, data);
  }

  async deleteHtml(id: string): Promise<boolean> {
    return await db.deleteHtml(id);
  }

  async searchHtmls(query: string): Promise<HtmlItem[]> {
    return await db.searchHtmls(query);
  }

  async importFromUrl(url: string): Promise<HtmlItem> {
    // 模拟从URL获取内容，实际项目中会使用puppeteer
    const mockContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>从 ${url} 导入的页面</title>
        </head>
        <body>
          <h1>这是从 ${url} 获取的页面内容</h1>
          <p>实际项目中会使用puppeteer来抓取完整页面。</p>
        </body>
      </html>
    `;

    return await db.createHtml({
      title: `导入页面 - ${new URL(url).hostname}`,
      content: mockContent,
      contentType: 'snapshot',
      originalUrl: url,
      tags: ['imported', 'web-page']
    });
  }
}

export const htmlService = new HtmlService();