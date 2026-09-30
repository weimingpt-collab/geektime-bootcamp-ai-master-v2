import { create } from "zustand";
import { ticketApi, tagApi } from "@/lib/api";
import type {
  Ticket,
  CreateTicketData,
  UpdateTicketData,
} from "@/types/ticket";
import type { Tag } from "@/types/tag";

type SortField = "created_at" | "updated_at" | "title";
type SortOrder = "asc" | "desc";

interface TicketStore {
  // State
  tickets: Ticket[];
  tags: Tag[];
  isLoading: boolean;
  error: string | null;

  // Filters
  statusFilter: "all" | "pending" | "completed";
  selectedTagIds: number[];
  searchQuery: string;
  sortField: SortField;
  sortOrder: SortOrder;

  // Actions
  fetchTickets: () => Promise<void>;
  createTicket: (data: CreateTicketData) => Promise<void>;
  updateTicket: (id: number, data: UpdateTicketData) => Promise<void>;
  deleteTicket: (id: number) => Promise<void>;
  toggleComplete: (id: number) => Promise<void>;
  batchComplete: (ids: number[]) => Promise<void>;
  batchDelete: (ids: number[]) => Promise<void>;

  fetchTags: () => Promise<void>;
  createTag: (data: { name: string; color?: string }) => Promise<void>;
  deleteTag: (id: number) => Promise<void>;
  addTagToTicket: (ticketId: number, tagIds: number[]) => Promise<void>;
  removeTagFromTicket: (ticketId: number, tagId: number) => Promise<void>;

  setStatusFilter: (status: "all" | "pending" | "completed") => void;
  setSelectedTagIds: (ids: number[]) => void;
  setSearchQuery: (query: string) => void;
  setSortField: (field: SortField) => void;
  setSortOrder: (order: SortOrder) => void;

  reset: () => void;
}

export const useTicketStore = create<TicketStore>((set, get) => ({
  // Initial state
  tickets: [],
  tags: [],
  isLoading: false,
  error: null,
  statusFilter: "all",
  selectedTagIds: [],
  searchQuery: "",
  sortField: "created_at",
  sortOrder: "desc",

  // Fetch tickets
  fetchTickets: async () => {
    set({ isLoading: true, error: null });
    try {
      const {
        statusFilter,
        selectedTagIds,
        searchQuery,
        sortField,
        sortOrder,
      } = get();
      const params = {
        status: statusFilter,
        tag_ids:
          selectedTagIds.length > 0 ? selectedTagIds.join(",") : undefined,
        search: searchQuery || undefined,
      };
      const response = await ticketApi.list(params);

      // Sort tickets
      const sortedTickets = [...response.tickets];
      sortedTickets.sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;

        if (sortField === "title") {
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
        } else {
          aValue = new Date(a[sortField] || a.created_at).getTime();
          bValue = new Date(b[sortField] || b.created_at).getTime();
        }

        if (sortOrder === "asc") {
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        } else {
          return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
        }
      });

      set({ tickets: sortedTickets, isLoading: false });
    } catch (error) {
      set({ error: "Failed to fetch tickets", isLoading: false });
      console.error("Error fetching tickets:", error);
    }
  },

  // Create ticket
  createTicket: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await ticketApi.create(data);
      await get().fetchTickets();
      set({ isLoading: false });
    } catch (error) {
      set({ error: "Failed to create ticket", isLoading: false });
      console.error("Error creating ticket:", error);
      throw error;
    }
  },

  // Update ticket
  updateTicket: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await ticketApi.update(id, data);
      await get().fetchTickets();
      set({ isLoading: false });
    } catch (error) {
      set({ error: "Failed to update ticket", isLoading: false });
      console.error("Error updating ticket:", error);
      throw error;
    }
  },

  // Delete ticket
  deleteTicket: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await ticketApi.delete(id);
      await get().fetchTickets();
      set({ isLoading: false });
    } catch (error) {
      set({ error: "Failed to delete ticket", isLoading: false });
      console.error("Error deleting ticket:", error);
      throw error;
    }
  },

  // Toggle complete
  toggleComplete: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const ticket = get().tickets.find((t) => t.id === id);
      if (ticket) {
        if (ticket.status === "pending") {
          await ticketApi.complete(id);
        } else {
          await ticketApi.uncomplete(id);
        }
        await get().fetchTickets();
      }
      set({ isLoading: false });
    } catch (error) {
      set({ error: "Failed to toggle ticket status", isLoading: false });
      console.error("Error toggling ticket status:", error);
      throw error;
    }
  },

  // Batch complete
  batchComplete: async (ids) => {
    set({ isLoading: true, error: null });
    try {
      await Promise.all(ids.map((id) => ticketApi.complete(id)));
      await get().fetchTickets();
      set({ isLoading: false });
    } catch (error) {
      set({ error: "Failed to batch complete tickets", isLoading: false });
      console.error("Error batch completing tickets:", error);
      throw error;
    }
  },

  // Batch delete
  batchDelete: async (ids) => {
    set({ isLoading: true, error: null });
    try {
      await Promise.all(ids.map((id) => ticketApi.delete(id)));
      await get().fetchTickets();
      set({ isLoading: false });
    } catch (error) {
      set({ error: "Failed to batch delete tickets", isLoading: false });
      console.error("Error batch deleting tickets:", error);
      throw error;
    }
  },

  // Fetch tags
  fetchTags: async () => {
    try {
      const response = await tagApi.list();
      set({ tags: response.tags });
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  },

  // Create tag
  createTag: async (data) => {
    try {
      await tagApi.create(data);
      await get().fetchTags();
    } catch (error) {
      console.error("Error creating tag:", error);
      throw error;
    }
  },

  // Delete tag
  deleteTag: async (id) => {
    try {
      await tagApi.delete(id);
      await get().fetchTags();
      await get().fetchTickets();
    } catch (error) {
      console.error("Error deleting tag:", error);
      throw error;
    }
  },

  // Add tag to ticket
  addTagToTicket: async (ticketId, tagIds) => {
    try {
      await ticketApi.addTags(ticketId, tagIds);
      await get().fetchTickets();
    } catch (error) {
      console.error("Error adding tag to ticket:", error);
      throw error;
    }
  },

  // Remove tag from ticket
  removeTagFromTicket: async (ticketId, tagId) => {
    try {
      await ticketApi.removeTag(ticketId, tagId);
      await get().fetchTickets();
    } catch (error) {
      console.error("Error removing tag from ticket:", error);
      throw error;
    }
  },

  // Filters
  setStatusFilter: (status) => {
    set({ statusFilter: status });
    get().fetchTickets();
  },

  setSelectedTagIds: (ids) => {
    set({ selectedTagIds: ids });
    get().fetchTickets();
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  setSortField: (field) => {
    set({ sortField: field });
    get().fetchTickets();
  },

  setSortOrder: (order) => {
    set({ sortOrder: order });
    get().fetchTickets();
  },

  // Reset
  reset: () => {
    set({
      statusFilter: "all",
      selectedTagIds: [],
      searchQuery: "",
      sortField: "created_at",
      sortOrder: "desc",
    });
    get().fetchTickets();
  },
}));
