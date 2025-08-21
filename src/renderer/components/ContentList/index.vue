<template>
  <div class="content-list">
    <SearchBar 
      @search="handleSearch" 
      @clear="handleClear" 
    />
    
    <div class="header">
      <el-button-group>
        <el-button type="primary" size="small" @click="showAddDialog = true">
          <el-icon><Plus /></el-icon>
          新建
        </el-button>
        <el-button size="small" @click="showImportDialog = true">
          <el-icon><Upload /></el-icon>
          导入
        </el-button>
        <el-button size="small" @click="refreshData"
          :loading="htmlStore.loading"
        >
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </el-button-group>
      
      <div class="stats">
        <span>共 {{ filteredItems.length }} 条记录</span>
      </div>
    </div>
    
    <div v-loading="htmlStore.loading" class="list-content">
      <div v-if="filteredItems.length === 0" class="empty-state">
        <el-empty description="暂无数据" />
      </div>
      
      <el-card
        v-for="item in filteredItems"
        :key="item.id"
        :class="{ active: selectedId === item.id }"
        class="item-card"
        @click="selectItem(item)"
      >
        <template #header>
          <div class="item-header">
            <span class="title">{{ item.title }}</span>
            <span class="type-badge" :class="item.contentType">
              {{ getTypeLabel(item.contentType) }}
            </span>
            <div class="item-actions">
              <el-button
                type="primary"
                size="small"
                text
                @click.stop="editItem(item)"
              >
                编辑
              </el-button>
              <el-popconfirm
                title="确定要删除这个项目吗？"
                @confirm="deleteItem(item)"
              >
                <template #reference>
                  <el-button
                    type="danger"
                    size="small"
                    text
                    @click.stop
                  >
                    删除
                  </el-button>
                </template>
              </el-popconfirm>
            </div>
          </div>
        </template>
        
        <div class="item-content">
          <div class="preview-text">{{ getPreviewText(item.content) }}</div>
          <div class="meta-info">
            <span class="date">{{ formatDate(item.createdAt) }}</span>
            <div class="tags">
              <el-tag
                v-for="tag in item.tags"
                :key="tag"
                size="small"
                type="info"
                closable
                @close="removeTag(item, tag)"
              >
                {{ tag }}
              </el-tag>
            </div>
          </div>
        </div>
      </el-card>
    </div>
    
    <!-- 添加对话框 -->
    <el-dialog v-model="showAddDialog" title="新建HTML项目" width="600px">
      <el-form :model="formData" label-width="80px" ref="addFormRef">
        <el-form-item label="标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="类型" prop="contentType">
          <el-select v-model="formData.contentType" placeholder="请选择类型">
            <el-option label="网页源码" value="code" />
            <el-option label="网页链接" value="url" />
            <el-option label="网页快照" value="snapshot" />
          </el-select>
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="formData.content"
            type="textarea"
            :rows="8"
            placeholder="请输入HTML代码或URL"
          />
        </el-form-item>
        <el-form-item label="标签">
          <el-select
            v-model="formData.tags"
            multiple
            filterable
            allow-create
            placeholder="请输入标签"
          >
            <el-option
              v-for="tag in availableTags"
              :key="tag"
              :label="tag"
              :value="tag"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="addItem" :loading="htmlStore.loading">确定</el-button>
      </template>
    </el-dialog>
    
    <!-- 编辑对话框 -->
    <EditDialog
      v-model="showEditDialog"
      :html-item="editingItem"
      @save="handleSave"
    />

    <!-- 导入对话框 -->
    <ImportDialog
      v-model="showImportDialog"
      @imported="refreshData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { Plus, Refresh, Upload } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { useHtmlStore } from '../../store';
import SearchBar from './SearchBar.vue';
import EditDialog from './EditDialog.vue';
import ImportDialog from '../Import/ImportDialog.vue';

const htmlStore = useHtmlStore();
const showAddDialog = ref(false);

const addFormRef = ref();
const formData = ref({
  title: '',
  contentType: 'code' as 'code' | 'url' | 'snapshot',
  content: '',
  tags: [] as string[],
  folderId: '1'
});

const selectedId = ref('');
const showEditDialog = ref(false);
const editingItem = ref(null);
const showImportDialog = ref(false);
const searchQuery = ref('');
const filterType = ref('');
const filterTag = ref('');

// 计算属性，格式化显示
const htmlItems = computed(() => htmlStore.htmls);
const filteredItems = computed(() => {
  let items = htmlStore.htmls;
  
  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    items = items.filter(item =>
      item.title.toLowerCase().includes(query) ||
      item.content.toLowerCase().includes(query) ||
      (item.tags && item.tags.some(tag => tag.toLowerCase().includes(query)))
    );
  }
  
  // 类型过滤
  if (filterType.value) {
    items = items.filter(item => item.contentType === filterType.value);
  }
  
  // 标签过滤
  if (filterTag.value) {
    items = items.filter(item =>
      item.tags && item.tags.includes(filterTag.value)
    );
  }
  
  return items;
});

