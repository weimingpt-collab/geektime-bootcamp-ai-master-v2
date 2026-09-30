export interface Tag {
  id: number;
  name: string;
  color: string;
  created_at: string;
  ticket_count?: number;
}

export interface CreateTagData {
  name: string;
  color?: string;
}

export interface TagListResponse {
  tags: Tag[];
  total: number;
}
