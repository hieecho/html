const express = require('express');
const cors = require('cors');
const path = require('path');

// 启动测试服务器
const app = express();
app.use(cors());
app.use(express.json());

// 测试HTML内容
const testHtmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>测试导入</title>
</head>
<body>
    <h1>测试导入功能</h1>
    <p>这是测试导入的HTML内容</p>
</body>
</html>
`;

// 测试API
app.post('/api/htmls', (req, res) => {
    console.log('收到创建请求:', req.body);
    
    const { title, content, contentType, tags, folderId } = req.body;
    
    if (!title || !content) {
        return res.status(400).json({ 
            success: false, 
            error: '标题和内容不能为空' 
        });
    }
    
    const newItem = {
        id: Date.now().toString(),
        title,
        content,
        contentType: contentType || 'code',
        tags: tags || [],
        folderId: folderId || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    console.log('创建成功:', newItem);
    res.json({ success: true, data: newItem });
});

app.get('/api/folders', (req, res) => {
    res.json([
        { 
            id: 'root', 
            name: '根目录', 
            children: [
                { id: '1', name: '默认文件夹' }
            ] 
        }
    ]);
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`测试服务器运行在端口 ${PORT}`);
    console.log('可以尝试以下测试：');
    console.log('1. POST http://localhost:3001/api/htmls');
    console.log('2. 用浏览器打开 http://localhost:5174');
});

// 测试数据
console.log('测试导入功能：');
console.log('测试数据:', {
    title: '测试导入',
    content: testHtmlContent,
    contentType: 'code',
    tags: ['测试', '导入'],
    folderId: null
});