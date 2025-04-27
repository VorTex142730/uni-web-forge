import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { 
  getUserChats, 
  getChatMessages, 
  sendMessage, 
  getAllUsers,
  Chat,
  Message,
  ChatUser
} from '../services/chatService';
import UserItem from '@/components/chat/UserItem';

const ChatPage: React.FC = () => {
  console.log('[ChatPage] Initializing component');
  const { user } = useAuth();
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [showUserList, setShowUserList] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Redirect if not authenticated
  useEffect(() => {
    console.log('[ChatPage] Checking authentication status');
    if (!user) {
      console.warn('[ChatPage] User not authenticated, redirecting to login');
      navigate('/login');
    } else {
      console.log('[ChatPage] User authenticated:', user.uid);
    }
  }, [user, navigate]);

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    console.log('[ChatPage] Scrolling to bottom of messages');
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load user's chats
  useEffect(() => {
    if (!user?.uid) {
      console.log('[ChatPage] No user UID available, skipping chat load');
      return;
    }

    console.log('[ChatPage] Setting up chat subscription for user:', user.uid);
    const unsubscribe = getUserChats(user.uid, (chatList) => {
      console.log('[ChatPage] Received chat list update:', chatList.length, 'chats');
      setChats(chatList);
      
      // If we have a chatId but no activeChat, try to find it
      if (chatId && !activeChat) {
        const foundChat = chatList.find(c => c.id === chatId);
        if (foundChat) {
          console.log('[ChatPage] Found active chat from chat list:', foundChat.id);
          setActiveChat(foundChat);
        }
      }
    });

    return () => {
      console.log('[ChatPage] Cleaning up chat subscription');
      unsubscribe();
    };
  }, [user, chatId, activeChat]);

  // Load messages when chat ID changes
  useEffect(() => {
    if (!chatId) {
      console.log('[ChatPage] No chatId provided, skipping message load');
      return;
    }

    console.log('[ChatPage] Setting up message subscription for chat:', chatId);
    const unsubscribe = getChatMessages(chatId, (messageList) => {
      console.log(`[ChatPage] Received ${messageList.length} messages for chat ${chatId}`);
      setMessages(messageList);
      
      // Find active chat in the list if not already set
      if (!activeChat) {
        const chat = chats.find(c => c.id === chatId);
        if (chat) {
          console.log('[ChatPage] Found active chat from messages load:', chat.id);
          setActiveChat(chat);
        }
      }
      
      // Scroll to bottom after messages load
      setTimeout(scrollToBottom, 100);
    });

    return () => {
      console.log('[ChatPage] Cleaning up message subscription for chat:', chatId);
      unsubscribe();
    };
  }, [chatId, chats, activeChat]);

  // Scroll to bottom when messages change
  useEffect(() => {
    console.log('[ChatPage] Messages updated, scrolling to bottom');
    scrollToBottom();
  }, [messages]);

  // Load users for new chat
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoadingUsers(true);
        console.log('Loading users...');
        const userList = await getAllUsers(user.uid);
        console.log('Users loaded:', userList);
        setUsers(userList);
      } catch (error) {
        console.error('User load failed:', error);
      } finally {
        setLoadingUsers(false);
      }
    };

    if (showUserList) loadUsers();
  }, [showUserList, user]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) {
      console.log('[ChatPage] Send message aborted - empty message');
      return;
    }
    if (!chatId) {
      console.warn('[ChatPage] Send message aborted - no chatId');
      return;
    }
    if (!user) {
      console.warn('[ChatPage] Send message aborted - no user');
      return;
    }

    console.log('[ChatPage] Sending message to chat:', chatId);
    try {
      await sendMessage(
        chatId, 
        user.uid, 
        newMessage, 
        user.displayName || user.email || undefined,
        user.photoURL || undefined
      );
      console.log('[ChatPage] Message sent successfully');
      setNewMessage('');
    } catch (error) {
      console.error("[ChatPage] Error sending message:", error);
    }
  };

  const getChatName = (chat: Chat) => {
    if (!user) {
      console.log('[ChatPage] No user available for chat name');
      return "Chat";
    }
    
    // Find the other participant
    const otherParticipantId = chat.participants.find(id => id !== user.uid);
    
    if (!otherParticipantId) {
      console.log('[ChatPage] No other participant found in chat');
      return "Chat";
    }
    
    // Try to get participant name from the record
    if (chat.participantNames && chat.participantNames[otherParticipantId]) {
      return chat.participantNames[otherParticipantId];
    }
    
    // Fallback
    return "Chat Partner";
  };

  const formatTimestamp = (timestamp: { seconds: number; nanoseconds: number }) => {
    if (!timestamp) {
      console.log('[ChatPage] No timestamp provided for formatting');
      return "";
    }
    
    const date = new Date(timestamp.seconds * 1000);
    return format(date, "MMM d, h:mm a");
  };

  console.log('[ChatPage] Rendering with state:', {
    user: user?.uid,
    chatId,
    chatsCount: chats.length,
    messagesCount: messages.length,
    usersCount: users.length,
    showUserList,
    activeChat: activeChat?.id
  });

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Chat sidebar */}
      <div className="w-1/4 border-r bg-gray-50 flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-medium text-lg">Conversations</h2>
          <button 
            onClick={() => {
              console.log('[ChatPage] Toggling user list, new state:', !showUserList);
              setShowUserList(!showUserList);
            }}
            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
          >
            New Chat
          </button>
        </div>
        
        <div className="overflow-y-auto flex-1">
          {showUserList && (
            <div className="p-4">
              {loadingUsers ? (
                <div className="text-center text-gray-500">Loading users...</div>
              ) : (
                users.map(userItem => (
                  <UserItem
                    key={userItem.id}
                    user={userItem}
                    currentUserId={user.uid}
                    showChatButton={true}
                  />
                ))
              )}
            </div>
          )}
          {!showUserList && (
            <div>
              {chats.length > 0 ? (
                chats.map(chat => (
                  <div 
                    key={chat.id}
                    className={`p-3 border-b cursor-pointer hover:bg-gray-100 ${
                      chat.id === chatId ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => {
                      console.log('[ChatPage] Navigating to chat:', chat.id);
                      navigate(`/chat/${chat.id}`);
                    }}
                  >
                    <div className="flex items-center">
                      {chat.participantPhotos && 
                       chat.participants.find(id => id !== user?.uid) && 
                       chat.participantPhotos[chat.participants.find(id => id !== user?.uid) || ''] ? (
                        <img 
                          src={chat.participantPhotos[chat.participants.find(id => id !== user?.uid) || '']} 
                          alt="Chat partner" 
                          className="w-8 h-8 rounded-full mr-2"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-2">
                          <span className="text-sm font-medium text-gray-600">
                            {getChatName(chat).charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium">{getChatName(chat)}</h3>
                        {chat.lastMessage && (
                          <p className="text-sm text-gray-500 truncate max-w-[180px]">
                            {chat.lastMessage}
                          </p>
                        )}
                      </div>
                    </div>
                    {chat.lastMessageDate && (
                      <div className="text-xs text-gray-400 mt-1">
                        {formatTimestamp(chat.lastMessageDate)}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No conversations yet. Start a new chat!
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Chat main area */}
      <div className="w-3/4 flex flex-col">
        {chatId ? (
          <>
            <div className="p-4 border-b">
              <h2 className="font-medium text-lg">
                {activeChat ? getChatName(activeChat) : "Chat"}
              </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {messages.length > 0 ? (
                messages.map(message => (
                  <div 
                    key={message.id}
                    className={`mb-4 flex ${
                      message.senderId === user?.uid ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div 
                      className={`max-w-[70%] p-3 rounded-lg ${
                        message.senderId === user?.uid 
                          ? 'bg-blue-500 text-white rounded-br-none' 
                          : 'bg-white shadow rounded-bl-none'
                      }`}
                    >
                      <div className="text-sm mb-1">
                        {message.senderId === user?.uid 
                          ? 'You' 
                          : (message.senderName || 'User')}
                      </div>
                      <div className="break-words">{message.text}</div>
                      <div 
                        className={`text-xs mt-1 text-right ${
                          message.senderId === user?.uid ? 'text-blue-100' : 'text-gray-400'
                        }`}
                      >
                        {message.createdAt && formatTimestamp(message.createdAt)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 mt-8">
                  No messages yet. Start the conversation!
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <form onSubmit={handleSendMessage} className="p-4 border-t flex">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => {
                  console.log('[ChatPage] Message input changed:', e.target.value);
                  setNewMessage(e.target.value);
                }}
                placeholder="Type a message..."
                className="flex-1 p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                type="submit"
                className="bg-blue-500 text-white p-2 rounded-r-md hover:bg-blue-600"
                disabled={!newMessage.trim()}
              >
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a conversation or start a new chat.
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;