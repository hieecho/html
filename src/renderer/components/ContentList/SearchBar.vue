<template>
  <div class="search-bar">
    <el-input
      v-model="searchQuery"
      placeholder="搜索HTML内容..."
      :prefix-icon="Search"
      clearable
      @input="onSearch"
      @clear="onClear"
    />
    
    <el-select
      v-model="filterTag"
      placeholder="筛选标签"
      clearable
      style="width: 120px; margin-left: 8px"
    >
      <el-option
        v-for="tag in availableTags"
        :key="tag"
        :label="tag"
        :value="tag"
      />
    </el-select>
    
    <el-select
      v-model="filterFolder"
      placeholder="筛选文件夹"
      clearable
      style="width: 120px; margin-left: 8px"
    >
      <el-option label="全部" value="" />
      <el-option
        v-for="folder in availableFolders"
        :key="folder.id"
        :label="folder.name"
        :value="folder.id"
      />
    </el-select>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { Search } from '@element-plus/icons-vue';
import { useHtmlStore, useTagStore, useFolderStore } from '../../store';

const emit = defineEmits(['search', 'clear']);

const htmlStore = useHtmlStore();
const tagStore = useTagStore();
const folderStore = useFolderStore();

// 确保数据已加载
onMounted(async () => {
  if (htmlStore.htmls.length === 0) {
    await htmlStore.loadHtmls();
  }
  if (tagStore.tags.length === 0) {
    await tagStore.loadTags();
  }
  await folderStore.loadFolders();
});
const searchQuery = ref('');
const filterTag = ref('');
const filterFolder = ref('');

const availableTags = computed(() => {
  const tags = new Set<string>();
  
  // 从tagStore获取所有标签
  tagStore.tags.forEach(tag => {
    tags.add(tag.name);
  });
  
  // 从HTML数据中获取实际使用的标签（作为补充）
  htmlStore.htmls.forEach(item => {
    item.tags?.forEach(tag => tags.add(tag));
  });
  
  return Array.from(tags).sort();
});



const availableFolders = computed(() => {
  return folderStore.folders.sort((a, b) => a.name.localeCompare(b.name));
});



const onSearch = () => {
  emit('search', {
    query: searchQuery.value,
    tag: filterTag.value,
    folder: filterFolder.value
  });
};

const onClear = () => {
  searchQuery.value = '';
  filterTag.value = '';
  filterFolder.value = '';
  emit('clear');
};

// 监听筛选条件变化
watch([filterTag, filterFolder], onSearch);

// 暴露方法给父组件
const setFilters = (filters: any) => {
  searchQuery.value = filters.query || '';
  filterTag.value = filters.tag || '';
  filterFolder.value = filters.folder || '';
};

defineExpose({
  setFilters
});
</script>

<style scoped>
.search-bar {
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
}
</style>