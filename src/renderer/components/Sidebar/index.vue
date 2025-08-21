<template>
  <div class="sidebar">
    <div class="search-box">
      <el-input
        v-model="searchText"
        placeholder="搜索HTML内容"
        :prefix-icon="Search"
        size="small"
      />
    </div>
    
    <div class="folder-section">
      <div class="folder-header">
        <h4>文件夹</h4>
        <el-button
          type="primary"
          size="small"
          :icon="Plus"
          @click="showCreateFolderDialog"
        >
          新建
        </el-button>
      </div>
      <el-tree
        :data="folderStore.folderTree"
        :props="defaultProps"
        node-key="id"
        default-expand-all
        @node-click="handleNodeClick"
        @node-contextmenu="handleContextMenu"
      >
        <template #default="{ node, data }">
          <span class="custom-tree-node">
            <span>{{ node.label }}</span>
            <span class="node-actions" v-if="data.id !== 1">
              <el-button
                size="small"
                type="text"
                :icon="Edit"
                @click.stop="editFolder(data)"
              />
              <el-button
                size="small"
                type="text"
                :icon="Delete"
                @click.stop="deleteFolder(data)"
              />
            </span>
          </span>
        </template>
      </el-tree>
    </div>
    
    <div class="tags-section">
      <h4>标签</h4>
      <div class="tags-cloud">
        <el-tag
          v-for="tag in tags"
          :key="tag.id"
          :color="tag.color"
          class="tag-item"
          @click="selectTag(tag)"
        >
          {{ tag.name }}
        </el-tag>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Search, Plus, Edit, Delete } from '@element-plus/icons-vue';
import { useFolderStore, useTagStore } from '../../store';
import { ElMessage, ElMessageBox } from 'element-plus';

const searchText = ref('');
const folderStore = useFolderStore();
const tagStore = useTagStore();

const folderData = ref([
  {
    id: 1,
    label: '全部内容',
    children: []
  }
]);

const tags = ref([
  { id: 1, name: '前端', color: '#409eff' },
  { id: 2, name: '教程', color: '#67c23a' },
  { id: 3, name: '工具', color: '#e6a23c' }
]);

const defaultProps = {
  children: 'children',
  label: 'label'
};

onMounted(async () => {
  await folderStore.loadFolders();
  await tagStore.loadTags();
  
  // 更新文件夹树数据
  folderData.value = folderStore.folderTree;
  tags.value = tagStore.tags;
});

const handleNodeClick = (data: any) => {
  console.log('点击文件夹:', data);
};

const selectTag = (tag: any) => {
  console.log('选择标签:', tag);
};

const showCreateFolderDialog = async () => {
  try {
    const { value: folderName } = await ElMessageBox.prompt(
      '请输入文件夹名称',
      '新建文件夹',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^[^\s].*[^\s]$/,
        inputErrorMessage: '文件夹名称不能为空'
      }
    );

    console.log('创建文件夹:', folderName);
    const newFolder = await folderStore.createFolder({ name: folderName.trim() });
    console.log('文件夹创建成功:', newFolder);
    ElMessage.success('文件夹创建成功');
    
    // 刷新文件夹列表
    await folderStore.loadFolders();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('创建文件夹失败:', error);
      ElMessage.error('创建文件夹失败: ' + (error.response?.data?.error || error.message));
    }
  }
};

const editFolder = async (folder: any) => {
  try {
    const { value: newName } = await ElMessageBox.prompt(
      '请输入新的文件夹名称',
      '编辑文件夹',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: folder.label || folder.name,
        inputPattern: /^[^\s].*[^\s]$/,
        inputErrorMessage: '文件夹名称不能为空'
      }
    );

    await folderStore.updateFolder(folder.id, { name: newName });
    ElMessage.success('文件夹名称已更新');
  } catch (error) {
    if (error !== 'cancel') {
      console.error('更新文件夹失败:', error);
      ElMessage.error('更新文件夹失败');
    }
  }
};

const deleteFolder = async (folder: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除文件夹 "${folder.label || folder.name}" 吗？此操作不可撤销。`,
      '删除文件夹',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    await folderStore.deleteFolder(folder.id);
    ElMessage.success('文件夹已删除');
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除文件夹失败:', error);
      ElMessage.error('删除文件夹失败');
    }
  }
};

const handleContextMenu = (event: MouseEvent, data: any, node: any, component: any) => {
  event.preventDefault();
  // 右键菜单逻辑
};
</script>

<style scoped>
.sidebar {
  padding: 16px;
  height: 100%;
}

.search-box {
  margin-bottom: 16px;
}

.folder-section,
.tags-section {
  margin-bottom: 20px;
}

.folder-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.folder-header h4 {
  margin: 0;
  color: #606266;
  font-size: 14px;
  font-weight: 500;
}

.tags-section h4 {
  margin: 0 0 12px 0;
  color: #606266;
  font-size: 14px;
  font-weight: 500;
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}

.node-actions {
  display: none;
  margin-left: 8px;
}

.custom-tree-node:hover .node-actions {
  display: inline-block;
}

.node-actions .el-button {
  padding: 2px 4px;
  font-size: 12px;
}

.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  cursor: pointer;
}
</style>