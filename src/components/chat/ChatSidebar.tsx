import { cn } from "@/lib/utils";
import { Search, Zap } from "lucide-react";

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
    <aside className="w-80 bg-chat-sidebar border-r border-border/50 flex flex-col h-full relative overflow-hidden">
      {/* Cyber grid background */}
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />
      
      {/* Header */}
      <div className="p-4 border-b border-border/50 relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-primary animate-flicker" />
          <h1 className="text-xl font-cyber font-bold text-foreground neon-text">TECH BOY</h1>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search neural link..."
            className="w-full bg-input/80 border border-border/50 rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:neon-border transition-all"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin py-2 relative z-10">
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 transition-all hover:bg-chat-active/80 border-l-2 border-transparent",
              activeId === conv.id && "bg-chat-active border-l-primary neon-border"
            )}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className={cn(
                "w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-foreground font-cyber font-bold border border-border/50",
                activeId === conv.id && "border-primary/50"
              )}>
                {conv.avatar ? (
                  <img src={conv.avatar} alt={conv.name} className="w-full h-full rounded-lg object-cover" />
                ) : (
                  <span className="neon-text">{conv.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              {conv.online && (
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-online rounded-full border-2 border-chat-sidebar animate-pulse" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-semibold text-foreground truncate">{conv.name}</span>
                <span className="text-xs text-muted-foreground flex-shrink-0 font-mono">{conv.timestamp}</span>
              </div>
              <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
            </div>

            {/* Unread Badge */}
            {conv.unread > 0 && (
              <span className="flex-shrink-0 w-6 h-6 bg-primary rounded flex items-center justify-center text-xs font-cyber font-bold text-primary-foreground animate-pulse-neon">
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
