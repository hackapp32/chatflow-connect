import { useRef, useEffect, useState } from "react";
import ChatHeader from "./ChatHeader";
import ChatMessage, { Message } from "./ChatMessage";
import ChatInput, { Attachment } from "./ChatInput";
import VoiceCallModal from "./VoiceCallModal";
import VideoCallModal from "./VideoCallModal";
import IncomingCallNotification from "./IncomingCallNotification";
import { Conversation } from "./ChatSidebar";

interface ChatAreaProps {
  conversation: Conversation;
  messages: Message[];
  onSendMessage: (content: string, attachments: Attachment[]) => void;
}

const ChatArea = ({ conversation, messages, onSendMessage }: ChatAreaProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isVoiceCallOpen, setIsVoiceCallOpen] = useState(false);
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [incomingCall, setIncomingCall] = useState<{
    type: "voice" | "video";
    callerName: string;
    callerAvatar?: string;
  } | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Simulate incoming call after 5 seconds for demo
  useEffect(() => {
    const timer = setTimeout(() => {
      setIncomingCall({
        type: Math.random() > 0.5 ? "video" : "voice",
        callerName: conversation.name,
        callerAvatar: conversation.avatar,
      });
    }, 5000);

    return () => clearTimeout(timer);
  }, [conversation.id]);

  const handleAcceptCall = () => {
    if (incomingCall?.type === "video") {
      setIsVideoCallOpen(true);
    } else {
      setIsVoiceCallOpen(true);
    }
    setIncomingCall(null);
  };

  const handleDeclineCall = () => {
    setIncomingCall(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />
      
      <ChatHeader
        name={conversation.name}
        avatar={conversation.avatar}
        online={conversation.online}
        onVoiceCall={() => setIsVoiceCallOpen(true)}
        onVideoCall={() => setIsVideoCallOpen(true)}
      />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-4 relative z-10">
        {messages.map((message, index) => (
          <ChatMessage
            key={message.id}
            message={message}
            showAvatar={
              message.sender === "other" &&
              (index === 0 || messages[index - 1].sender !== "other")
            }
            senderName={conversation.name}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSend={onSendMessage} />

      {/* Call Modals */}
      <VoiceCallModal
        isOpen={isVoiceCallOpen}
        onClose={() => setIsVoiceCallOpen(false)}
        contactName={conversation.name}
        contactAvatar={conversation.avatar}
      />

      <VideoCallModal
        isOpen={isVideoCallOpen}
        onClose={() => setIsVideoCallOpen(false)}
        contactName={conversation.name}
        contactAvatar={conversation.avatar}
      />

      {/* Incoming Call Notification */}
      <IncomingCallNotification
        isOpen={!!incomingCall}
        callType={incomingCall?.type || "voice"}
        callerName={incomingCall?.callerName || ""}
        callerAvatar={incomingCall?.callerAvatar}
        onAccept={handleAcceptCall}
        onDecline={handleDeclineCall}
      />
    </div>
  );
};

export default ChatArea;
