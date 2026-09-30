import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useTicketStore } from "@/store/useTicketStore";
import { toast } from "sonner";
import TagSelector from "@/components/tags/TagSelector";
import type { Ticket } from "@/types/ticket";

interface TicketFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket?: Ticket | null;
}

export default function TicketForm({
  open,
  onOpenChange,
  ticket,
}: TicketFormProps) {
  const { createTicket, updateTicket } = useTicketStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tag_ids: [] as number[],
  });

  useEffect(() => {
    if (ticket) {
      setFormData({
        title: ticket.title,
        description: ticket.description || "",
        tag_ids: ticket.tags.map((tag) => tag.id),
      });
    } else {
      setFormData({
        title: "",
        description: "",
        tag_ids: [],
      });
    }
  }, [ticket, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("请输入 Ticket 标题");
      return;
    }

    setIsSubmitting(true);

    try {
      if (ticket) {
        await updateTicket(ticket.id, {
          title: formData.title,
          description: formData.description || undefined,
        });
        toast.success("Ticket 已更新");
      } else {
        await createTicket(formData);
        toast.success("Ticket 已创建");
      }
      onOpenChange(false);
    } catch {
      toast.error(ticket ? "更新 Ticket 失败" : "创建 Ticket 失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] rounded-3xl border-0 shadow-xl p-0">
        <DialogHeader className="px-8 pt-8 pb-6">
          <DialogTitle className="text-2xl font-semibold text-[#1d1d1f]">
            {ticket ? "编辑 Ticket" : "创建 Ticket"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="py-6 px-8 pb-8">
          <div className="py-3">
            <Label
              htmlFor="title"
              className="text-[15px] font-medium text-[#1d1d1f]"
            >
              标题 *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="输入 Ticket 标题"
              maxLength={255}
              required
              className="h-12 rounded-xl border-black/10 bg-[#f5f5f7] text-[15px] focus:bg-white focus:shadow-apple transition-apple"
            />
          </div>

          <div className="py-3">
            <Label
              htmlFor="description"
              className="text-[15px] font-medium text-[#1d1d1f]"
            >
              描述
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="输入 Ticket 描述（可选）"
              rows={5}
              maxLength={10000}
              className="rounded-xl border-black/10 bg-[#f5f5f7] text-[15px] focus:bg-white focus:shadow-apple transition-apple resize-none"
            />
          </div>

          {!ticket && (
            <div className="py-3">
              <Label className="text-[15px] font-medium text-[#1d1d1f]">
                标签
              </Label>
              <TagSelector
                selectedTagIds={formData.tag_ids}
                onChange={(tag_ids) => setFormData({ ...formData, tag_ids })}
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-11 px-6 rounded-full border-black/10 text-[#1d1d1f] font-medium hover:bg-black/5 transition-apple"
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 px-6 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-medium shadow-sm hover:shadow-md transition-apple"
            >
              {isSubmitting ? "提交中..." : ticket ? "更新" : "创建"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
