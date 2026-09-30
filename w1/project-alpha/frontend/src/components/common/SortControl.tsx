import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTicketStore } from "@/store/useTicketStore";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SortControl() {
  const { sortField, sortOrder, setSortField, setSortOrder } = useTicketStore();

  return (
    <div className="flex items-center gap-2">
      <Select
        value={sortField}
        onValueChange={(value: "created_at" | "updated_at" | "title") =>
          setSortField(value)
        }
      >
        <SelectTrigger className="w-[140px] h-10 rounded-xl border-black/10 bg-white text-[15px] font-medium transition-apple hover:bg-black/5">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="rounded-xl border-0 shadow-apple">
          <SelectItem value="created_at" className="text-[15px]">
            创建时间
          </SelectItem>
          <SelectItem value="updated_at" className="text-[15px]">
            更新时间
          </SelectItem>
          <SelectItem value="title" className="text-[15px]">
            标题
          </SelectItem>
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
        className="h-10 w-10 rounded-xl border-black/10 hover:bg-black/5 transition-apple"
      >
        {sortOrder === "asc" ? (
          <ArrowUp className="h-4 w-4" />
        ) : (
          <ArrowDown className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
