import { useState, useRef } from "react";
import { Paperclip, Smile, Send, X, Image, FileText } from "lucide-react";

export interface Attachment {
  id: string;
  file: File;
  preview?: string;
  type: "image" | "file";
}

interface ChatInputProps {
  onSend: (message: string, attachments: Attachment[]) => void;
}

const ChatInput = ({ onSend }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() || attachments.length > 0) {
      onSend(message.trim(), attachments);
      setMessage("");
      setAttachments([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    const newAttachments: Attachment[] = files.map((file) => {
      const isImage = file.type.startsWith("image/");
      return {
        id: `${Date.now()}-${Math.random()}`,
        file,
        preview: isImage ? URL.createObjectURL(file) : undefined,
        type: isImage ? "image" : "file",
      };
    });

    setAttachments((prev) => [...prev, ...newAttachments]);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => {
      const attachment = prev.find((a) => a.id === id);
      if (attachment?.preview) {
        URL.revokeObjectURL(attachment.preview);
      }
      return prev.filter((a) => a.id !== id);
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-card/50">
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3 p-3 bg-secondary/50 rounded-lg">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="relative group"
            >
              {attachment.type === "image" ? (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted">
                  <img
                    src={attachment.preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
                  <FileText className="w-5 h-5 text-primary" />
                  <div className="max-w-[120px]">
                    <p className="text-xs text-foreground truncate">{attachment.file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(attachment.file.size)}</p>
                  </div>
                </div>
              )}
              <button
                type="button"
                onClick={() => removeAttachment(attachment.id)}
                className="absolute -top-2 -right-2 w-5 h-5 bg-destructive rounded-full flex items-center justify-center text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-3">
        {/* Action Buttons */}
        <div className="flex gap-1">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.txt,.zip"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <button
            type="button"
            className="p-2.5 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
          >
            <Smile className="w-5 h-5" />
          </button>
        </div>

        {/* Input */}
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="w-full bg-input rounded-2xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-all text-sm"
            style={{ maxHeight: "120px" }}
          />
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!message.trim() && attachments.length === 0}
          className="p-3 bg-primary rounded-full text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
};

export default ChatInput;
