import { promises as fs } from 'fs';
import { join } from 'path';

interface DatabaseSchema {
  htmls: any[];
  folders: any[];
  tags: any[];
}

class JsonDatabase {
  private dbPath: string;
  private data: DatabaseSchema;

  constructor(dbPath: string) {
    this.dbPath = dbPath;
    this.data = {
      htmls: [],
      folders: [],
      tags: []
    };
  }

  async init() {
    try {
      await fs.access(this.dbPath);
      const fileContent = await fs.readFile(this.dbPath, 'utf-8');
      this.data = JSON.parse(fileContent);
    } catch (error) {
      // 文件不存在，创建初始数据
      await this.save();
    }
  }

  private async save() {
    await fs.writeFile(this.dbPath, JSON.stringify(this.data, null, 2));
  }

  // HTML操作
  async getHtmls() {
    return this.data.htmls;
  }

  async getHtmlById(id: string) {
    return this.data.htmls.find(item => item.id === id);
  }

  async createHtml(htmlData: any) {
    const newHtml = {
      id: Date.now().toString(),
      ...htmlData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.htmls.push(newHtml);
    await this.save();
    return newHtml;
  }

  async updateHtml(id: string, updates: any) {
    const index = this.data.htmls.findIndex(item => item.id === id);
    if (index === -1) return null;
    
    this.data.htmls[index] = {
      ...this.data.htmls[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    await this.save();
    return this.data.htmls[index];
  }

  async deleteHtml(id: string) {
    const index = this.data.htmls.findIndex(item => item.id === id);
    if (index === -1) return false;
    
    this.data.htmls.splice(index, 1);
    await this.save();
    return true;
  }

  async searchHtmls(query: string) {
    const lowercaseQuery = query.toLowerCase();
    return this.data.htmls.filter(item =>
      item.title.toLowerCase().includes(lowercaseQuery) ||
      item.content.toLowerCase().includes(lowercaseQuery) ||
      (item.tags && item.tags.some((tag: string) => tag.toLowerCase().includes(lowercaseQuery)))
    );
  }

  // 文件夹操作
  async getFolders() {
    return this.data.folders;
  }

  async createFolder(folderData: any) {
    const newFolder = {
      id: Date.now().toString(),
      ...folderData,
      createdAt: new Date().toISOString()
    };
    this.data.folders.push(newFolder);
    await this.save();
    return newFolder;
  }

  // 标签操作
  async getTags() {
    return this.data.tags;
  }

  async createTag(tagData: any) {
    const newTag = {
      id: Date.now().toString(),
      ...tagData
    };
    this.data.tags.push(newTag);
    await this.save();
    return newTag;
  }
}

export const db = new JsonDatabase(join(process.cwd(), 'data', 'database.json'));