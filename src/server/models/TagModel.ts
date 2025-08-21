export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface CreateTagDto {
  name: string;
  color: string;
}