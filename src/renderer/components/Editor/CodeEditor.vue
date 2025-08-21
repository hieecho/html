<template>
  <div class="code-editor">
    <div class="editor-header">
      <span class="title">代码编辑器</span>
      <div class="actions">
        <el-button-group>
          <el-button 
            size="small" 
            :type="mode === 'edit' ? 'primary' : ''"
            @click="mode = 'edit'"
          >
            编辑
          </el-button>
          <el-button 
            size="small" 
            :type="mode === 'preview' ? 'primary' : ''"
            @click="mode = 'preview'"
          >
            预览
          </el-button>
          <el-button 
            size="small" 
            :type="mode === 'split' ? 'primary' : ''"
            @click="mode = 'split'"
          >
            分屏
          </el-button>
        </el-button-group>
      </div>
    </div>
    
    <div class="editor-content" :class="`mode-${mode}`">
      <div v-if="mode === 'edit' || mode === 'split'" class="editor-pane">
        <textarea
          v-model="code"
          class="code-textarea"
          placeholder="在此输入HTML代码..."
          @input="onCodeChange"
        ></textarea>
      </div>
      
      <div v-if="mode === 'preview' || mode === 'split'" class="preview-pane">
        <div class="preview-header">
          <span class="preview-title">实时预览</span>
          <el-button 
            size="small" 
            @click="refreshPreview"
            :loading="refreshing"
          >
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
        <div class="preview-content">
          <iframe
            ref="previewFrame"
            :srcdoc="previewContent"
            frameborder="0"
            class="preview-iframe"
            @load="onPreviewLoad"
          ></iframe>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { Refresh } from '@element-plus/icons-vue';
import { useHtmlStore } from '../../store';

const htmlStore = useHtmlStore();

const mode = ref<'edit' | 'preview' | 'split'>('edit');
const code = ref('');
const refreshing = ref(false);
const previewFrame = ref<HTMLIFrameElement>();

const previewContent = computed(() => {
  if (!code.value.trim()) {
    return `
      <html>
        <head>
          <title>预览</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background: #f5f5f5;
              color: #666;
            }
            .empty-message {
              text-align: center;
              padding: 40px;
            }
          </style>
        </head>
        <body>
          <div class="empty-message">
            <h3>暂无内容</h3>
            <p>请在左侧编辑器中输入HTML代码</p>
          </div>
        </body>
      </html>
    `;
  }
  
  // 添加基础样式确保正确渲染
  const fullHtml = code.value.includes('<html') ? code.value : `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>预览</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 20px;
            line-height: 1.6;
          }
        </style>
      </head>
      <body>
        ${code.value}
      </body>
    </html>
  `;
  
  return fullHtml;
});

// 监听当前HTML变化
watch(() => htmlStore.currentHtml, (newHtml) => {
  if (newHtml) {
    code.value = newHtml.content;
  } else {
    code.value = '';
  }
}, { immediate: true });

// 监听代码变化，更新store
let saveTimeout: any = null;
const onCodeChange = () => {
  if (htmlStore.currentHtml) {
    htmlStore.currentHtml.content = code.value;
    
    // 自动保存，延迟500ms
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(async () => {
      if (htmlStore.currentHtml) {
        try {
          await htmlStore.updateHtml(htmlStore.currentHtml.id, {
            content: code.value
          });
        } catch (error) {
          console.error('自动保存失败:', error);
        }
      }
    }, 500);
  }
};

const refreshPreview = async () => {
  refreshing.value = true;
  await nextTick();
  if (previewFrame.value) {
    previewFrame.value.srcdoc = previewContent.value;
  }
  setTimeout(() => {
    refreshing.value = false;
  }, 500);
};

const onPreviewLoad = () => {
  refreshing.value = false;
};

// 暴露方法给父组件
defineExpose({
  getCode: () => code.value,
  setCode: (newCode: string) => {
    code.value = newCode;
  },
  getPreviewHTML: () => previewContent.value,
});
</script>

<style scoped>
.code-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e4e7ed;
  background: #fff;
}

.title {
  font-weight: 500;
  font-size: 14px;
}

.editor-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.editor-pane {
  flex: 1;
  min-width: 0;
}

.preview-pane {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  border-left: 1px solid #e4e7ed;
}

.mode-edit .editor-pane {
  flex: 1;
}

.mode-edit .preview-pane {
  display: none;
}

.mode-preview .editor-pane {
  display: none;
}

.mode-preview .preview-pane {
  flex: 1;
}

.mode-split .editor-pane,
.mode-split .preview-pane {
  flex: 1;
}

.code-textarea {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  resize: none;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
  padding: 16px;
  background-color: #1e1e1e;
  color: #d4d4d4;
}

.code-textarea:focus {
  background-color: #1e1e1e;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  border-bottom: 1px solid #e4e7ed;
  background: #f5f5f5;
}

.preview-title {
  font-size: 13px;
  color: #666;
}

.preview-content {
  flex: 1;
  overflow: hidden;
  background: #fff;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
}
</style>