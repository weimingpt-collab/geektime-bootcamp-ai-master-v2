import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import type { Tag } from "@/types/tag";

interface TagBadgeProps {
  tag: Tag;
  removable?: boolean;
  onRemove?: () => void;
}

export default function TagBadge({
  tag,
  removable = false,
  onRemove,
}: TagBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-medium transition-apple hover:opacity-80 border-0"
      style={{
        backgroundColor: tag.color + "15",
        color: tag.color,
      }}
    >
      <div
        className="h-2 w-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: tag.color }}
      />
      <span>{tag.name}</span>
      {removable && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 hover:opacity-70 transition-apple rounded-full p-0.5"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </Badge>
  );
}
