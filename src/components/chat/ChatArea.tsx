import { useRef, useEffect, useState } from "react";
import ChatHeader from "./ChatHeader";
import ChatMessage, { Message } from "./ChatMessage";
import ChatInput, { Attachment } from "./ChatInput";
import VoiceCallModal from "./VoiceCallModal";
import VideoCallModal from "./VideoCallModal";
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col h-full bg-background">
      <ChatHeader
        name={conversation.name}
        avatar={conversation.avatar}
        online={conversation.online}
        onVoiceCall={() => setIsVoiceCallOpen(true)}
        onVideoCall={() => setIsVideoCallOpen(true)}
      />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-4">
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
    </div>
  );
};

export default ChatArea;
