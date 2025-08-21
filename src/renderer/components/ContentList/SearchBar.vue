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
      v-model="filterType"
      placeholder="筛选类型"
      clearable
      style="width: 120px; margin-left: 8px"
    >
      <el-option label="全部" value="" />
      <el-option label="网页源码" value="code" />
      <el-option label="网页链接" value="url" />
      <el-option label="网页快照" value="snapshot" />
    </el-select>
    
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Search } from '@element-plus/icons-vue';
import { useHtmlStore } from '../../store';

const emit = defineEmits(['search', 'clear']);

const htmlStore = useHtmlStore();
const searchQuery = ref('');
const filterType = ref('');
const filterTag = ref('');

const availableTags = computed(() => {
  const tags = new Set<string>();
  htmlStore.htmls.forEach(item => {
    item.tags?.forEach(tag => tags.add(tag));
  });
  return Array.from(tags);
});

const onSearch = () => {
  emit('search', {
    query: searchQuery.value,
    type: filterType.value,
    tag: filterTag.value
  });
};

const onClear = () => {
  searchQuery.value = '';
  filterType.value = '';
  filterTag.value = '';
  emit('clear');
};

// 监听筛选条件变化
watch([filterType, filterTag], onSearch);
</script>

<style scoped>
.search-bar {
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
}
</style>