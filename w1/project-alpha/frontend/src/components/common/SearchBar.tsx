import { useEffect, useState, forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useTicketStore } from "@/store/useTicketStore";
import { useDebouncedCallback } from "use-debounce";

interface SearchBarProps {
  inputRef?: React.Ref<HTMLInputElement>;
}

const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  (_props, ref) => {
    const { searchQuery, setSearchQuery, fetchTickets } = useTicketStore();
    const [localQuery, setLocalQuery] = useState(searchQuery);

    const debouncedSearch = useDebouncedCallback((value: string) => {
      setSearchQuery(value);
      fetchTickets();
    }, 300);

    useEffect(() => {
      setLocalQuery(searchQuery);
    }, [searchQuery]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setLocalQuery(value);
      debouncedSearch(value);
    };

    const handleClear = () => {
      setLocalQuery("");
      setSearchQuery("");
      fetchTickets();
    };

    return (
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#86868b] pointer-events-none" />
        <Input
          ref={ref}
          type="text"
          placeholder="搜索 Ticket... (Ctrl+K)"
          value={localQuery}
          onChange={handleChange}
          className="pl-11 pr-11 h-11 rounded-full border-0 bg-[#f5f5f7] text-[15px] placeholder:text-[#86868b] focus:bg-white focus:shadow-apple transition-apple focus:ring-2 focus:ring-[#0071e3]/20"
        />
        {localQuery && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#86868b] hover:text-[#1d1d1f] transition-apple rounded-full p-1 hover:bg-black/5"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  },
);

SearchBar.displayName = "SearchBar";

export default SearchBar;
