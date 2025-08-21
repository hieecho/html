const exportManager = require('./src/main/services/export');

// 测试HTML内容
const testHtml = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>测试导出功能</title>
    <style>
        body {
            font-family: 'Microsoft YaHei', sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 20px;
            text-align: center;
        }
        .content {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .code {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            font-family: 'Consolas', monospace;
            overflow-x: auto;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>HTML存储管理器 - 导出测试</h1>
        <p>这是一个用于测试PDF和PNG导出功能的HTML页面</p>
    </div>
    
    <div class="content">
        <h2>测试内容</h2>
        <p>这个页面包含了以下内容来测试导出功能：</p>
        
        <ul>
            <li>响应式布局设计</li>
            <li>渐变背景效果</li>
            <li>代码高亮显示</li>
            <li>中文内容支持</li>
            <li>图片和样式测试</li>
        </ul>
        
        <h3>代码示例</h3>
        <div class="code">
            <pre>function testExport() {
    console.log('测试导出功能');
    return '成功导出为PDF和PNG格式';
}</pre>
        </div>
        
        <h3>当前时间</h3>
        <p>生成时间：${new Date().toLocaleString('zh-CN')}</p>
    </div>
</body>
</html>
`;

async function testExport() {
    console.log('开始测试导出功能...\n');
    
    try {
        // 测试PDF导出
        console.log('1. 测试PDF导出...');
        const pdfBuffer = await exportManager.export(testHtml, 'pdf', {
            format: 'A4',
            landscape: false,
            printBackground: true
        });
        console.log(`   ✅ PDF导出成功，大小: ${(pdfBuffer.length / 1024).toFixed(2)} KB`);
        
        // 测试PNG导出
        console.log('2. 测试PNG导出...');
        const pngBuffer = await exportManager.export(testHtml, 'png', {
            width: 1920,
            height: 1080,
            fullPage: true
        });
        console.log(`   ✅ PNG导出成功，大小: ${(pngBuffer.length / 1024).toFixed(2)} KB`);
        
        // 保存测试文件
        const fs = require('fs').promises;
        const path = require('path');
        
        await fs.writeFile(path.join(__dirname, 'test-output.pdf'), pdfBuffer);
        await fs.writeFile(path.join(__dirname, 'test-output.png'), pngBuffer);
        
        console.log('\n📁 测试文件已保存:');
        console.log('   - test-output.pdf');
        console.log('   - test-output.png');
        
        console.log('\n🎉 所有测试通过！导出功能正常工作。');
        
    } catch (error) {
        console.error('❌ 测试失败:', error.message);
    }
}

// 运行测试
if (require.main === module) {
    testExport();
}

module.exports = { testExport };