const db = require('../database');

class TagService {
  async getAllTags() {
    return new Promise((resolve, reject) => {
      db.getDb().all(
        'SELECT id, name, color, created_at as createdAt FROM tags ORDER BY created_at',
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  async getPopularTags(limit = 10) {
    return new Promise((resolve, reject) => {
      db.getDb().all(`
        SELECT 
          t.id, 
          t.name, 
          t.color, 
          t.created_at as createdAt,
          COUNT(ht.html_id) as count
        FROM tags t
        LEFT JOIN html_tags ht ON t.id = ht.tag_id
        GROUP BY t.id, t.name, t.color, t.created_at
        ORDER BY count DESC
        LIMIT ?
      `, [limit], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async createTag(tagData) {
    return new Promise((resolve, reject) => {
      const { name, color = '#409eff' } = tagData;
      
      if (!name || name.trim() === '') {
        reject(new Error('标签名称不能为空'));
        return;
      }

      db.getDb().run(
        'INSERT OR IGNORE INTO tags (name, color) VALUES (?, ?)',
        [name.trim(), color],
        function(err) {
          if (err) reject(err);
          else if (this.changes === 0) {
            // 标签已存在，返回现有标签
            db.getDb().get(
              'SELECT id, name, color, created_at as createdAt FROM tags WHERE name = ?',
              [name.trim()],
              (err, row) => {
                if (err) reject(err);
                else resolve(row);
              }
            );
          } else {
            resolve({
              id: this.lastID.toString(),
              name: name.trim(),
              color,
              createdAt: new Date().toISOString()
            });
          }
        }
      );
    });
  }

  async updateTag(id, tagData) {
    return new Promise((resolve, reject) => {
      const { name, color } = tagData;
      
      if (!name || name.trim() === '') {
        reject(new Error('标签名称不能为空'));
        return;
      }

      db.getDb().run(
        'UPDATE tags SET name = ?, color = ? WHERE id = ?',
        [name.trim(), color, id],
        function(err) {
          if (err) reject(err);
          else if (this.changes === 0) {
            reject(new Error('标签不存在'));
          } else {
            resolve({
              id: id.toString(),
              name: name.trim(),
              color,
              createdAt: new Date().toISOString()
            });
          }
        }
      );
    });
  }

  async deleteTag(id) {
    return new Promise((resolve, reject) => {
      db.getDb().run(
        'DELETE FROM tags WHERE id = ?',
        [id],
        function(err) {
          if (err) reject(err);
          else if (this.changes === 0) {
            reject(new Error('标签不存在'));
          } else {
            resolve({ message: '标签已删除' });
          }
        }
      );
    });
  }
}

module.exports = new TagService();