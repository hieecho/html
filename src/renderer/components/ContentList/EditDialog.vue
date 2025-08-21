<template>
  <el-dialog v-model="visible" title="编辑HTML项目" width="600px" :close-on-click-modal="false">
    <el-form :model="formData" label-width="80px" :rules="rules" ref="formRef">
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
      
      <el-form-item label="文件夹">
        <el-tree-select
          v-model="formData.folderId"
          :data="folderTree"
          placeholder="请选择文件夹"
          clearable
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleSave" :loading="saving">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useHtmlStore, useFolderStore } from '../../store';

interface Props {
  modelValue: boolean;
  htmlItem: any;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'save', data: any): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const htmlStore = useHtmlStore();
const folderStore = useFolderStore();

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const formRef = ref();
const saving = ref(false);
const formData = ref({
  title: '',
  contentType: 'code',
  content: '',
  tags: [] as string[],
  folderId: '1'
});

const rules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 1, max: 100, message: '标题长度不能超过100字符', trigger: 'blur' }
  ],
  contentType: [
    { required: true, message: '请选择类型', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入内容', trigger: 'blur' }
  ]
};

const folderTree = computed(() => folderStore.folderTree);
const availableTags = computed(() => {
  const tags = new Set<string>();
  htmlStore.htmls.forEach(item => {
    item.tags?.forEach(tag => tags.add(tag));
  });
  return Array.from(tags);
});

// 监听htmlItem变化
watch(() => props.htmlItem, (newItem) => {
  if (newItem) {
    formData.value = {
      title: newItem.title,
      contentType: newItem.contentType,
      content: newItem.content,
      tags: newItem.tags || [],
      folderId: newItem.folderId || '1'
    };
  }
}, { immediate: true });

const handleSave = async () => {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
    saving.value = true;
    
    await htmlStore.updateHtml(props.htmlItem.id, formData.value);
    ElMessage.success('保存成功');
    emit('save', formData.value);
    visible.value = false;
  } catch (error) {
    console.error('保存失败:', error);
  } finally {
    saving.value = false;
  }
};

const handleCancel = () => {
  visible.value = false;
};

// 加载文件夹数据
onMounted(() => {
  folderStore.loadFolders();
});
</script>