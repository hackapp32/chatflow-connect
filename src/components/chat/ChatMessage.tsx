import { cn } from "@/lib/utils";
import { Check, CheckCheck, FileText, Download } from "lucide-react";

export interface MessageAttachment {
  id: string;
  name: string;
  size: number;
  type: "image" | "file";
  url: string;
}

export interface Message {
  id: string;
  content: string;
  timestamp: string;
  sender: "me" | "other";
  read?: boolean;
  attachments?: MessageAttachment[];
}

interface ChatMessageProps {
  message: Message;
  showAvatar?: boolean;
  senderName?: string;
}

const ChatMessage = ({ message, showAvatar = false, senderName }: ChatMessageProps) => {
  const isMe = message.sender === "me";

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const hasAttachments = message.attachments && message.attachments.length > 0;
  const hasContent = message.content.trim().length > 0;

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

      {/* Message Container */}
      <div className={cn("max-w-[70%] flex flex-col gap-2", isMe ? "items-end" : "items-start")}>
        {/* Attachments */}
        {hasAttachments && (
          <div className={cn("flex flex-col gap-2", isMe ? "items-end" : "items-start")}>
            {/* Images Grid */}
            {message.attachments!.filter((a) => a.type === "image").length > 0 && (
              <div className={cn(
                "grid gap-1 rounded-2xl overflow-hidden",
                message.attachments!.filter((a) => a.type === "image").length === 1 
                  ? "grid-cols-1" 
                  : "grid-cols-2"
              )}>
                {message.attachments!
                  .filter((a) => a.type === "image")
                  .map((attachment) => (
                    <a
                      key={attachment.id}
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block relative group"
                    >
                      <img
                        src={attachment.url}
                        alt={attachment.name}
                        className="max-w-[280px] max-h-[280px] object-cover rounded-lg hover:opacity-90 transition-opacity"
                      />
                    </a>
                  ))}
              </div>
            )}

            {/* Files */}
            {message.attachments!
              .filter((a) => a.type === "file")
              .map((attachment) => (
                <a
                  key={attachment.id}
                  href={attachment.url}
                  download={attachment.name}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors",
                    isMe
                      ? "bg-chat-sent/80 hover:bg-chat-sent text-primary-foreground"
                      : "bg-chat-received hover:bg-chat-received/80 text-foreground"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    isMe ? "bg-primary-foreground/20" : "bg-primary/20"
                  )}>
                    <FileText className={cn("w-5 h-5", isMe ? "text-primary-foreground" : "text-primary")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{attachment.name}</p>
                    <p className={cn("text-xs", isMe ? "text-primary-foreground/70" : "text-muted-foreground")}>
                      {formatFileSize(attachment.size)}
                    </p>
                  </div>
                  <Download className={cn("w-4 h-4", isMe ? "text-primary-foreground/70" : "text-muted-foreground")} />
                </a>
              ))}
          </div>
        )}

        {/* Text Content */}
        {hasContent && (
          <div
            className={cn(
              "px-4 py-2.5 rounded-2xl",
              isMe
                ? "bg-chat-sent text-primary-foreground rounded-br-md"
                : "bg-chat-received text-foreground rounded-bl-md"
            )}
          >
            <p className="text-sm leading-relaxed break-words">{message.content}</p>
          </div>
        )}

        {/* Timestamp */}
        <div
          className={cn(
            "flex items-center gap-1 px-1",
            isMe ? "justify-end" : "justify-start"
          )}
        >
          <span className="text-xs text-muted-foreground">
            {message.timestamp}
          </span>
          {isMe && (
            message.read ? (
              <CheckCheck className="w-3.5 h-3.5 text-primary" />
            ) : (
              <Check className="w-3.5 h-3.5 text-muted-foreground" />
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
