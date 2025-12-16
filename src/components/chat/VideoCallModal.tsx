import { useState, useEffect, useRef } from "react";
import { PhoneOff, Mic, MicOff, Video, VideoOff, Maximize2, Minimize2, Monitor, MonitorOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactName: string;
  contactAvatar?: string;
}

const VideoCallModal = ({ isOpen, onClose, contactName, contactAvatar }: VideoCallModalProps) => {
  const [callStatus, setCallStatus] = useState<"connecting" | "ringing" | "connected" | "ended">("connecting");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setCallStatus("connecting");
    setCallDuration(0);
    setIsMuted(false);
    setIsVideoOff(false);
    setIsScreenSharing(false);

    const connectTimer = setTimeout(() => setCallStatus("ringing"), 1000);
    const ringTimer = setTimeout(() => setCallStatus("connected"), 3000);

    return () => {
      clearTimeout(connectTimer);
      clearTimeout(ringTimer);
    };
  }, [isOpen]);

  useEffect(() => {
    if (callStatus !== "connected") return;

    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [callStatus]);

  useEffect(() => {
    if (!isOpen) return;

    const initVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        streamRef.current = stream;

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    };

    initVideo();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (!streamRef.current) return;

    streamRef.current.getVideoTracks().forEach((track) => {
      track.enabled = !isVideoOff;
    });
  }, [isVideoOff]);

  useEffect(() => {
    if (!streamRef.current) return;

    streamRef.current.getAudioTracks().forEach((track) => {
      track.enabled = !isMuted;
    });
  }, [isMuted]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen sharing
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
        screenStreamRef.current = null;
      }
      // Restore camera video
      if (localVideoRef.current && streamRef.current) {
        localVideoRef.current.srcObject = streamRef.current;
      }
      setIsScreenSharing(false);
    } else {
      // Start screen sharing
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        });
        screenStreamRef.current = screenStream;
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        
        // Handle when user stops sharing via browser UI
        screenStream.getVideoTracks()[0].onended = () => {
          if (localVideoRef.current && streamRef.current) {
            localVideoRef.current.srcObject = streamRef.current;
          }
          screenStreamRef.current = null;
          setIsScreenSharing(false);
        };
        
        setIsScreenSharing(true);
      } catch (err) {
        console.error("Error sharing screen:", err);
      }
    }
  };

  const handleEndCall = () => {
    setCallStatus("ended");
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    setTimeout(onClose, 500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      {/* Remote Video (simulated with contact avatar) */}
      <div className="absolute inset-0 bg-card flex items-center justify-center">
        {callStatus === "connected" ? (
          <div className="w-full h-full bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
            <div className="w-40 h-40 rounded-full bg-secondary flex items-center justify-center text-foreground text-5xl font-semibold overflow-hidden">
              {contactAvatar ? (
                <img src={contactAvatar} alt={contactName} className="w-full h-full object-cover" />
              ) : (
                contactName.charAt(0).toUpperCase()
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-32 h-32 rounded-full bg-secondary flex items-center justify-center text-foreground text-4xl font-semibold overflow-hidden animate-pulse">
              {contactAvatar ? (
                <img src={contactAvatar} alt={contactName} className="w-full h-full object-cover" />
              ) : (
                contactName.charAt(0).toUpperCase()
              )}
            </div>
            <p className="text-xl font-medium text-foreground">{contactName}</p>
            <p className="text-muted-foreground">
              {callStatus === "connecting" && "Connecting..."}
              {callStatus === "ringing" && "Ringing..."}
              {callStatus === "ended" && "Call ended"}
            </p>
          </div>
        )}
      </div>

      {/* Local Video Preview */}
      <div
        className={cn(
          "absolute rounded-xl overflow-hidden shadow-2xl border border-border transition-all",
          isFullscreen ? "inset-4" : "bottom-24 right-6 w-48 h-36"
        )}
      >
        {isVideoOff ? (
          <div className="w-full h-full bg-secondary flex items-center justify-center">
            <VideoOff className="w-8 h-8 text-muted-foreground" />
          </div>
        ) : (
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover mirror"
            style={{ transform: "scaleX(-1)" }}
          />
        )}
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="absolute top-2 right-2 p-1.5 rounded-lg bg-background/50 text-foreground hover:bg-background/70 transition-colors"
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4" />
          ) : (
            <Maximize2 className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between bg-gradient-to-b from-background/80 to-transparent">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{contactName}</h2>
          {callStatus === "connected" && (
            <p className="text-sm text-muted-foreground">{formatDuration(callDuration)}</p>
          )}
        </div>
      </div>

      {/* Call Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-6 flex items-center justify-center gap-4 bg-gradient-to-t from-background/80 to-transparent">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={cn(
            "p-4 rounded-full transition-all",
            isMuted
              ? "bg-destructive text-destructive-foreground"
              : "bg-secondary/80 text-foreground hover:bg-secondary"
          )}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>

        <button
          onClick={() => setIsVideoOff(!isVideoOff)}
          className={cn(
            "p-4 rounded-full transition-all",
            isVideoOff
              ? "bg-destructive text-destructive-foreground"
              : "bg-secondary/80 text-foreground hover:bg-secondary"
          )}
        >
          {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
        </button>

        <button
          onClick={handleToggleScreenShare}
          className={cn(
            "p-4 rounded-full transition-all",
            isScreenSharing
              ? "bg-primary text-primary-foreground"
              : "bg-secondary/80 text-foreground hover:bg-secondary"
          )}
        >
          {isScreenSharing ? <MonitorOff className="w-6 h-6" /> : <Monitor className="w-6 h-6" />}
        </button>

        <button
          onClick={handleEndCall}
          className="p-5 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all"
        >
          <PhoneOff className="w-7 h-7" />
        </button>
      </div>
    </div>
  );
};

export default VideoCallModal;
