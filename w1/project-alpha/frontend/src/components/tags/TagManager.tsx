import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTicketStore } from "@/store/useTicketStore";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { generateRandomColor } from "@/lib/colorUtils";

export default function TagManager() {
  const { tags, createTag, deleteTag } = useTicketStore();
  const [isOpen, setIsOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      toast.error("请输入标签名称");
      return;
    }

    if (
      tags.some((tag) => tag.name.toLowerCase() === newTagName.toLowerCase())
    ) {
      toast.error("标签已存在");
      return;
    }

    setIsCreating(true);
    try {
      await createTag({
        name: newTagName.trim(),
        color: generateRandomColor(),
      });
      setNewTagName("");
      toast.success("标签创建成功");
    } catch {
      toast.error("创建标签失败");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteTag = async (tagId: number, tagName: string) => {
    if (
      !confirm(
        `确定要删除标签 "${tagName}" 吗？这将从所有关联的 Ticket 中移除该标签。`,
      )
    ) {
      return;
    }

    try {
      await deleteTag(tagId);
      toast.success("标签已删除");
    } catch {
      toast.error("删除标签失败");
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="default"
        onClick={() => setIsOpen(true)}
        className="gap-2 h-10 px-4 rounded-full border-black/10 text-[#1d1d1f] font-medium hover:bg-black/5 transition-apple"
      >
        <Plus className="h-4 w-4" />
        管理标签
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl border-0 shadow-xl p-0">
          <DialogHeader className="px-8 pt-8 pb-6">
            <DialogTitle className="text-2xl font-semibold text-[#1d1d1f]">
              标签管理
            </DialogTitle>
          </DialogHeader>

          <div className="py-6 px-8 pb-8">
            {/* Create New Tag */}
            <div className="py-3">
              <Label className="text-[15px] font-medium text-[#1d1d1f]">
                创建新标签
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="输入标签名称"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleCreateTag();
                    }
                  }}
                  maxLength={50}
                  className="h-12 rounded-xl border-black/10 bg-[#f5f5f7] text-[15px] focus:bg-white focus:shadow-apple transition-apple flex-1"
                />
                <Button
                  onClick={handleCreateTag}
                  disabled={isCreating || !newTagName.trim()}
                  className="h-12 px-6 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white font-medium shadow-sm hover:shadow-md transition-apple"
                >
                  {isCreating ? "创建中..." : "创建"}
                </Button>
              </div>
            </div>

            {/* Tags List */}
            <div className="py-3">
              <Label className="text-[15px] font-medium text-[#1d1d1f]">
                现有标签 ({tags.length})
              </Label>
              <div className="max-h-64 overflow-y-auto py-2 border-0 rounded-xl bg-[#f5f5f7] p-4">
                {tags.length === 0 ? (
                  <p className="text-[15px] text-[#86868b] text-center py-8">
                    暂无标签
                  </p>
                ) : (
                  tags.map((tag) => (
                    <div
                      key={tag.id}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-white transition-apple"
                    >
                      <Badge
                        variant="secondary"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-medium border-0"
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
                        {tag.ticket_count !== undefined && (
                          <span className="text-xs ml-1 opacity-70">
                            ({tag.ticket_count})
                          </span>
                        )}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTag(tag.id, tag.name)}
                        className="h-9 w-9 rounded-full text-[#ff3b30] hover:text-[#ff453a] hover:bg-red-50 transition-apple"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
