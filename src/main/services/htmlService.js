const db = require('../database');

class HtmlService {
  async getAllHtmls() {
    return new Promise((resolve, reject) => {
      db.getDb().all(`
        SELECT 
          h.id, 
          h.title, 
          h.content, 
          h.content_type as contentType, 
          h.original_url as originalUrl,
          h.folder_id as folderId,
          h.created_at as createdAt,
          h.updated_at as updatedAt,
          GROUP_CONCAT(t.name) as tags
        FROM htmls h
        LEFT JOIN html_tags ht ON h.id = ht.html_id
        LEFT JOIN tags t ON ht.tag_id = t.id
        GROUP BY h.id
        ORDER BY h.created_at DESC
      `, (err, rows) => {
        if (err) reject(err);
        else {
          const results = rows.map(row => ({
            ...row,
            tags: row.tags ? row.tags.split(',') : []
          }));
          resolve(results);
        }
      });
    });
  }

  async getHtmlById(id) {
    return new Promise((resolve, reject) => {
      db.getDb().get(`
        SELECT 
          h.id, 
          h.title, 
          h.content, 
          h.content_type as contentType, 
          h.original_url as originalUrl,
          h.folder_id as folderId,
          h.created_at as createdAt,
          h.updated_at as updatedAt,
          GROUP_CONCAT(t.name) as tags
        FROM htmls h
        LEFT JOIN html_tags ht ON h.id = ht.html_id
        LEFT JOIN tags t ON ht.tag_id = t.id
        WHERE h.id = ?
        GROUP BY h.id
      `, [id], (err, row) => {
        if (err) reject(err);
        else if (!row) reject(new Error('HTML项目不存在'));
        else {
          const result = {
            ...row,
            tags: row.tags ? row.tags.split(',') : []
          };
          resolve(result);
        }
      });
    });
  }

  async createHtml(htmlData) {
    return new Promise((resolve, reject) => {
      const { title, content, contentType, originalUrl, folderId, tags = [] } = htmlData;
      
      if (!title || !content || !contentType) {
        reject(new Error('标题、内容和类型不能为空'));
        return;
      }

      const validTypes = ['code', 'url', 'snapshot'];
      if (!validTypes.includes(contentType)) {
        reject(new Error('内容类型必须是 code、url 或 snapshot'));
        return;
      }

      db.getDb().run(
        'INSERT INTO htmls (title, content, content_type, original_url, folder_id) VALUES (?, ?, ?, ?, ?)',
        [title, content, contentType, originalUrl || null, folderId || null],
        function(err) {
          if (err) reject(err);
          else {
            const htmlId = this.lastID;
            
            // 处理标签
            if (tags.length > 0) {
              const tagPromises = tags.map(tagName => 
                new Promise((resolve, reject) => {
                  db.getDb().get('SELECT id FROM tags WHERE name = ?', [tagName], (err, row) => {
                    if (err) reject(err);
                    else if (row) {
                      db.getDb().run('INSERT OR IGNORE INTO html_tags (html_id, tag_id) VALUES (?, ?)', 
                        [htmlId, row.id], (err) => {
                          if (err) reject(err);
                          else resolve();
                        });
                    } else {
                      db.getDb().run('INSERT INTO tags (name) VALUES (?)', [tagName], function(err) {
                        if (err) reject(err);
                        else {
                          db.getDb().run('INSERT INTO html_tags (html_id, tag_id) VALUES (?, ?)', 
                            [htmlId, this.lastID], (err) => {
                              if (err) reject(err);
                              else resolve();
                            });
                        }
                      });
                    }
                  });
                })
              );

              Promise.all(tagPromises)
                .then(() => resolve({ id: htmlId.toString(), ...htmlData }))
                .catch(reject);
            } else {
              resolve({ id: htmlId.toString(), ...htmlData });
            }
          }
        }
      );
    });
  }

