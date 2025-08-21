export interface Folder {
  id: string;
  name: string;
  parentId?: string;
  createdAt: string;
}

export interface CreateFolderDto {
  name: string;
  parentId?: string;
}