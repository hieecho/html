#!/usr/bin/env node

import app from './app.js';

// 确保在直接运行时使用
if (import.meta.url === `file://${process.argv[1]}`) {
  // 已经由app.ts中的startServer()启动
}