import { useEffect, useRef, useState } from "react";
import { Phone, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface IncomingCallNotificationProps {
  isOpen: boolean;
  callType: "voice" | "video";
  callerName: string;
  callerAvatar?: string;
  onAccept: () => void;
  onDecline: () => void;
}

const IncomingCallNotification = ({
  isOpen,
  callType,
  callerName,
  callerAvatar,
  onAccept,
  onDecline,
}: IncomingCallNotificationProps) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isRinging, setIsRinging] = useState(false);

  // Play ringtone using Web Audio API
  const playRingtone = () => {
    if (audioContextRef.current) return;

    try {
      audioContextRef.current = new AudioContext();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.connect(audioContextRef.current.destination);
      gainNodeRef.current.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);

      let ringCount = 0;
      const playRing = () => {
        if (!audioContextRef.current || !gainNodeRef.current) return;

        oscillatorRef.current = audioContextRef.current.createOscillator();
        oscillatorRef.current.connect(gainNodeRef.current);
        oscillatorRef.current.frequency.setValueAtTime(440, audioContextRef.current.currentTime);
        oscillatorRef.current.type = "sine";
        oscillatorRef.current.start();

        // Two-tone ring pattern
        setTimeout(() => {
          if (oscillatorRef.current) {
            oscillatorRef.current.frequency.setValueAtTime(480, audioContextRef.current!.currentTime);
          }
        }, 200);

        setTimeout(() => {
          oscillatorRef.current?.stop();
        }, 400);

        ringCount++;
        if (ringCount < 2) {
          setTimeout(playRing, 200);
        }
      };

      playRing();
      intervalRef.current = setInterval(() => {
        ringCount = 0;
        playRing();
      }, 2000);

      setIsRinging(true);
    } catch (error) {
      console.error("Error playing ringtone:", error);
    }
  };

  const stopRingtone = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
      } catch (e) {
        // Already stopped
      }
      oscillatorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsRinging(false);
  };

  useEffect(() => {
    if (isOpen) {
      playRingtone();
    } else {
      stopRingtone();
    }

    return () => {
      stopRingtone();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 pointer-events-none">
      <div 
        className="pointer-events-auto bg-card/95 backdrop-blur-lg border border-border rounded-2xl p-6 shadow-2xl animate-in slide-in-from-top-4 fade-in duration-300"
        style={{ minWidth: "320px" }}
      >
        {/* Caller Info */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-4">
            <Avatar className="w-20 h-20 border-4 border-primary/30">
              <AvatarFallback className="bg-primary/20 text-primary text-2xl">
                {callerName.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            {/* Pulsing ring animation */}
            <div className="absolute inset-0 rounded-full border-4 border-primary/50 animate-ping" />
            <div className="absolute inset-0 rounded-full border-4 border-primary/30 animate-pulse" />
          </div>
          
          <h3 className="text-xl font-semibold text-foreground">{callerName}</h3>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            {callType === "video" ? (
              <>
                <Video className="w-4 h-4" />
                Incoming Video Call
              </>
            ) : (
              <>
                <Phone className="w-4 h-4" />
                Incoming Voice Call
              </>
            )}
          </p>
          
          {isRinging && (
            <div className="flex gap-1 mt-3">
              <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-6">
          <Button
            variant="destructive"
            size="lg"
            className="rounded-full w-16 h-16 p-0 shadow-lg hover:scale-110 transition-transform"
            onClick={onDecline}
          >
            <X className="w-7 h-7" />
          </Button>
          
          <Button
            size="lg"
            className="rounded-full w-16 h-16 p-0 bg-green-600 hover:bg-green-700 shadow-lg hover:scale-110 transition-transform"
            onClick={onAccept}
          >
            {callType === "video" ? (
              <Video className="w-7 h-7" />
            ) : (
              <Phone className="w-7 h-7" />
            )}
          </Button>
        </div>

        {/* Slide to answer hint */}
        <p className="text-center text-sm text-muted-foreground mt-4">
          {callType === "video" ? "Accept to start video call" : "Accept to start voice call"}
        </p>
      </div>
    </div>
  );
};

export default IncomingCallNotification;
