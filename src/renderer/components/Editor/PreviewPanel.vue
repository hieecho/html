<template>
  <div class="preview-panel">
    <div class="preview-header">
      <div class="title-section">
        <span class="title">{{ currentHtml?.title || '预览' }}</span>
        <span v-if="currentHtml" class="type-badge" :class="currentHtml.contentType">
          {{ getTypeLabel(currentHtml.contentType) }}
        </span>
      </div>
      
      <div class="actions">
        <el-button-group>
          <el-button size="small" @click="openInBrowser" :disabled="!canOpenInBrowser">
            <el-icon><Link /></el-icon>
            打开链接
          </el-button>
          <el-button size="small" @click="copyCode" :disabled="!currentHtml">
            <el-icon><DocumentCopy /></el-icon>
            复制代码
          </el-button>
          <el-button size="small" @click="saveSnapshot" :disabled="!currentHtml">
            <el-icon><Download /></el-icon>
            保存快照
          </el-button>
          <el-button 
            size="small" 
            @click="showExportDialog = true" 
            :disabled="!currentHtml"
            type="primary"
          >
            <el-icon><Download /></el-icon>
            导出
          </el-button>
        </el-button-group>
      </div>
    </div>

    <div class="preview-content">
      <!-- 网页源码模式 -->
      <div v-if="currentHtml && currentHtml.contentType === 'code'" class="code-preview">
        <CodeEditor ref="codeEditorRef" />
      </div>

      <!-- 网页链接模式 -->
      <div v-else-if="currentHtml && currentHtml.contentType === 'url'" class="url-preview">
        <div class="url-bar">
          <el-input
            v-model="currentHtml.content"
            placeholder="网页链接"
            readonly
          >
            <template #prepend>
              <el-icon><Link /></el-icon>
            </template>
          </el-input>
          <el-button type="primary" @click="openUrl" :loading="loadingUrl">
            访问
          </el-button>
        </div>
        
        <div v-if="urlContent" class="url-content">
          <iframe
            :srcdoc="urlContent"
            frameborder="0"
            class="content-iframe"
          ></iframe>
        </div>
        
        <div v-else class="url-placeholder">
          <el-empty description="点击访问按钮加载网页内容" />
        </div>
      </div>

      <!-- 网页快照模式 -->
      <div v-else-if="currentHtml && currentHtml.contentType === 'snapshot'" class="snapshot-preview">
        <div class="snapshot-content">
          <iframe
            :srcdoc="currentHtml.content"
            frameborder="0"
            class="snapshot-iframe"
          ></iframe>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <el-empty description="请选择或创建一个HTML项目" />
      </div>
    </div>

    <!-- URL访问对话框 -->
    <el-dialog v-model="showUrlDialog" title="访问网页" width="800px" :close-on-click-modal="false">
      <div class="url-dialog-content">
        <iframe
          v-if="urlContent"
          :srcdoc="urlContent"
          frameborder="0"
          class="dialog-iframe"
        ></iframe>
        <div v-else class="loading-content">
          <el-loading text="正在加载网页内容..." />
        </div>
      </div>
    </el-dialog>

    <!-- 导出对话框 -->
    <ExportDialog
      v-model="showExportDialog"
      :content="currentHtml?.content || ''"
      :title="currentHtml?.title || ''"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { Link, DocumentCopy, Download } from '@element-plus/icons-vue';
import { useHtmlStore } from '../../store';
import CodeEditor from './CodeEditor.vue';
import ExportDialog from '../ExportDialog.vue';

const htmlStore = useHtmlStore();
const codeEditorRef = ref();
const urlContent = ref('');
const loadingUrl = ref(false);
const showUrlDialog = ref(false);
const showExportDialog = ref(false);

const currentHtml = computed(() => htmlStore.currentHtml);

const canOpenInBrowser = computed(() => {
  return currentHtml.value?.contentType === 'url' && currentHtml.value?.content;
});

const getTypeLabel = (type: string) => {
  const typeMap = {
    code: '网页源码',
    url: '网页链接',
    snapshot: '网页快照'
  };
  return typeMap[type as keyof typeof typeMap] || type;
};

const openInBrowser = () => {
  if (currentHtml.value?.contentType === 'url') {
    window.open(currentHtml.value.content, '_blank');
  }
};

const copyCode = async () => {
  if (!currentHtml.value) return;
  
  try {
    await navigator.clipboard.writeText(currentHtml.value.content);
    ElMessage.success('代码已复制到剪贴板');
  } catch (error) {
    console.error('复制失败:', error);
    ElMessage.error('复制失败');
  }
};

const saveSnapshot = async () => {
  if (!currentHtml.value) return;

  try {
    const snapshotContent = currentHtml.value.content;
    await htmlStore.updateHtml(currentHtml.value.id, {
      content: snapshotContent,
      contentType: 'snapshot'
    });
    ElMessage.success('已保存为网页快照');
  } catch (error) {
    console.error('保存快照失败:', error);
    ElMessage.error('保存快照失败');
  }
};

const openUrl = async () => {
  if (!currentHtml.value?.content) return;
  
  loadingUrl.value = true;
  try {
    // 模拟获取网页内容
    // 在实际应用中，这里应该通过后端API获取网页内容
    const response = await fetch(currentHtml.value.content);
    if (response.ok) {
      urlContent.value = await response.text();
      showUrlDialog.value = true;
    } else {
      // 如果直接访问失败，创建一个包含链接的iframe
      urlContent.value = `
        <iframe 
          src="${currentHtml.value.content}" 
          style="width: 100%; height: 100%; border: none;"
          frameborder="0"
        ></iframe>
      `;
      showUrlDialog.value = true;
    }
  } catch (error) {
    console.error('加载网页失败:', error);
    // 创建一个错误页面
    urlContent.value = `
      <div style="padding: 20px; text-align: center; color: #666;">
        <h3>无法加载网页</h3>
        <p>由于跨域限制或网络问题，无法直接加载该网页。</p>
        <p>请使用"打开链接"按钮在新窗口中访问。</p>
      </div>
    `;
    showUrlDialog.value = true;
  } finally {
    loadingUrl.value = false;
  }
};

// 获取代码编辑器中的内容
const getCode = () => {
  return codeEditorRef.value?.getCode() || '';
};

// 设置代码编辑器中的内容
const setCode = (code: string) => {
  if (codeEditorRef.value) {
    codeEditorRef.value.setCode(code);
  }
};

defineExpose({
  getCode,
  setCode
});
</script>

<style scoped>
.preview-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e4e7ed;
  background: #fff;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title {
  font-weight: 500;
  font-size: 14px;
}

.type-badge {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  background-color: #f4f4f5;
  color: #909399;
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

.preview-content {
  flex: 1;
  overflow: hidden;
  background: #f5f5f5;
}

.code-preview {
  height: 100%;
}

.url-preview {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.url-bar {
  display: flex;
  gap: 8px;
  padding: 12px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
}

.url-content {
  flex: 1;
  overflow: hidden;
}

.content-iframe {
  width: 100%;
  height: 100%;
  border: none;
  background: #fff;
}

.url-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
}

.snapshot-preview {
  height: 100%;
}

.snapshot-content {
  height: 100%;
}

.snapshot-iframe {
  width: 100%;
  height: 100%;
  border: none;
  background: #fff;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
}

.url-dialog-content {
  height: 600px;
}

.dialog-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.loading-content {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>