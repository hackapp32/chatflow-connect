import { Phone, Video, MoreVertical } from "lucide-react";

interface ChatHeaderProps {
  name: string;
  avatar?: string;
  online: boolean;
  onVoiceCall: () => void;
  onVideoCall: () => void;
}

const ChatHeader = ({ name, avatar, online, onVoiceCall, onVideoCall }: ChatHeaderProps) => {
  return (
    <header className="px-6 py-4 border-b border-border bg-card/50 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground font-medium">
            {avatar ? (
              <img src={avatar} alt={name} className="w-full h-full rounded-full object-cover" />
            ) : (
              name.charAt(0).toUpperCase()
            )}
          </div>
          {online && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-online rounded-full border-2 border-card" />
          )}
        </div>

        {/* Info */}
        <div>
          <h2 className="font-semibold text-foreground">{name}</h2>
          <p className="text-xs text-muted-foreground">
            {online ? (
              <span className="text-online">Online</span>
            ) : (
              "Last seen recently"
            )}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button 
          onClick={onVoiceCall}
          className="p-2.5 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
        >
          <Phone className="w-5 h-5" />
        </button>
        <button 
          onClick={onVideoCall}
          className="p-2.5 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
        >
          <Video className="w-5 h-5" />
        </button>
        <button className="p-2.5 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default ChatHeader;
