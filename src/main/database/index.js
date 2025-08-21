const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'app.db');

class Database {
  constructor() {
    this.db = new sqlite3.Database(dbPath);
    this.initTables();
  }

  initTables() {
    this.db.serialize(() => {
      // 创建HTML项目表
      this.db.run(`
        CREATE TABLE IF NOT EXISTS htmls (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          content_type TEXT NOT NULL CHECK (content_type IN ('code', 'url', 'snapshot')),
          original_url TEXT,
          folder_id INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL
        )
      `);

      // 创建文件夹表
      this.db.run(`
        CREATE TABLE IF NOT EXISTS folders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          parent_id INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (parent_id) REFERENCES folders(id) ON DELETE CASCADE
        )
      `);

      // 创建标签表
      this.db.run(`
        CREATE TABLE IF NOT EXISTS tags (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          color TEXT DEFAULT '#409eff',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 创建HTML标签关联表
      this.db.run(`
        CREATE TABLE IF NOT EXISTS html_tags (
          html_id INTEGER NOT NULL,
          tag_id INTEGER NOT NULL,
          PRIMARY KEY (html_id, tag_id),
          FOREIGN KEY (html_id) REFERENCES htmls(id) ON DELETE CASCADE,
          FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
        )
      `);

      // 插入默认数据
      this.db.get('SELECT COUNT(*) as count FROM folders', (err, row) => {
        if (!err && row.count === 0) {
          const stmt = this.db.prepare('INSERT INTO folders (name) VALUES (?)');
          stmt.run('网页源码');
          stmt.run('网页快照');
          stmt.run('收藏夹');
          stmt.finalize();
        }
      });

      this.db.get('SELECT COUNT(*) as count FROM tags', (err, row) => {
        if (!err && row.count === 0) {
          const stmt = this.db.prepare('INSERT INTO tags (name, color) VALUES (?, ?)');
          stmt.run('前端', '#409eff');
          stmt.run('教程', '#67c23a');
          stmt.run('工具', '#e6a23c');
          stmt.finalize();
        }
      });
    });
  }

  getDb() {
    return this.db;
  }
}

module.exports = new Database();