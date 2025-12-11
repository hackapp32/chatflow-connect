import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

export interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
}

interface ChatSidebarProps {
  conversations: Conversation[];
  activeId: string;
  onSelect: (id: string) => void;
}

const ChatSidebar = ({ conversations, activeId, onSelect }: ChatSidebarProps) => {
  return (
    <aside className="w-80 bg-chat-sidebar border-r border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h1 className="text-xl font-semibold text-foreground mb-4">Messages</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full bg-input rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin py-2">
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 transition-all hover:bg-chat-active",
              activeId === conv.id && "bg-chat-active"
            )}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-foreground font-medium">
                {conv.avatar ? (
                  <img src={conv.avatar} alt={conv.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  conv.name.charAt(0).toUpperCase()
                )}
              </div>
              {conv.online && (
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-online rounded-full border-2 border-chat-sidebar" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-medium text-foreground truncate">{conv.name}</span>
                <span className="text-xs text-muted-foreground flex-shrink-0">{conv.timestamp}</span>
              </div>
              <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
            </div>

            {/* Unread Badge */}
            {conv.unread > 0 && (
              <span className="flex-shrink-0 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-xs font-medium text-primary-foreground">
                {conv.unread}
              </span>
            )}
          </button>
        ))}
      </div>
    </aside>
  );
};

export default ChatSidebar;
