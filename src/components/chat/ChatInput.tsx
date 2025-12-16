import { useState, useRef } from "react";
import { Paperclip, Smile, Send, X, Image, FileText, MapPin, Folder, AppWindow, File, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface Attachment {
  id: string;
  file?: File;
  preview?: string;
  type: "image" | "file" | "document" | "location" | "folder" | "app";
  name?: string;
  location?: { lat: number; lng: number; address: string };
}

interface ChatInputProps {
  onSend: (message: string, attachments: Attachment[]) => void;
}

const ChatInput = ({ onSend }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, attachmentType: Attachment["type"]) => {
    const files = Array.from(e.target.files || []);
    
    const newAttachments: Attachment[] = files.map((file) => {
      const isImage = file.type.startsWith("image/");
      return {
        id: `${Date.now()}-${Math.random()}`,
        file,
        preview: isImage ? URL.createObjectURL(file) : undefined,
        type: attachmentType === "image" ? "image" : (isImage ? "image" : attachmentType),
        name: file.name,
      };
    });

    setAttachments((prev) => [...prev, ...newAttachments]);
    
    // Reset input
    e.target.value = "";
  };

  const handleLocationShare = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newAttachment: Attachment = {
            id: `${Date.now()}-${Math.random()}`,
            type: "location",
            location: {
              lat: latitude,
              lng: longitude,
              address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            },
          };
          setAttachments((prev) => [...prev, newAttachment]);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Unable to get your location. Please check your browser permissions.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleAppShare = () => {
    const newAttachment: Attachment = {
      id: `${Date.now()}-${Math.random()}`,
      type: "app",
      name: "Shared App",
    };
    setAttachments((prev) => [...prev, newAttachment]);
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

  const getAttachmentIcon = (type: Attachment["type"]) => {
    switch (type) {
      case "image":
        return <Image className="w-5 h-5 text-primary" />;
      case "document":
        return <FileText className="w-5 h-5 text-orange-500" />;
      case "location":
        return <MapPin className="w-5 h-5 text-red-500" />;
      case "folder":
        return <Folder className="w-5 h-5 text-yellow-500" />;
      case "app":
        return <AppWindow className="w-5 h-5 text-purple-500" />;
      default:
        return <File className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-card/50">
      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={(e) => handleFileSelect(e, "file")}
        className="hidden"
      />
      <input
        ref={imageInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={(e) => handleFileSelect(e, "image")}
        className="hidden"
      />
      <input
        ref={documentInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf"
        onChange={(e) => handleFileSelect(e, "document")}
        className="hidden"
      />
      <input
        ref={folderInputRef}
        type="file"
        multiple
        // @ts-ignore - webkitdirectory is not in types
        webkitdirectory=""
        onChange={(e) => handleFileSelect(e, "folder")}
        className="hidden"
      />

      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3 p-3 bg-secondary/50 rounded-lg">
          {attachments.map((attachment) => (
            <div key={attachment.id} className="relative group">
              {attachment.type === "image" && attachment.preview ? (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted">
                  <img
                    src={attachment.preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : attachment.type === "location" ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
                  <MapPin className="w-5 h-5 text-red-500" />
                  <div className="max-w-[120px]">
                    <p className="text-xs text-foreground">Location</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {attachment.location?.address}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
                  {getAttachmentIcon(attachment.type)}
                  <div className="max-w-[120px]">
                    <p className="text-xs text-foreground truncate">
                      {attachment.name || attachment.file?.name || attachment.type}
                    </p>
                    {attachment.file && (
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(attachment.file.size)}
                      </p>
                    )}
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
        {/* Attachment Menu */}
        <div className="flex gap-1">
          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="p-2.5 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
              >
                <Plus className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem onClick={() => documentInputRef.current?.click()}>
                <FileText className="w-4 h-4 mr-2 text-orange-500" />
                Document
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => imageInputRef.current?.click()}>
                <Image className="w-4 h-4 mr-2 text-blue-500" />
                Photos & Videos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLocationShare}>
                <MapPin className="w-4 h-4 mr-2 text-red-500" />
                Location
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                <File className="w-4 h-4 mr-2 text-primary" />
                File
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => folderInputRef.current?.click()}>
                <Folder className="w-4 h-4 mr-2 text-yellow-500" />
                Folder
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleAppShare}>
                <AppWindow className="w-4 h-4 mr-2 text-purple-500" />
                App
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
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
