import { cn } from "@/lib/utils";
import { Check, CheckCheck } from "lucide-react";

export interface Message {
  id: string;
  content: string;
  timestamp: string;
  sender: "me" | "other";
  read?: boolean;
}

interface ChatMessageProps {
  message: Message;
  showAvatar?: boolean;
  senderName?: string;
}

const ChatMessage = ({ message, showAvatar = false, senderName }: ChatMessageProps) => {
  const isMe = message.sender === "me";

  return (
    <div
      className={cn(
        "flex gap-3 message-enter",
        isMe ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      {showAvatar && !isMe && (
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-foreground text-sm font-medium flex-shrink-0 mt-auto">
          {senderName?.charAt(0).toUpperCase() || "?"}
        </div>
      )}

      {/* Message Bubble */}
      <div
        className={cn(
          "max-w-[70%] px-4 py-2.5 rounded-2xl",
          isMe
            ? "bg-chat-sent text-primary-foreground rounded-br-md"
            : "bg-chat-received text-foreground rounded-bl-md"
        )}
      >
        <p className="text-sm leading-relaxed break-words">{message.content}</p>
        <div
          className={cn(
            "flex items-center gap-1 mt-1",
            isMe ? "justify-end" : "justify-start"
          )}
        >
          <span
            className={cn(
              "text-xs",
              isMe ? "text-primary-foreground/70" : "text-muted-foreground"
            )}
          >
            {message.timestamp}
          </span>
          {isMe && (
            message.read ? (
              <CheckCheck className="w-3.5 h-3.5 text-primary-foreground/70" />
            ) : (
              <Check className="w-3.5 h-3.5 text-primary-foreground/70" />
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
