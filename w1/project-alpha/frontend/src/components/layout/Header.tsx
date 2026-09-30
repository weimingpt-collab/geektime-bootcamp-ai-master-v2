import { Button } from "@/components/ui/button";
import { Plus, Menu } from "lucide-react";
import SearchBar from "@/components/common/SearchBar";
import TagManager from "@/components/tags/TagManager";

interface HeaderProps {
  onNewTicket: () => void;
  onToggleSidebar?: () => void;
  searchInputRef?: React.Ref<HTMLInputElement>;
}

export default function Header({
  onNewTicket,
  onToggleSidebar,
  searchInputRef,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 backdrop-apple bg-white/80 border-b border-black/5">
      <div className="container mx-auto flex h-20 items-center justify-between px-6 md:px-8 lg:px-12">
        <div className="flex items-center gap-6">
          {onToggleSidebar && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              className="lg:hidden h-10 w-10 transition-apple hover:bg-black/5"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-[#1d1d1f]">
            Project Alpha
          </h1>
        </div>

        <div className="flex-1 max-w-lg mx-8 hidden md:block">
          <SearchBar inputRef={searchInputRef} />
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <TagManager />
          </div>
          <Button
            onClick={onNewTicket}
            size="default"
            className="gap-2 h-10 px-5 bg-[#0071e3] hover:bg-[#0077ed] text-white font-medium rounded-full transition-apple shadow-sm hover:shadow-md"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">新建 Ticket</span>
            <span className="sm:hidden">新建</span>
          </Button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden px-6 pb-4 pt-2">
        <SearchBar inputRef={searchInputRef} />
      </div>
    </header>
  );
}
