import { useState, useEffect } from "react";
import { useTicketStore } from "@/store/useTicketStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Plus } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface TagSelectorProps {
  selectedTagIds: number[];
  onChange: (tagIds: number[]) => void;
}

export default function TagSelector({
  selectedTagIds,
  onChange,
}: TagSelectorProps) {
  const { tags, fetchTags } = useTicketStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const selectedTags = tags.filter((tag) => selectedTagIds.includes(tag.id));
  const availableTags = tags.filter(
    (tag) =>
      !selectedTagIds.includes(tag.id) &&
      tag.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleAddTag = (tagId: number) => {
    onChange([...selectedTagIds, tagId]);
    setSearchQuery("");
  };

  const handleRemoveTag = (tagId: number) => {
    onChange(selectedTagIds.filter((id) => id !== tagId));
  };

  return (
    <div className="py-3">
      <Label className="text-[15px] font-medium text-[#1d1d1f]">标签</Label>

      {/* Selected Tags */}
      <div className="flex flex-wrap gap-2 min-h-[48px] p-3 border-0 rounded-xl bg-[#f5f5f7] focus-within:bg-white focus-within:shadow-apple transition-apple">
        {selectedTags.map((tag) => (
          <Badge
            key={tag.id}
            variant="secondary"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-medium border-0 transition-apple hover:opacity-80"
            style={{
              backgroundColor: tag.color + "15",
              color: tag.color,
            }}
          >
            <div
              className="flex-shrink-0 w-2 h-2 rounded-full"
              style={{ backgroundColor: tag.color }}
            />
            <span>{tag.name}</span>
            <button
              onClick={() => handleRemoveTag(tag.id)}
              className="ml-0.5 hover:opacity-70 transition-apple rounded-full p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}

        {/* Add Tag Popover */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 rounded-full border-black/10 text-[#0071e3] hover:text-[#0077ed] hover:bg-[#0071e3]/10 transition-apple"
            >
              <Plus className="mr-1 w-3 h-3" />
              添加标签
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="p-4 w-64 rounded-xl border-0 shadow-apple"
            align="start"
          >
            <div className="py-3">
              <Input
                placeholder="搜索标签..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="h-10 rounded-xl border-black/10 bg-[#f5f5f7] text-[15px] focus:bg-white focus:shadow-apple transition-apple"
              />

              <div className="overflow-y-auto py-1 max-h-48">
                {availableTags.length > 0 ? (
                  availableTags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => {
                        handleAddTag(tag.id);
                        setOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-black/5 text-[15px] font-medium text-[#1d1d1f] transition-apple"
                    >
                      <div
                        className="flex-shrink-0 w-3 h-3 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span>{tag.name}</span>
                    </button>
                  ))
                ) : (
                  <p className="text-[15px] text-[#86868b] text-center py-4">
                    没有找到标签
                  </p>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
