import { db } from '../database/db.js';
import { Tag, CreateTagDto } from '../models/TagModel.js';

export class TagService {
  async getAllTags(): Promise<Tag[]> {
    return await db.getTags();
  }

  async createTag(data: CreateTagDto): Promise<Tag> {
    return await db.createTag(data);
  }

  async getPopularTags(): Promise<Tag[]> {
    const tags = await db.getTags();
    return tags.slice(0, 10); // 返回前10个标签
  }
}

export const tagService = new TagService();