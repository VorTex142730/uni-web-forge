import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Edit, 
  MoreVertical, 
  Image, 
  Video, 
  Smile, 
  Send, 
  ChevronLeft,
  MessageSquare,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Code2,
  Type
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { conversations, messages as initialMessages, users } from '@/data/messagesData';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';

interface Message {
  id: number;
  senderId: number;
  text: string;
  timestamp: string;
}

const MessagesPage: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<{ [key: number]: Message[] }>(initialMessages);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFormatToolbar, setShowFormatToolbar] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const filteredConversations = conversations.filter(conversation =>
    users.find(user => conversation.participants.includes(user.id) && user.id !== 1)?.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );
  
  const currentConversation = conversationId 
    ? conversations.find(c => c.id === parseInt(conversationId))
    : null;
    
  const otherUserId = currentConversation?.participants.find(id => id !== 1);
  const otherUser = users.find(user => user.id === otherUserId);
  const currentMessages = conversationId ? messages[parseInt(conversationId)] || [] : [];
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageText.trim() === '') return;
    
    const newMessage: Message = {
      id: Date.now(),
      senderId: 1, // Current user's ID
      text: messageText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    if (conversationId) {
      const conversationIdNum = parseInt(conversationId);
      setMessages(prev => ({
        ...prev,
        [conversationIdNum]: [...(prev[conversationIdNum] || []), newMessage]
      }));

      // Update the last message in the conversation
      const updatedConversations = conversations.map(conv => {
        if (conv.id === conversationIdNum) {
          return {
            ...conv,
            lastMessage: {
              senderId: 1,
              text: messageText.trim(),
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          };
        }
        return conv;
      });
    }
    
    setMessageText('');
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (conversationId) {
      const messagesContainer = document.querySelector('.messages-container');
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }
  }, [currentMessages, conversationId]);

  const handleEmojiSelect = (emoji: any) => {
    setMessageText(prev => prev + (emoji.native || ''));
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  // Helper to insert formatting at cursor
  const insertAtCursor = (before: string, after: string = '', placeholder: string = '') => {
    if (!inputRef.current) return;
    const input = inputRef.current;
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const value = messageText;
    const selected = value.substring(start, end) || placeholder;
    const newValue = value.substring(0, start) + before + selected + after + value.substring(end);
    setMessageText(newValue);
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  };

  const handleFormat = (type: string) => {
    switch (type) {
      case 'bold':
        insertAtCursor('**', '**', 'bold');
        break;
      case 'italic':
        insertAtCursor('_', '_', 'italic');
        break;
      case 'ul':
        insertAtCursor('\n- ', '', 'item');
        break;
      case 'ol':
        insertAtCursor('\n1. ', '', 'item');
        break;
      case 'blockquote':
        insertAtCursor('\n> ', '', 'quote');
        break;
      case 'link': {
        const url = prompt('Enter URL:');
        if (url) insertAtCursor('[', `](${url})`, 'link text');
        break;
      }
      case 'code':
        insertAtCursor('`', '`', 'code');
        break;
      default:
        break;
    }
    setShowFormatToolbar(false);
  };
  
  return (
    <div className="flex h-[calc(100vh-80px)] -mt-4 -mx-4 overflow-hidden">
      {/* Conversation List */}
      <div className={`bg-white border-r border-gray-200 flex flex-col ${conversationId ? 'hidden md:flex w-1/3' : 'w-full md:w-1/3'}`}>
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold mb-4">Messages</h1>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No conversations found</div>
          ) : (
            filteredConversations.map(conversation => {
              const otherParticipantId = conversation.participants.find(id => id !== 1);
              const otherParticipant = users.find(user => user.id === otherParticipantId);
              const isSelected = conversationId === conversation.id.toString();
              
              return (
                <Link
                  key={conversation.id}
                  to={`/messages/${conversation.id}`}
                  className={`block p-4 hover:bg-gray-50 transition-colors ${
                    isSelected ? 'bg-gray-100' : ''
                  } ${!conversation.isRead ? 'bg-blue-50 hover:bg-blue-50' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={otherParticipant?.avatar} />
                        <AvatarFallback>{otherParticipant?.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {otherParticipant?.status === 'online' && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold truncate">{otherParticipant?.name}</h3>
                        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                          {conversation.lastMessage.timestamp}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.lastMessage.senderId === 1 ? 'You: ' : ''}
                        {conversation.lastMessage.text}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
      
      {/* Message Detail */}
      {currentConversation && otherUser ? (
        <div className={`bg-white flex flex-col ${conversationId ? 'w-full md:w-2/3' : 'hidden md:flex md:w-2/3'}`}>
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden"
                onClick={() => navigate('/messages')}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Avatar className="h-10 w-10">
                <AvatarImage src={otherUser.avatar} />
                <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{otherUser.name}</h3>
                <p className="text-xs text-gray-500">
                  {otherUser.status === 'online' 
                    ? 'Online' 
                    : `Last active ${otherUser.lastActive}`}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 messages-container">
            {currentMessages.map(message => {
              const isOwn = message.senderId === 1;
              const sender = users.find(u => u.id === message.senderId);
              
              return (
                <div 
                  key={message.id} 
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  {!isOwn && (
                    <Avatar className="h-8 w-8 mr-2 mt-1">
                      <AvatarImage src={sender?.avatar} />
                      <AvatarFallback>{sender?.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}
                  <div className="max-w-[70%]">
                    <div 
                      className={`p-3 rounded-lg ${
                        isOwn 
                          ? 'bg-blue-500 text-white rounded-br-none' 
                          : 'bg-gray-100 text-gray-900 rounded-bl-none'
                      }`}
                    >
                      {message.text}
                    </div>
                    <div 
                      className={`text-xs text-gray-500 mt-1 ${
                        isOwn ? 'text-right' : 'text-left'
                      }`}
                    >
                      {message.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <Button type="button" size="icon" variant="ghost">
                <Image className="h-5 w-5 text-gray-500" />
              </Button>
              <Input
                ref={inputRef}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Write a message..."
                className="flex-1"
              />
              <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                <PopoverTrigger asChild>
                  <Button type="button" size="icon" variant="ghost" onClick={() => setShowEmojiPicker((v) => !v)}>
                    <Smile className="h-5 w-5 text-gray-500" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 border-none shadow-none bg-transparent" align="end" sideOffset={8}>
                  <Picker data={data} onEmojiSelect={handleEmojiSelect} theme="light" previewPosition="none" skinTonePosition="search" />
                </PopoverContent>
              </Popover>
              <Popover open={showFormatToolbar} onOpenChange={setShowFormatToolbar}>
                <PopoverTrigger asChild>
                  <Button type="button" size="icon" variant="ghost" onClick={() => setShowFormatToolbar((v) => !v)}>
                    <Type className="h-5 w-5 text-gray-500" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="flex gap-2 bg-gray-50 border rounded shadow p-2" align="end" sideOffset={8}>
                  <Button type="button" size="icon" variant="ghost" title="Bold" onClick={() => handleFormat('bold')}><Bold className="h-4 w-4" /></Button>
                  <Button type="button" size="icon" variant="ghost" title="Italic" onClick={() => handleFormat('italic')}><Italic className="h-4 w-4" /></Button>
                  <Button type="button" size="icon" variant="ghost" title="Unordered List" onClick={() => handleFormat('ul')}><List className="h-4 w-4" /></Button>
                  <Button type="button" size="icon" variant="ghost" title="Ordered List" onClick={() => handleFormat('ol')}><ListOrdered className="h-4 w-4" /></Button>
                  <Button type="button" size="icon" variant="ghost" title="Blockquote" onClick={() => handleFormat('blockquote')}><Quote className="h-4 w-4" /></Button>
                  <Button type="button" size="icon" variant="ghost" title="Link" onClick={() => handleFormat('link')}><LinkIcon className="h-4 w-4" /></Button>
                  <Button type="button" size="icon" variant="ghost" title="Preformatted" onClick={() => handleFormat('code')}><Code2 className="h-4 w-4" /></Button>
                </PopoverContent>
              </Popover>
              <Button type="submit" size="icon" disabled={messageText.trim() === ''}>
                <Send className="h-5 w-5" />
              </Button>
            </form>
            <div className="text-xs text-gray-500 mt-2 text-center">
              Enter to Send • Shift+Enter to add a new line
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex md:w-2/3 items-center justify-center bg-gray-50">
          <div className="text-center p-8">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
              <MessageSquare className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Your Messages</h3>
            <p className="mt-1 text-sm text-gray-500">
              Select a conversation to start messaging
            </p>
            <Button className="mt-4">Start a new conversation</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;
