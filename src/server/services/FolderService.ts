import { db } from '../database/db.js';
import { Folder, CreateFolderDto } from '../models/FolderModel.js';

export class FolderService {
  async getAllFolders(): Promise<Folder[]> {
    return await db.getFolders();
  }

  async createFolder(data: CreateFolderDto): Promise<Folder> {
    return await db.createFolder(data);
  }

  async getFolderTree(): Promise<any[]> {
    const folders = await db.getFolders();
    return this.buildTree(folders);
  }

  private buildTree(folders: Folder[]): any[] {
    const folderMap = new Map<string, any>();
    const rootFolders: any[] = [];

    // 创建映射
    folders.forEach(folder => {
      folderMap.set(folder.id, { ...folder, children: [] });
    });

    // 构建树结构
    folders.forEach(folder => {
      const node = folderMap.get(folder.id);
      if (folder.parentId && folderMap.has(folder.parentId)) {
        folderMap.get(folder.parentId).children.push(node);
      } else {
        rootFolders.push(node);
      }
    });

    return rootFolders;
  }
}

export const folderService = new FolderService();