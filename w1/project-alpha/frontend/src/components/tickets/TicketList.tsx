import { useEffect, useState } from "react";
import { useTicketStore } from "@/store/useTicketStore";
import TicketCard from "./TicketCard";
import BatchActions from "./BatchActions";
import SortControl from "@/components/common/SortControl";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Inbox } from "lucide-react";
import type { Ticket } from "@/types/ticket";

interface TicketListProps {
  onEdit: (ticket: Ticket) => void;
  onDelete: (ticket: Ticket) => void;
}

export default function TicketList({ onEdit, onDelete }: TicketListProps) {
  const {
    tickets,
    isLoading,
    error,
    fetchTickets,
    toggleComplete,
    removeTagFromTicket,
  } = useTicketStore();

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBatchMode, setIsBatchMode] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  if (isLoading) {
    return (
      <div className="py-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 w-full rounded-2xl bg-white/50" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="rounded-full bg-red-50 p-4 mb-6">
          <AlertCircle className="h-8 w-8 text-[#ff3b30]" />
        </div>
        <p className="text-xl font-semibold text-[#1d1d1f] mb-2">加载失败</p>
        <p className="text-[15px] text-[#86868b]">{error}</p>
      </div>
    );
  }

  const handleSelect = (ticketId: number, selected: boolean) => {
    if (selected) {
      setSelectedIds([...selectedIds, ticketId]);
    } else {
      setSelectedIds(selectedIds.filter((id) => id !== ticketId));
    }
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
    setIsBatchMode(false);
  };

  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="rounded-full bg-[#f5f5f7] p-6 mb-6">
          <Inbox className="h-12 w-12 text-[#86868b]" />
        </div>
        <p className="text-xl font-semibold text-[#1d1d1f] mb-2">暂无 Ticket</p>
        <p className="text-[15px] text-[#86868b]">
          点击右上角按钮创建新的 Ticket
        </p>
      </div>
    );
  }

  return (
    <div className="py-6 max-w-4xl mx-auto">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {!isBatchMode && (
            <button
              onClick={() => setIsBatchMode(true)}
              className="text-[15px] text-[#0071e3] hover:text-[#0077ed] font-medium transition-apple"
            >
              批量操作
            </button>
          )}
        </div>
        <SortControl />
      </div>

      {/* Batch Actions */}
      {isBatchMode && (
        <BatchActions
          selectedIds={selectedIds}
          onClearSelection={handleClearSelection}
        />
      )}

      {/* Ticket List */}
      <div className="py-3">
        {tickets.map((ticket) => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleComplete={(t) => toggleComplete(t.id)}
            onRemoveTag={removeTagFromTicket}
            isSelected={selectedIds.includes(ticket.id)}
            onSelect={isBatchMode ? handleSelect : undefined}
            showCheckbox={isBatchMode}
          />
        ))}
      </div>
    </div>
  );
}
