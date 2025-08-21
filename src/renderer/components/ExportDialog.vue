<template>
  <el-dialog
    v-model="visible"
    :title="`导出${title ? ` - ${title}` : ''}`"
    width="500px"
    :before-close="handleClose"
  >
    <el-form :model="form" label-width="100px">
      <el-form-item label="导出格式">
        <el-select v-model="form.format" @change="handleFormatChange">
          <el-option
            v-for="format in formats"
            :key="format"
            :label="format.toUpperCase()"
            :value="format"
          />
        </el-select>
      </el-form-item>

      <!-- PDF选项 -->
      <template v-if="form.format === 'pdf'">
        <el-form-item label="纸张格式">
          <el-select v-model="form.options.format">
            <el-option label="A4" value="A4" />
            <el-option label="A3" value="A3" />
            <el-option label="A5" value="A5" />
            <el-option label="Letter" value="Letter" />
            <el-option label="Legal" value="Legal" />
          </el-select>
        </el-form-item>

        <el-form-item label="方向">
          <el-radio-group v-model="form.options.landscape">
            <el-radio :value="false">纵向</el-radio>
            <el-radio :value="true">横向</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="打印背景">
          <el-switch v-model="form.options.printBackground" />
        </el-form-item>

        <el-form-item label="页边距">
          <el-row :gutter="10">
            <el-col :span="12">
              <el-input v-model="form.options.marginTop" placeholder="上边距">
                <template #append>cm</template>
              </el-input>
            </el-col>
            <el-col :span="12">
              <el-input v-model="form.options.marginBottom" placeholder="下边距">
                <template #append>cm</template>
              </el-input>
            </el-col>
          </el-row>
          <el-row :gutter="10" style="margin-top: 10px;">
            <el-col :span="12">
              <el-input v-model="form.options.marginLeft" placeholder="左边距">
                <template #append>cm</template>
              </el-input>
            </el-col>
            <el-col :span="12">
              <el-input v-model="form.options.marginRight" placeholder="右边距">
                <template #append>cm</template>
              </el-input>
            </el-col>
          </el-row>
        </el-form-item>
      </template>

      <!-- PNG/JPG选项 -->
      <template v-else>
        <el-form-item label="图片格式">
          <el-radio-group v-model="form.format">
            <el-radio value="png">PNG</el-radio>
            <el-radio value="jpg">JPG</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="预设尺寸">
          <el-select v-model="selectedPreset" @change="handlePresetChange">
            <el-option label="自定义" value="custom" />
            <el-option
              v-for="(size, name) in imagePresets"
              :key="name"
              :label="`${name} (${size.width}×${size.height})`"
              :value="name"
            />
          </el-select>
        </el-form-item>

        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="宽度">
              <el-input-number
                v-model="form.options.width"
                :min="100"
                :max="4000"
                :step="100"
                :disabled="selectedPreset !== 'custom'"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="高度">
              <el-input-number
                v-model="form.options.height"
                :min="100"
                :max="4000"
                :step="100"
                :disabled="selectedPreset !== 'custom'"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="图片质量" v-if="form.format === 'jpg'">
          <el-slider v-model="form.options.quality" :min="1" :max="100" />
        </el-form-item>

        <el-form-item label="全页面截图">
          <el-switch v-model="form.options.fullPage" />
        </el-form-item>

        <el-form-item label="捕获选择器">
          <el-input
            v-model="form.options.captureSelector"
            placeholder="例如: #main-content, .container"
            clearable
          >
            <template #prepend>CSS</template>
          </el-input>
          <div style="font-size: 12px; color: #999; margin-top: 4px;">
            指定要截图的元素选择器，留空则截图整个页面
          </div>
        </el-form-item>

        <el-form-item label="设备像素比">
          <el-slider
            v-model="form.options.deviceScaleFactor"
            :min="1"
            :max="3"
            :step="0.5"
          />
        </el-form-item>
      </template>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button
        type="primary"
        :loading="exporting"
        @click="handleExport"
      >
        {{ exporting ? '导出中...' : '导出' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script>
import { ref, reactive, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { exportApi } from '../api/export';

export default {
  name: 'ExportDialog',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    content: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue', 'success'],
  setup(props, { emit }) {
    const visible = ref(false);
    const exporting = ref(false);
    const formats = ref(['pdf', 'png', 'jpg']);
    const imagePresets = ref({});
    const selectedPreset = ref('custom');

    const form = reactive({
      format: 'pdf',
      options: {
        // PDF选项
        format: 'A4',
        landscape: false,
        printBackground: true,
        marginTop: '1cm',
        marginBottom: '1cm',
        marginLeft: '1cm',
        marginRight: '1cm',
        // 图片选项
        width: 1920,
        height: 1080,
        quality: 90,
        fullPage: true,
        captureSelector: '',
        deviceScaleFactor: 2
      }
    });

    // 监听visible变化
    watch(() => props.modelValue, (newVal) => {
      visible.value = newVal;
      if (newVal) {
        loadImagePresets();
      }
    });

    watch(visible, (newVal) => {
      emit('update:modelValue', newVal);
    });

    const loadImagePresets = async () => {
      try {
        imagePresets.value = {
          '桌面': { width: 1920, height: 1080 },
          '笔记本': { width: 1366, height: 768 },
          '平板': { width: 768, height: 1024 },
          '手机': { width: 375, height: 667 },
          '4K': { width: 3840, height: 2160 }
        };
      } catch (error) {
        console.error('加载图片预设失败:', error);
      }
    };

    const handleFormatChange = (format) => {
      // 重置对应格式的默认选项
      if (format === 'pdf') {
        Object.assign(form.options, {
          format: 'A4',
          landscape: false,
          printBackground: true,
          marginTop: '1cm',
          marginBottom: '1cm',
          marginLeft: '1cm',
          marginRight: '1cm'
        });
      } else {
        selectedPreset.value = 'custom';
        Object.assign(form.options, {
          width: 1920,
          height: 1080,
          quality: 90,
          fullPage: true,
          deviceScaleFactor: 2
        });
      }
    };

    const handlePresetChange = (preset) => {
      if (preset !== 'custom' && imagePresets.value[preset]) {
        const size = imagePresets.value[preset];
        form.options.width = size.width;
        form.options.height = size.height;
      }
    };

    const handleClose = () => {
      visible.value = false;
      exporting.value = false;
    };

    const handleExport = async () => {
      if (!props.content) {
        ElMessage.error('没有可导出的内容');
        return;
      }

      exporting.value = true;

      try {
        const blob = await exportApi.exportContent(
          props.content,
          form.format,
          form.options
        );

        // 创建下载链接
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        const extension = form.format === 'jpg' ? 'jpg' : form.format;
        const filename = `${props.title || 'export'}_${Date.now()}.${extension}`;
        a.download = filename;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        ElMessage.success('导出成功');
        emit('success');
        handleClose();

      } catch (error) {
        console.error('导出失败:', error);
        ElMessage.error(error.message || '导出失败');
      } finally {
        exporting.value = false;
      }
    };

    return {
      visible,
      exporting,
      formats,
      form,
      imagePresets,
      selectedPreset,
      handleClose,
      handleFormatChange,
      handlePresetChange,
      handleExport
    };
  }
};
</script>

<style scoped>
.el-form-item {
  margin-bottom: 18px;
}

.el-row {
  width: 100%;
}
</style>