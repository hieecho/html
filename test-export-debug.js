const axios = require('axios');

// 测试HTML内容 - 包含一个较长的页面
const testHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>测试页面</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: Arial, sans-serif;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
        }
        .section {
            margin-bottom: 50px;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
        }
        .tall-content {
            height: 2000px;
            background: linear-gradient(to bottom, #ff0000, #00ff00, #0000ff);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="section">
            <h1>标题 1</h1>
            <p>这是第一个部分的内容。</p>
        </div>
        
        <div class="section">
            <h2>标题 2</h2>
            <p>这是第二个部分的内容。</p>
        </div>
        
        <div class="section tall-content">
            这是一个很高的内容区域 (2000px)
        </div>
        
        <div class="section">
            <h3>标题 3</h3>
            <p>这是最后一个部分的内容。</p>
        </div>
    </div>
</body>
</html>
`;

async function testExport() {
    try {
        console.log('开始测试导出...');
        
        const response = await axios.post('http://localhost:3001/api/export', {
            content: testHtml,
            format: 'png',
            options: {
                fullPage: true,
                quality: 90,
                deviceScaleFactor: 1,
                width: 1200,
                height: 800
            }
        }, {
            responseType: 'arraybuffer',
            timeout: 30000
        });
        
        console.log('导出成功，响应大小:', response.data.length);
        
        // 保存文件
        const fs = require('fs');
        fs.writeFileSync('test-debug-export.png', response.data);
        console.log('文件已保存为 test-debug-export.png');
        
    } catch (error) {
        console.error('导出失败:', error.message);
        if (error.response) {
            console.error('响应状态:', error.response.status);
            console.error('响应数据:', error.response.data.toString());
        }
    }
}

testExport();