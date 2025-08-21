import { defineStore } from 'pinia';
import { ref } from 'vue';
import { htmlApi, folderApi, tagApi } from '../api/client';

export interface HtmlItem {
  id: string;
  title: string;
  content: string;
  contentType: 'code' | 'url' | 'snapshot';
  originalUrl?: string;
  folderId?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Folder {
  id: string;
  name: string;
  parentId?: string;
  children?: Folder[];
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export const useHtmlStore = defineStore('html', () => {
  const htmls = ref<HtmlItem[]>([]);
  const currentHtml = ref<HtmlItem | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const loadHtmls = async () => {
    loading.value = true;
    error.value = null;
    try {
      htmls.value = await htmlApi.getAll();
    } catch (err) {
      error.value = '加载HTML列表失败';
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const createHtml = async (data: any) => {
    loading.value = true;
    error.value = null;
    try {
      const newHtml = await htmlApi.create(data);
      htmls.value.unshift(newHtml);
      return newHtml;
    } catch (err) {
      error.value = '创建HTML失败';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateHtml = async (id: string, data: any) => {
    loading.value = true;
    error.value = null;
    try {
      const updatedHtml = await htmlApi.update(id, data);
      const index = htmls.value.findIndex(item => item.id === id);
      if (index !== -1) {
        htmls.value[index] = updatedHtml;
      }
      return updatedHtml;
    } catch (err) {
      error.value = '更新HTML失败';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteHtml = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      await htmlApi.delete(id);
      htmls.value = htmls.value.filter(item => item.id !== id);
    } catch (err) {
      error.value = '删除HTML失败';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const searchHtmls = async (query: string) => {
    loading.value = true;
    error.value = null;
    try {
      const results = await htmlApi.search(query);
      return results;
    } catch (err) {
      error.value = '搜索失败';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const setCurrentHtml = (html: HtmlItem | null) => {
    currentHtml.value = html;
  };

  const getHtmlById = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const html = await htmlApi.getById(id);
      return html;
    } catch (err) {
      error.value = '获取HTML详情失败';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const importFromUrl = async (url: string) => {
    loading.value = true;
    error.value = null;
    try {
      const newHtml = await htmlApi.importFromUrl(url);
      htmls.value.unshift(newHtml);
      return newHtml;
    } catch (err) {
      error.value = 'URL导入失败';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    htmls,
    currentHtml,
    loading,
    error,
    loadHtmls,
    createHtml,
    updateHtml,
    deleteHtml,
    searchHtmls,
    setCurrentHtml,
    getHtmlById,
    importFromUrl,
  };
});

export const useFolderStore = defineStore('folder', () => {
  const folders = ref<Folder[]>([]);
  const folderTree = ref<Folder[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const loadFolders = async () => {
    loading.value = true;
    error.value = null;
    try {
      folders.value = await folderApi.getAll();
      folderTree.value = await folderApi.getTree();
    } catch (err) {
      error.value = '加载文件夹失败';
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const createFolder = async (data: any) => {
    loading.value = true;
    error.value = null;
    try {
      const newFolder = await folderApi.create(data);
      folders.value.push(newFolder);
      await loadFolders(); // 重新加载树结构
      return newFolder;
    } catch (err) {
      error.value = '创建文件夹失败';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateFolder = async (id: string, data: any) => {
    loading.value = true;
    error.value = null;
    try {
      const updatedFolder = await folderApi.update(id, data);
      const index = folders.value.findIndex(folder => folder.id === id);
      if (index !== -1) {
        folders.value[index] = updatedFolder;
      }
      await loadFolders(); // 重新加载树结构
      return updatedFolder;
    } catch (err) {
      error.value = '更新文件夹失败';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteFolder = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      await folderApi.delete(id);
      folders.value = folders.value.filter(folder => folder.id !== id);
      await loadFolders(); // 重新加载树结构
    } catch (err) {
      error.value = '删除文件夹失败';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    folders,
    folderTree,
    loading,
    error,
    loadFolders,
    createFolder,
    updateFolder,
    deleteFolder,
  };
});

export const useTagStore = defineStore('tag', () => {
  const tags = ref<Tag[]>([]);
  const popularTags = ref<Tag[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const loadTags = async () => {
    loading.value = true;
    error.value = null;
    try {
      tags.value = await tagApi.getAll();
      popularTags.value = await tagApi.getPopular();
    } catch (err) {
      error.value = '加载标签失败';
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const createTag = async (data: any) => {
    loading.value = true;
    error.value = null;
    try {
      const newTag = await tagApi.create(data);
      tags.value.push(newTag);
      return newTag;
    } catch (err) {
      error.value = '创建标签失败';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    tags,
    popularTags,
    loading,
    error,
    loadTags,
    createTag,
  };
});