  async updateHtml(id, htmlData) {
    return new Promise((resolve, reject) => {
      const { title, content, contentType, originalUrl, folderId, tags } = htmlData;
      
      if (!title || !content || !contentType) {
        reject(new Error('标题、内容和类型不能为空'));
        return;
      }

      const validTypes = ['code', 'url', 'snapshot'];
      if (!validTypes.includes(contentType)) {
        reject(new Error('内容类型必须是 code、url 或 snapshot'));
        return;
      }

      db.getDb().run(
        'UPDATE htmls SET title = ?, content = ?, content_type = ?, original_url = ?, folder_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [title, content, contentType, originalUrl || null, folderId || null, id],
        function(err) {
          if (err) reject(err);
          else if (this.changes === 0) {
            reject(new Error('HTML项目不存在'));
          } else {
            // 更新标签
            if (tags) {
              // 先删除现有标签关联
              db.getDb().run('DELETE FROM html_tags WHERE html_id = ?', [id], (err) => {
                if (err) {
                  reject(err);
                  return;
                }

                if (tags.length > 0) {
                  const tagPromises = tags.map(tagName => 
                    new Promise((resolve, reject) => {
                      db.getDb().get('SELECT id FROM tags WHERE name = ?', [tagName], (err, row) => {
                        if (err) reject(err);
                        else if (row) {
                          db.getDb().run('INSERT OR IGNORE INTO html_tags (html_id, tag_id) VALUES (?, ?)', 
                            [id, row.id], (err) => {
                              if (err) reject(err);
                              else resolve();
                            });
                        } else {
                          db.getDb().run('INSERT INTO tags (name) VALUES (?)', [tagName], function(err) {
                            if (err) reject(err);
                            else {
                              db.getDb().run('INSERT INTO html_tags (html_id, tag_id) VALUES (?, ?)', 
                                [id, this.lastID], (err) => {
                                  if (err) reject(err);
                                  else resolve();
                                });
                            }
                          });
                        }
                      });
                    })
                  );

                  Promise.all(tagPromises)
                    .then(() => resolve({ id, ...htmlData }))
                    .catch(reject);
                } else {
                  resolve({ id, ...htmlData });
                }
              });
            } else {
              resolve({ id, ...htmlData });
            }
          }
        }
      );
    });
  }

  async deleteHtml(id) {
    return new Promise((resolve, reject) => {
      db.getDb().run('DELETE FROM htmls WHERE id = ?', [id], function(err) {
        if (err) reject(err);
        else if (this.changes === 0) {
          reject(new Error('HTML项目不存在'));
        } else {
          resolve({ message: 'HTML项目已删除' });
        }
      });
    });
  }

  async searchHtmls(query) {
    return new Promise((resolve, reject) => {
      const searchQuery = `%${query}%`;
      db.getDb().all(`
        SELECT 
          h.id, 
          h.title, 
          h.content, 
          h.content_type as contentType, 
          h.original_url as originalUrl,
          h.folder_id as folderId,
          h.created_at as createdAt,
          h.updated_at as updatedAt,
          GROUP_CONCAT(t.name) as tags
        FROM htmls h
        LEFT JOIN html_tags ht ON h.id = ht.html_id
        LEFT JOIN tags t ON ht.tag_id = t.id
        WHERE h.title LIKE ? OR h.content LIKE ?
        GROUP BY h.id
        ORDER BY h.created_at DESC
      `, [searchQuery, searchQuery], (err, rows) => {
        if (err) reject(err);
        else {
          const results = rows.map(row => ({
            ...row,
            tags: row.tags ? row.tags.split(',') : []
          }));
          resolve(results);
        }
      });
    });
  }

  async importFromUrl(url) {
    // 这里应该实现网页抓取功能
    // 暂时返回一个模拟数据
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({
          title: `从 ${url} 导入的内容`,
          content: `<html><body><h1>从 ${url} 导入的内容</h1><p>这里是网页内容...</p></body></html>`,
          contentType: 'snapshot',
          originalUrl: url,
          tags: ['imported']
        });
      }, 1000);
    });
  }
}

module.exports = new HtmlService();