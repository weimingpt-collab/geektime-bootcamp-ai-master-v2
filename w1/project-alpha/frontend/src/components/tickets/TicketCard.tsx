import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import type { Ticket } from "@/types/ticket";
import TagBadge from "@/components/tags/TagBadge";
import { cn } from "@/lib/utils";

interface TicketCardProps {
  ticket: Ticket;
  onEdit: (ticket: Ticket) => void;
  onDelete: (ticket: Ticket) => void;
  onToggleComplete: (ticket: Ticket) => void;
  onRemoveTag?: (ticketId: number, tagId: number) => void;
  isSelected?: boolean;
  onSelect?: (ticketId: number, selected: boolean) => void;
  showCheckbox?: boolean;
}

export default function TicketCard({
  ticket,
  onEdit,
  onDelete,
  onToggleComplete,
  onRemoveTag,
  isSelected = false,
  onSelect,
  showCheckbox = false,
}: TicketCardProps) {
  const isCompleted = ticket.status === "completed";

  return (
    <Card
      className={cn(
        "p-6 transition-apple border-0 shadow-apple hover:shadow-apple-hover bg-white rounded-2xl",
        isCompleted && "opacity-75",
        isSelected && "ring-2 ring-[#0071e3] ring-offset-2",
      )}
    >
      <div className="flex items-start gap-4">
        {showCheckbox && onSelect ? (
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) =>
              onSelect(ticket.id, checked as boolean)
            }
            className="mt-0.5 h-5 w-5"
          />
        ) : (
          <Checkbox
            checked={isCompleted}
            onCheckedChange={() => onToggleComplete(ticket)}
            className="mt-0.5 h-5 w-5 transition-apple"
          />
        )}

        <div className="flex-1 py-3 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <h3
              className={cn(
                "text-xl font-semibold text-[#1d1d1f] leading-tight",
                isCompleted && "line-through text-[#86868b]",
              )}
            >
              {ticket.title}
            </h3>

            <div className="flex gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(ticket)}
                className="h-9 w-9 rounded-full transition-apple hover:bg-black/5 text-[#1d1d1f]"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(ticket)}
                className="h-9 w-9 rounded-full transition-apple hover:bg-red-50 text-[#ff3b30] hover:text-[#ff453a]"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {ticket.description && (
            <p className="text-[15px] text-[#86868b] leading-relaxed line-clamp-2">
              {ticket.description}
            </p>
          )}

          {ticket.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {ticket.tags.map((tag) => (
                <TagBadge
                  key={tag.id}
                  tag={tag}
                  removable={!isCompleted}
                  onRemove={
                    onRemoveTag
                      ? () => onRemoveTag(ticket.id, tag.id)
                      : undefined
                  }
                />
              ))}
            </div>
          )}

          <div className="flex items-center gap-6 text-[13px] text-[#86868b] pt-2">
            <span>
              创建于 {format(new Date(ticket.created_at), "yyyy-MM-dd HH:mm")}
            </span>
            {ticket.completed_at && (
              <span>
                完成于{" "}
                {format(new Date(ticket.completed_at), "yyyy-MM-dd HH:mm")}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
