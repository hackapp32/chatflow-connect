import { Phone, Video, MoreVertical, Shield, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ChatHeaderProps {
  name: string;
  avatar?: string;
  online: boolean;
  onVoiceCall: () => void;
  onVideoCall: () => void;
}

const ChatHeader = ({ name, avatar, online, onVoiceCall, onVideoCall }: ChatHeaderProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('app_user_id');
    localStorage.removeItem('app_username');
    navigate('/login');
  };

  return (
    <header className="px-6 py-4 border-b border-border/50 glass-cyber flex items-center justify-between relative overflow-hidden">
      {/* Scanline effect */}
      <div className="absolute inset-0 cyber-scanline pointer-events-none" />
      
      <div className="flex items-center gap-3 relative z-10">
        {/* Avatar */}
        <div className="relative">
          <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-secondary/30 to-accent/20 flex items-center justify-center text-foreground font-cyber font-bold border border-secondary/50">
            {avatar ? (
              <img src={avatar} alt={name} className="w-full h-full rounded-lg object-cover" />
            ) : (
              <span className="neon-text-cyan">{name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          {online && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-online rounded-full border-2 border-card animate-pulse" />
          )}
        </div>

        {/* Info */}
        <div>
          <h2 className="font-cyber font-bold text-foreground tracking-wide">{name}</h2>
          <p className="text-xs text-muted-foreground font-mono">
            {online ? (
              <span className="text-online flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-online rounded-full animate-pulse" />
                CONNECTED
              </span>
            ) : (
              "OFFLINE"
            )}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 relative z-10">
        <button 
          onClick={onVoiceCall}
          className="p-2.5 rounded-lg hover:bg-secondary/50 transition-all text-muted-foreground hover:text-secondary hover:neon-border-cyan"
        >
          <Phone className="w-5 h-5" />
        </button>
        <button 
          onClick={onVideoCall}
          className="p-2.5 rounded-lg hover:bg-secondary/50 transition-all text-muted-foreground hover:text-secondary hover:neon-border-cyan"
        >
          <Video className="w-5 h-5" />
        </button>
        <button className="p-2.5 rounded-lg hover:bg-secondary/50 transition-all text-muted-foreground hover:text-secondary hover:neon-border-cyan">
          <Shield className="w-5 h-5" />
        </button>
        <button className="p-2.5 rounded-lg hover:bg-secondary/50 transition-all text-muted-foreground hover:text-secondary hover:neon-border-cyan">
          <MoreVertical className="w-5 h-5" />
        </button>
        <button 
          onClick={handleLogout}
          className="p-2.5 rounded-lg hover:bg-destructive/50 transition-all text-muted-foreground hover:text-destructive"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default ChatHeader;
