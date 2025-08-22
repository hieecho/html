<template>
  <div id="app">
    <el-container style="height: 100vh">
      <el-header height="60px" style="background-color: #fff; border-bottom: 1px solid #e4e7ed">
        <div style="display: flex; align-items: center; height: 100%; padding: 0 20px">
          <h2 style="margin: 0">HTML存储管理器</h2>
        </div>
      </el-header>
      
      <el-container>
        <!-- 左侧边栏 -->
        <el-aside width="250px" style="background-color: #f5f7fa; border-right: 1px solid #e4e7ed">
          <Sidebar @tag-selected="handleTagSelected" />
        </el-aside>
        
        <!-- 中间内容区 -->
        <el-main style="padding: 0">
          <el-container style="height: 100%">
            <el-aside width="300px" style="background-color: #fff; border-right: 1px solid #e4e7ed">
              <ContentList ref="contentListRef" />
            </el-aside>
            
            <!-- 右侧预览区 -->
            <el-main style="padding: 0">
              <PreviewPanel />
            </el-main>
          </el-container>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Sidebar from './components/Sidebar/index.vue';
import ContentList from './components/ContentList/index.vue';
import PreviewPanel from './components/Editor/PreviewPanel.vue';

const contentListRef = ref();

const handleTagSelected = (tagName: string) => {
  if (contentListRef.value && contentListRef.value.handleSearch) {
    contentListRef.value.handleSearch({ tag: tagName });
  }
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

#app {
  height: 100vh;
  overflow: hidden;
}
</style>