const availableTags = computed(() => {
  const tags = new Set<string>();
  htmlStore.htmls.forEach(item => {
    item.tags?.forEach(tag => tags.add(tag));
  });
  return Array.from(tags);
});

const selectItem = (item: any) => {
  selectedId.value = item.id;
  htmlStore.setCurrentHtml(item);
};

const addItem = async () => {
  try {
    console.log('创建HTML数据:', formData.value);
    
    // 验证数据
    if (!formData.value.title.trim()) {
      ElMessage.error('标题不能为空');
      return;
    }
    if (!formData.value.content.trim()) {
      ElMessage.error('内容不能为空');
      return;
    }

    const payload = {
      title: formData.value.title.trim(),
      content: formData.value.content.trim(),
      contentType: formData.value.contentType,
      tags: formData.value.tags || [],
      folderId: formData.value.folderId === '1' ? null : formData.value.folderId
    };
    
    console.log('发送的数据:', payload);
    const newItem = await htmlStore.createHtml(payload);
    
    showAddDialog.value = false;
    ElMessage.success('创建成功');
    
    // 重置表单
    formData.value = {
      title: '',
      contentType: 'code',
      content: '',
      tags: [],
      folderId: '1'
    };
  } catch (error) {
    console.error('创建失败:', error);
    ElMessage.error('创建失败: ' + (error.response?.data?.error || error.message));
  }
};

const editItem = (item: any) => {
  editingItem.value = item;
  showEditDialog.value = true;
};

const deleteItem = async (item: any) => {
  try {
    await htmlStore.deleteHtml(item.id);
    ElMessage.success('删除成功');
    
    // 如果删除的是当前选中的，清空选择
    if (htmlStore.currentHtml?.id === item.id) {
      htmlStore.setCurrentHtml(null);
      selectedId.value = '';
    }
  } catch (error) {
    console.error('删除失败:', error);
    ElMessage.error('删除失败');
  }
};

const refreshData = async () => {
  await htmlStore.loadHtmls();
  ElMessage.success('数据已刷新');
};

const handleSearch = (filters: any) => {
  searchQuery.value = filters.query || '';
  filterType.value = filters.type || '';
  filterTag.value = filters.tag || '';
};

const handleClear = () => {
  searchQuery.value = '';
  filterType.value = '';
  filterTag.value = '';
};

const handleSave = () => {
  refreshData();
};

const removeTag = async (item: any, tag: string) => {
  const updatedTags = item.tags.filter((t: string) => t !== tag);
  try {
    await htmlStore.updateHtml(item.id, { tags: updatedTags });
    ElMessage.success('标签已移除');
  } catch (error) {
    console.error('移除标签失败:', error);
    ElMessage.error('移除标签失败');
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN');
};

const getTypeLabel = (type: string) => {
  const typeMap = {
    code: '网页源码',
    url: '网页链接',
    snapshot: '网页快照'
  };
  return typeMap[type as keyof typeof typeMap] || type;
};

const getPreviewText = (content: string) => {
  const maxLength = 100;
  const text = content.replace(/<[^>]*>/g, '').trim();
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

onMounted(async () => {
  await htmlStore.loadHtmls();
  if (htmlStore.htmls.length > 0) {
    selectItem(htmlStore.htmls[0]);
  }
});
</script>

<style scoped>
.content-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.header {
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.list-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.item-card {
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.item-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.item-card.active {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-weight: 500;
  font-size: 14px;
}

.type-badge {
  font-size: 12px;
  color: #909399;
  background-color: #f4f4f5;
  padding: 2px 8px;
  border-radius: 10px;
}

.item-content {
  padding-top: 8px;
}

.meta-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #909399;
}

.tags {
  display: flex;
  gap: 4px;
}
</style>

<style scoped>
.content-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.stats {
  color: #909399;
  font-size: 14px;
}

.list-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.item-card {
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.item-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.item-card.active {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.title {
  font-weight: 500;
  font-size: 14px;
  flex: 1;
  margin-right: 8px;
}

.type-badge {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  margin-right: 8px;
}

.type-badge.code {
  background-color: #e1f3d8;
  color: #67c23a;
}

.type-badge.url {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.type-badge.snapshot {
  background-color: #f0f9ff;
  color: #409eff;
}

.item-actions {
  display: flex;
  gap: 4px;
}

.item-content {
  padding-top: 8px;
}

.preview-text {
  color: #606266;
  font-size: 13px;
  line-height: 1.4;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.meta-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #909399;
}

.date {
  font-size: 11px;
}

.tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
</style>