import { useState, useRef, useEffect } from "react";
import { Smile, Send, X, Image, FileText, MapPin, Folder, AppWindow, File, Plus, Mic, Square, Zap } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

export interface Attachment {
  id: string;
  file?: File;
  preview?: string;
  type: "image" | "file" | "document" | "location" | "folder" | "app" | "voice";
  name?: string;
  location?: { lat: number; lng: number; address: string };
  duration?: number;
}

interface ChatInputProps {
  onSend: (message: string, attachments: Attachment[]) => void;
}

const ChatInput = ({ onSend }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        
        const newAttachment: Attachment = {
          id: `${Date.now()}-${Math.random()}`,
          file: audioBlob as unknown as File,
          type: "voice",
          name: `voice-${Date.now()}.webm`,
          duration: recordingDuration,
          preview: URL.createObjectURL(audioBlob),
        };
        
        setAttachments((prev) => [...prev, newAttachment]);
        setRecordingDuration(0);
        
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Unable to access microphone. Please check your browser permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
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

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleEmojiSelect = (emoji: { native: string }) => {
    setMessage((prev) => prev + emoji.native);
    setIsEmojiPickerOpen(false);
  };

  const getAttachmentIcon = (type: Attachment["type"]) => {
    switch (type) {
      case "image":
        return <Image className="w-5 h-5 text-primary" />;
      case "document":
        return <FileText className="w-5 h-5 text-neon-yellow" />;
      case "location":
        return <MapPin className="w-5 h-5 text-destructive" />;
      case "folder":
        return <Folder className="w-5 h-5 text-neon-cyan" />;
      case "app":
        return <AppWindow className="w-5 h-5 text-neon-purple" />;
      case "voice":
        return <Mic className="w-5 h-5 text-online" />;
      default:
        return <File className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-border/50 glass-cyber">
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
        <div className="flex flex-wrap gap-2 mb-3 p-3 bg-muted/30 rounded-lg border border-border/30">
          {attachments.map((attachment) => (
            <div key={attachment.id} className="relative group">
              {attachment.type === "image" && attachment.preview ? (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted border border-primary/30">
                  <img
                    src={attachment.preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : attachment.type === "location" ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border border-destructive/30">
                  <MapPin className="w-5 h-5 text-destructive" />
                  <div className="max-w-[120px]">
                    <p className="text-xs text-foreground font-semibold">Location</p>
                    <p className="text-xs text-muted-foreground truncate font-mono">
                      {attachment.location?.address}
                    </p>
                  </div>
                </div>
              ) : attachment.type === "voice" ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border border-online/30">
                  <Mic className="w-5 h-5 text-online" />
                  <div className="max-w-[120px]">
                    <p className="text-xs text-foreground font-semibold">Voice message</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {formatDuration(attachment.duration || 0)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border border-border/30">
                  {getAttachmentIcon(attachment.type)}
                  <div className="max-w-[120px]">
                    <p className="text-xs text-foreground truncate font-semibold">
                      {attachment.name || attachment.file?.name || attachment.type}
                    </p>
                    {attachment.file && (
                      <p className="text-xs text-muted-foreground font-mono">
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

      {/* Recording Indicator */}
      {isRecording && (
        <div className="flex items-center gap-3 mb-3 p-3 bg-destructive/10 rounded-lg border border-destructive/30">
          <div className="w-3 h-3 bg-destructive rounded-full animate-pulse" />
          <span className="text-sm text-foreground font-mono">REC... {formatDuration(recordingDuration)}</span>
          <button
            type="button"
            onClick={stopRecording}
            className="ml-auto p-2 bg-destructive rounded-lg text-destructive-foreground hover:bg-destructive/90 transition-colors"
          >
            <Square className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-3">
        {/* Attachment Menu */}
        <div className="flex gap-1">
          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="p-2.5 rounded-lg hover:bg-secondary/50 transition-all text-muted-foreground hover:text-secondary hover:neon-border-cyan"
              >
                <Plus className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 glass-cyber">
              <DropdownMenuItem onClick={() => documentInputRef.current?.click()} className="hover:bg-neon-yellow/10">
                <FileText className="w-4 h-4 mr-2 text-neon-yellow" />
                <span className="font-semibold">Document</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => imageInputRef.current?.click()} className="hover:bg-secondary/20">
                <Image className="w-4 h-4 mr-2 text-secondary" />
                <span className="font-semibold">Photos & Videos</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLocationShare} className="hover:bg-destructive/10">
                <MapPin className="w-4 h-4 mr-2 text-destructive" />
                <span className="font-semibold">Location</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => fileInputRef.current?.click()} className="hover:bg-primary/10">
                <File className="w-4 h-4 mr-2 text-primary" />
                <span className="font-semibold">File</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => folderInputRef.current?.click()} className="hover:bg-neon-cyan/10">
                <Folder className="w-4 h-4 mr-2 text-neon-cyan" />
                <span className="font-semibold">Folder</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleAppShare} className="hover:bg-neon-purple/10">
                <AppWindow className="w-4 h-4 mr-2 text-neon-purple" />
                <span className="font-semibold">App</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Emoji Picker */}
          <Popover open={isEmojiPickerOpen} onOpenChange={setIsEmojiPickerOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="p-2.5 rounded-lg hover:bg-secondary/50 transition-all text-muted-foreground hover:text-neon-yellow"
              >
                <Smile className="w-5 h-5" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-none" align="start">
              <Picker
                data={data}
                onEmojiSelect={handleEmojiSelect}
                theme="dark"
                previewPosition="none"
                skinTonePosition="none"
              />
            </PopoverContent>
          </Popover>

          {/* Voice Recording Button */}
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-2.5 rounded-lg transition-all ${
              isRecording 
                ? "bg-destructive text-destructive-foreground animate-pulse" 
                : "hover:bg-online/20 text-muted-foreground hover:text-online"
            }`}
          >
            {isRecording ? <Square className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
        </div>

        {/* Input */}
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter transmission..."
            rows={1}
            className="w-full bg-input/80 border border-border/50 rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:neon-border resize-none transition-all text-sm"
            style={{ maxHeight: "120px" }}
          />
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!message.trim() && attachments.length === 0}
          className="p-3 bg-gradient-to-r from-primary to-accent rounded-lg text-primary-foreground hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 neon-border animate-glow"
        >
          <Zap className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
};

export default ChatInput;
