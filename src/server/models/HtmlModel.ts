export interface HtmlItem {
  id: string;
  title: string;
  content: string;
  contentType: 'code' | 'url' | 'snapshot';
  originalUrl?: string;
  folderId?: string;
  tags: string[];
  resourcesPath?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHtmlDto {
  title: string;
  content: string;
  contentType: 'code' | 'url' | 'snapshot';
  originalUrl?: string;
  folderId?: string;
  tags?: string[];
}

export interface UpdateHtmlDto {
  title?: string;
  content?: string;
  folderId?: string;
  tags?: string[];
}