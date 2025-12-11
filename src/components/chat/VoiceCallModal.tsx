import { useState, useEffect, useRef } from "react";
import { Phone, PhoneOff, Mic, MicOff, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactName: string;
  contactAvatar?: string;
}

const VoiceCallModal = ({ isOpen, onClose, contactName, contactAvatar }: VoiceCallModalProps) => {
  const [callStatus, setCallStatus] = useState<"connecting" | "ringing" | "connected" | "ended">("connecting");
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    if (!isOpen) return;

    // Simulate call connection
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
    if (!isOpen || callStatus !== "connected") return;

    const initAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        audioContextRef.current = new AudioContext();
        analyserRef.current = audioContextRef.current.createAnalyser();
        const source = audioContextRef.current.createMediaStreamSource(stream);
        source.connect(analyserRef.current);
        analyserRef.current.fftSize = 256;

        const updateLevel = () => {
          if (!analyserRef.current) return;
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(average / 255);
          animationRef.current = requestAnimationFrame(updateLevel);
        };
        updateLevel();
      } catch (err) {
        console.error("Error accessing microphone:", err);
      }
    };

    initAudio();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      cancelAnimationFrame(animationRef.current);
    };
  }, [isOpen, callStatus]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleEndCall = () => {
    setCallStatus("ended");
    setTimeout(onClose, 500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-8">
        {/* Avatar with audio visualization */}
        <div className="relative">
          <div
            className={cn(
              "absolute inset-0 rounded-full bg-primary/30 transition-transform duration-150",
              callStatus === "connected" && "animate-pulse"
            )}
            style={{
              transform: `scale(${1 + audioLevel * 0.5})`,
              opacity: 0.3 + audioLevel * 0.7,
            }}
          />
          <div
            className={cn(
              "absolute inset-0 rounded-full bg-primary/20 transition-transform duration-150"
            )}
            style={{
              transform: `scale(${1.2 + audioLevel * 0.3})`,
              opacity: 0.2 + audioLevel * 0.5,
            }}
          />
          <div className="relative w-32 h-32 rounded-full bg-secondary flex items-center justify-center text-foreground text-4xl font-semibold overflow-hidden">
            {contactAvatar ? (
              <img src={contactAvatar} alt={contactName} className="w-full h-full object-cover" />
            ) : (
              contactName.charAt(0).toUpperCase()
            )}
          </div>
        </div>

        {/* Contact Info */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-2">{contactName}</h2>
          <p className="text-muted-foreground">
            {callStatus === "connecting" && "Connecting..."}
            {callStatus === "ringing" && "Ringing..."}
            {callStatus === "connected" && formatDuration(callDuration)}
            {callStatus === "ended" && "Call ended"}
          </p>
        </div>

        {/* Call Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={cn(
              "p-4 rounded-full transition-all",
              isMuted
                ? "bg-destructive text-destructive-foreground"
                : "bg-secondary text-foreground hover:bg-secondary/80"
            )}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          <button
            onClick={handleEndCall}
            className="p-5 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all"
          >
            <PhoneOff className="w-7 h-7" />
          </button>

          <button className="p-4 rounded-full bg-secondary text-foreground hover:bg-secondary/80 transition-all">
            <Volume2 className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceCallModal;
