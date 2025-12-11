import { useState } from "react";
import ChatSidebar, { Conversation } from "@/components/chat/ChatSidebar";
import ChatArea from "@/components/chat/ChatArea";
import { Message } from "@/components/chat/ChatMessage";

// Mock data for demo
const mockConversations: Conversation[] = [
  {
    id: "1",
    name: "Emma Wilson",
    lastMessage: "That sounds great! Let me know when you're free",
    timestamp: "2:34 PM",
    unread: 2,
    online: true,
  },
  {
    id: "2",
    name: "Alex Chen",
    lastMessage: "The project deadline is next Friday",
    timestamp: "1:15 PM",
    unread: 0,
    online: true,
  },
  {
    id: "3",
    name: "Sarah Parker",
    lastMessage: "Thanks for your help yesterday!",
    timestamp: "Yesterday",
    unread: 0,
    online: false,
  },
  {
    id: "4",
    name: "Design Team",
    lastMessage: "Mike: New mockups are ready for review",
    timestamp: "Yesterday",
    unread: 5,
    online: true,
  },
  {
    id: "5",
    name: "Jordan Lee",
    lastMessage: "See you at the meeting tomorrow",
    timestamp: "Monday",
    unread: 0,
    online: false,
  },
];

const mockMessages: Record<string, Message[]> = {
  "1": [
    { id: "m1", content: "Hey! How's the project coming along?", timestamp: "2:30 PM", sender: "other" },
    { id: "m2", content: "It's going well! Almost done with the design phase", timestamp: "2:31 PM", sender: "me", read: true },
    { id: "m3", content: "That's awesome! Can't wait to see it", timestamp: "2:32 PM", sender: "other" },
    { id: "m4", content: "I'll share the preview later today", timestamp: "2:33 PM", sender: "me", read: true },
    { id: "m5", content: "That sounds great! Let me know when you're free", timestamp: "2:34 PM", sender: "other" },
  ],
  "2": [
    { id: "m1", content: "Quick update on the project timeline", timestamp: "12:45 PM", sender: "other" },
    { id: "m2", content: "What's the update?", timestamp: "12:50 PM", sender: "me", read: true },
    { id: "m3", content: "The project deadline is next Friday", timestamp: "1:15 PM", sender: "other" },
  ],
  "3": [
    { id: "m1", content: "Hey, I was stuck on that bug for hours!", timestamp: "Yesterday", sender: "other" },
    { id: "m2", content: "No worries! It was a tricky one", timestamp: "Yesterday", sender: "me", read: true },
    { id: "m3", content: "Thanks for your help yesterday!", timestamp: "Yesterday", sender: "other" },
  ],
  "4": [
    { id: "m1", content: "Team, I've uploaded the new mockups", timestamp: "Yesterday", sender: "other" },
    { id: "m2", content: "Great work everyone!", timestamp: "Yesterday", sender: "me", read: true },
    { id: "m3", content: "New mockups are ready for review", timestamp: "Yesterday", sender: "other" },
  ],
  "5": [
    { id: "m1", content: "Are we still on for tomorrow's meeting?", timestamp: "Monday", sender: "other" },
    { id: "m2", content: "Yes, 10 AM works for me", timestamp: "Monday", sender: "me", read: true },
    { id: "m3", content: "See you at the meeting tomorrow", timestamp: "Monday", sender: "other" },
  ],
};

const Index = () => {
  const [activeConversation, setActiveConversation] = useState("1");
  const [messages, setMessages] = useState<Record<string, Message[]>>(mockMessages);

  const currentConversation = mockConversations.find((c) => c.id === activeConversation);
  const currentMessages = messages[activeConversation] || [];

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: `m${Date.now()}`,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      sender: "me",
      read: false,
    };

    setMessages((prev) => ({
      ...prev,
      [activeConversation]: [...(prev[activeConversation] || []), newMessage],
    }));
  };

  if (!currentConversation) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      <ChatSidebar
        conversations={mockConversations}
        activeId={activeConversation}
        onSelect={setActiveConversation}
      />
      <ChatArea
        conversation={currentConversation}
        messages={currentMessages}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
};

export default Index;
