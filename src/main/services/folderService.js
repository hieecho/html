const db = require('../database');

class FolderService {
  async getAllFolders() {
    return new Promise((resolve, reject) => {
      db.getDb().all(
        'SELECT id, name, parent_id as parentId, created_at as createdAt FROM folders ORDER BY created_at',
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  async getFolderTree() {
    const folders = await this.getAllFolders();
    return this.buildTree(folders);
  }

  buildTree(folders, parentId = null) {
    return folders
      .filter(folder => folder.parentId === parentId)
      .map(folder => ({
        id: folder.id.toString(),
        label: folder.name,
        children: this.buildTree(folders, folder.id)
      }));
  }

  async createFolder(folderData) {
    return new Promise((resolve, reject) => {
      const { name, parentId } = folderData;
      db.getDb().run(
        'INSERT INTO folders (name, parent_id) VALUES (?, ?)',
        [name, parentId || null],
        function(err) {
          if (err) reject(err);
          else {
            resolve({
              id: this.lastID.toString(),
              name,
              parentId: parentId || null,
              createdAt: new Date().toISOString()
            });
          }
        }
      );
    });
  }

  async updateFolder(id, folderData) {
    return new Promise((resolve, reject) => {
      const { name, parentId } = folderData;
      db.getDb().run(
        'UPDATE folders SET name = ?, parent_id = ? WHERE id = ?',
        [name, parentId || null, id],
        function(err) {
          if (err) reject(err);
          else if (this.changes === 0) {
            reject(new Error('文件夹不存在'));
          } else {
            resolve({
              id: id.toString(),
              name,
              parentId: parentId || null,
              createdAt: new Date().toISOString()
            });
          }
        }
      );
    });
  }

  async deleteFolder(id) {
    return new Promise((resolve, reject) => {
      db.getDb().run(
        'DELETE FROM folders WHERE id = ?',
        [id],
        function(err) {
          if (err) reject(err);
          else if (this.changes === 0) {
            reject(new Error('文件夹不存在'));
          } else {
            resolve({ message: '文件夹已删除' });
          }
        }
      );
    });
  }

  async getFolderById(id) {
    return new Promise((resolve, reject) => {
      db.getDb().get(
        'SELECT id, name, parent_id as parentId, created_at as createdAt FROM folders WHERE id = ?',
        [id],
        (err, row) => {
          if (err) reject(err);
          else if (!row) reject(new Error('文件夹不存在'));
          else resolve(row);
        }
      );
    });
  }
}

module.exports = new FolderService();