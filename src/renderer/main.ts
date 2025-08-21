import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import { ElLoading } from 'element-plus';
import App from './App.vue';

const app = createApp(App);
const pinia = createPinia();

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

// 注册ElLoading指令
app.use(ElLoading);

app.use(pinia);
app.use(ElementPlus);
app.mount('#app');