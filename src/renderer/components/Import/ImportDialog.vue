<template>
  <el-dialog v-model="visible" title="导入HTML内容" width="600px" :close-on-click-modal="false">
    <el-tabs v-model="activeTab" type="card">
      <!-- URL导入 -->
      <el-tab-pane label="URL导入" name="url">
        <el-form :model="urlForm" label-width="80px">
          <el-form-item label="网页URL" prop="url">
            <el-input
              v-model="urlForm.url"
              placeholder="请输入网页URL"
              clearable
            >
              <template #prepend>
                <el-icon><Link /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="标题">
            <el-input
              v-model="urlForm.title"
              placeholder="标题（可选）"
            />
          </el-form-item>
          <el-form-item label="标签">
            <el-select
              v-model="urlForm.tags"
              multiple
              filterable
              allow-create
              placeholder="标签"
            />
          </el-form-item>
          <el-form-item label="文件夹">
            <el-tree-select
              v-model="urlForm.folderId"
              :data="folderTree"
              placeholder="请选择文件夹"
              clearable
              :render-after-expand="false"
            />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 文件导入 -->
      <el-tab-pane label="文件导入" name="file">
        <el-upload
          class="upload-area"
          drag
          multiple
          :auto-upload="false"
          :on-change="handleFileChange"
          :on-remove="handleFileRemove"
          accept=".html,.htm,.txt"
          :file-list="fileList"
        >
          <el-icon class="upload-icon"><Upload /></el-icon>
          <div class="upload-text">
            <div class="upload-title">拖拽文件到此处或点击上传</div>
            <div class="upload-subtitle">支持 .html, .htm, .txt 格式文件</div>
          </div>
        </el-upload>
        
        <el-form :model="fileForm" label-width="80px" style="margin-top: 16px">
          <el-form-item label="标签">
            <el-select
              v-model="fileForm.tags"
              multiple
              filterable
              allow-create
              placeholder="标签"
            />
          </el-form-item>
          <el-form-item label="文件夹">
            <el-tree-select
              v-model="fileForm.folderId"
              :data="folderTree"
              placeholder="请选择文件夹"
              clearable
              :render-after-expand="false"
            />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 代码粘贴 -->
      <el-tab-pane label="代码粘贴" name="paste">
        <el-form :model="pasteForm" label-width="80px">
          <el-form-item label="标题" prop="title">
            <el-input
              v-model="pasteForm.title"
              placeholder="请输入标题"
            />
          </el-form-item>
          <el-form-item label="代码">
            <el-input
              v-model="pasteForm.content"
              type="textarea"
              :rows="10"
              placeholder="请粘贴HTML代码..."
            />
          </el-form-item>
          <el-form-item label="类型">
            <el-select v-model="pasteForm.contentType" placeholder="请选择类型">
              <el-option label="网页源码" value="code" />
              <el-option label="网页链接" value="url" />
              <el-option label="网页快照" value="snapshot" />
            </el-select>
          </el-form-item>
          <el-form-item label="标签">
            <el-select
              v-model="pasteForm.tags"
              multiple
              filterable
              allow-create
              placeholder="标签"
            />
          </el-form-item>
          <el-form-item label="文件夹">
            <el-tree-select
              v-model="pasteForm.folderId"
              :data="folderTree"
              placeholder="请选择文件夹"
              clearable
              :render-after-expand="false"
            />
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleImport" :loading="importing">
        导入
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Link, Upload } from '@element-plus/icons-vue';
import { useHtmlStore, useFolderStore } from '../../store';

