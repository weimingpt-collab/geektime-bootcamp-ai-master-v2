import type { Tag } from "./tag";

export interface Ticket {
  id: number;
  title: string;
  description?: string;
  status: "pending" | "completed";
  tags: Tag[];
  created_at: string;
  updated_at?: string;
  completed_at?: string;
}

export interface CreateTicketData {
  title: string;
  description?: string;
  tag_ids?: number[];
}

export interface UpdateTicketData {
  title?: string;
  description?: string;
}

export interface TicketListResponse {
  tickets: Ticket[];
  total: number;
  limit: number;
  offset: number;
}
