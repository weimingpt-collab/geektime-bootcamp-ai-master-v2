import { useState, useEffect, useRef, useCallback } from "react";
import { useTicketStore } from "./store/useTicketStore";
import Header from "./components/layout/Header";
import FilterSidebar from "./components/layout/FilterSidebar";
import TicketList from "./components/tickets/TicketList";
import TicketForm from "./components/tickets/TicketForm";
import ConfirmDialog from "./components/common/ConfirmDialog";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import type { Ticket } from "./types/ticket";

export default function App() {
  const { fetchTags, deleteTicket } = useTicketStore();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [deletingTicket, setDeletingTicket] = useState<Ticket | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleNewTicket = useCallback(() => {
    setEditingTicket(null);
    setIsFormOpen(true);
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  // 键盘快捷键支持
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K: Focus search
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }

      // N: New ticket (only when not in input/textarea)
      if (e.key === "n" && !e.ctrlKey && !e.metaKey) {
        const target = e.target as HTMLElement;
        if (
          target.tagName !== "INPUT" &&
          target.tagName !== "TEXTAREA" &&
          !target.isContentEditable
        ) {
          handleNewTicket();
        }
      }

      // Escape: Close modals/sidebar
      if (e.key === "Escape") {
        if (isFormOpen) {
          setIsFormOpen(false);
        }
        if (isSidebarOpen) {
          setIsSidebarOpen(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFormOpen, isSidebarOpen, handleNewTicket]);

  const handleEditTicket = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setIsFormOpen(true);
  };

  const handleDeleteTicket = (ticket: Ticket) => {
    setDeletingTicket(ticket);
  };

  const confirmDelete = async () => {
    if (!deletingTicket) return;

    try {
      await deleteTicket(deletingTicket.id);
      toast.success("Ticket 已删除");
      setDeletingTicket(null);
    } catch {
      toast.error("删除 Ticket 失败");
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <Header
        onNewTicket={handleNewTicket}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        searchInputRef={searchInputRef}
      />

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-apple z-20 lg:hidden transition-apple"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex">
        <FilterSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <main className="flex-1 p-6 md:p-8 lg:p-12 lg:ml-0 w-full">
          <TicketList onEdit={handleEditTicket} onDelete={handleDeleteTicket} />
        </main>
      </div>

      <TicketForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        ticket={editingTicket}
      />

      <ConfirmDialog
        open={!!deletingTicket}
        onOpenChange={(open) => !open && setDeletingTicket(null)}
        title="删除 Ticket"
        description={`确定要删除 "${deletingTicket?.title}" 吗？此操作无法撤销。`}
        onConfirm={confirmDelete}
        confirmText="删除"
        cancelText="取消"
      />

      <Toaster />
    </div>
  );
}