interface Props {
  modelValue: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'imported'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const htmlStore = useHtmlStore();
const folderStore = useFolderStore();

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const activeTab = ref('url');
const importing = ref(false);
const fileList = ref<any[]>([]);

const urlForm = ref({
  url: '',
  title: '',
  tags: [] as string[],
  folderId: null as string | null
});

const fileForm = ref({
  tags: [] as string[],
  folderId: null as string | null
});

const pasteForm = ref({
  title: '',
  content: '',
  contentType: 'code' as 'code' | 'url' | 'snapshot',
  tags: [] as string[],
  folderId: null as string | null
});

const folderTree = computed(() => {
  const tree = folderStore.folderTree;
  if (!tree || tree.length === 0) {
    return [{ id: 'root', name: '根目录', children: [] }];
  }
  return tree;
});

const handleFileChange = (file: any, files: any[]) => {
  fileList.value = files;
};

const handleFileRemove = (file: any, files: any[]) => {
  fileList.value = files;
};

const handleCancel = () => {
  visible.value = false;
  resetForms();
};

const resetForms = () => {
  urlForm.value = {
    url: '',
    title: '',
    tags: [],
    folderId: null as string | null
  };
  fileForm.value = {
    tags: [],
    folderId: null as string | null
  };
  pasteForm.value = {
    title: '',
    content: '',
    contentType: 'code',
    tags: [],
    folderId: null as string | null
  };
  fileList.value = [];
};

const handleImport = async () => {
  importing.value = true;
  
  try {
    console.log('开始导入，当前标签:', activeTab.value);
    switch (activeTab.value) {
      case 'url':
        await importFromUrl();
        break;
      case 'file':
        await importFromFiles();
        break;
      case 'paste':
        await importFromPaste();
        break;
    }
    
    console.log('导入成功，刷新数据...');
    emit('imported');
    visible.value = false;
    resetForms();
    
    // 重新加载数据
    await htmlStore.loadHtmls();
    console.log('数据已重新加载');
  } catch (error) {
    console.error('导入失败:', error);
    ElMessage.error('导入失败: ' + (error as Error).message);
  } finally {
    importing.value = false;
  }
};

const importFromUrl = async () => {
  if (!urlForm.value.url.trim()) {
    ElMessage.warning('请输入有效的URL');
    return;
  }

  try {
    // 获取网页标题
    let title = urlForm.value.title;
    if (!title) {
      try {
        const response = await fetch(urlForm.value.url);
        const text = await response.text();
        const match = text.match(/<title[^>]*>([^<]+)<\/title>/i);
        title = match ? match[1].trim() : new URL(urlForm.value.url).hostname;
      } catch {
        title = new URL(urlForm.value.url).hostname;
      }
    }

    await htmlStore.createHtml({
      title,
      contentType: 'url',
      content: urlForm.value.url,
      originalUrl: urlForm.value.url,
      tags: urlForm.value.tags,
      folderId: urlForm.value.folderId || null
    });
    
    ElMessage.success('URL导入成功');
  } catch (error) {
    ElMessage.error('URL导入失败');
    throw error;
  }
};

const importFromFiles = async () => {
  if (fileList.value.length === 0) {
    ElMessage.warning('请选择文件');
    return;
  }

  for (const file of fileList.value) {
    try {
      const content = await readFileContent(file.raw);
      const title = file.name.replace(/\.[^/.]+$/, '');
      
      await htmlStore.createHtml({
        title,
        contentType: 'code',
        content,
        tags: fileForm.value.tags,
        folderId: fileForm.value.folderId || null
      });
    } catch (error) {
      console.error(`文件 ${file.name} 导入失败:`, error);
      ElMessage.error(`文件 ${file.name} 导入失败`);
    }
  }
  
  ElMessage.success('文件导入成功');
};

const importFromPaste = async () => {
  if (!pasteForm.value.title.trim()) {
    ElMessage.warning('请输入标题');
    return;
  }
  
  if (!pasteForm.value.content.trim()) {
    ElMessage.warning('请输入内容');
    return;
  }

  try {
    await htmlStore.createHtml({
      title: pasteForm.value.title,
      contentType: pasteForm.value.contentType,
      content: pasteForm.value.content,
      tags: pasteForm.value.tags,
      folderId: pasteForm.value.folderId || null
    });
    
    ElMessage.success('内容导入成功');
  } catch (error) {
    ElMessage.error('内容导入失败');
    throw error;
  }
};

const readFileContent = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

onMounted(() => {
  folderStore.loadFolders();
});
</script>

<style scoped>
.upload-area {
  width: 100%;
}

.upload-icon {
  font-size: 48px;
  color: #409eff;
}

.upload-text {
  text-align: center;
}

.upload-title {
  font-size: 16px;
  color: #303133;
  margin-bottom: 8px;
}

.upload-subtitle {
  font-size: 14px;
  color: #909399;
}
</style>