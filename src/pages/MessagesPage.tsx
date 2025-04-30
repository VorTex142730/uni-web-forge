import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  Type,
  X,
  Trash2,
  Check,
  CheckCheck,
  Pencil
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/config/firebaseConfig';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  serverTimestamp, 
  onSnapshot, 
  updateDoc, 
  doc, 
  getDoc, 
  getDocs,
  Timestamp
} from 'firebase/firestore';
import remarkBreaks from 'remark-breaks';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Timestamp;
  isRead: boolean;
  edited?: boolean;
  editTimestamp?: Timestamp;
  deleted?: boolean;
  deletedFor?: string[];
  seenBy?: string[];
  replyTo?: string;
}

interface Conversation {
  id: string;
  participants: string[];
  lastMessage: {
    text: string;
    timestamp: Timestamp;
    senderId: string;
  };
  isRead: boolean;
}

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  lastActive?: string;
}

const MessagesPage: React.FC = () => {
  const { conversationId, userId } = useParams<{ conversationId?: string; userId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFormatToolbar, setShowFormatToolbar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [newConversationUser, setNewConversationUser] = useState<User | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; message: Message } | null>(null);
  
  // Fetch conversations for the current user
  useEffect(() => {
    if (!user) return;
    
    // Simplified query to avoid index issues
    const conversationsQuery = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.uid)
    );
    
    const unsubscribe = onSnapshot(conversationsQuery, (snapshot) => {
      const conversationsData: Conversation[] = [];
      snapshot.forEach((doc) => {
        conversationsData.push({
          id: doc.id,
          ...doc.data()
        } as Conversation);
      });
      
      // Sort conversations client-side by timestamp
      conversationsData.sort((a, b) => {
        const timestampA = a.lastMessage?.timestamp?.toMillis() || 0;
        const timestampB = b.lastMessage?.timestamp?.toMillis() || 0;
        return timestampB - timestampA; // Descending order (newest first)
      });
      
      setConversations(conversationsData);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [user]);
  
  // Fetch users data for all conversation participants (robust)
  useEffect(() => {
    if (!user) return;

    const fetchUsers = async () => {
      const usersData: Record<string, User> = {};
      const userIds = new Set<string>();

      // Collect unique user IDs from conversations
      conversations.forEach(conv => {
        conv.participants.forEach(id => {
          if (id !== user.uid) userIds.add(id);
        });
      });

      // Fetch user data for each ID
      const userDocs = await Promise.all(
        Array.from(userIds).map(userId => getDoc(doc(db, 'users', userId)))
      );

      userDocs.forEach(userDoc => {
        if (userDoc.exists()) {
          const userData = userDoc.data();
          usersData[userDoc.id] = {
            id: userDoc.id,
            name: userData.displayName || userData.username || userData.email?.split('@')[0] || 'Unknown User',
            username: userData.username || userData.email?.split('@')[0] || 'unknown',
            avatar: userData.photoURL || 'https://randomuser.me/api/portraits/lego/1.jpg', // Use photoURL
            status: userData.status || 'offline',
            lastActive: userData.lastActive || 'Unknown',
          };
        }
      });

      setUsers(usersData);
    };

    fetchUsers();
  }, [conversations, user]);
  
  // Fetch messages for the current conversation
  useEffect(() => {
    if (!conversationId || !user) return;
    
    const messagesQuery = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      orderBy('timestamp', 'asc')
    );
    
    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData: Message[] = [];
      snapshot.forEach((doc) => {
        messagesData.push({
          id: doc.id,
          ...doc.data()
        } as Message);
      });
      setMessages(messagesData);
      
      // Mark messages as read
      const unreadMessages = messagesData.filter(
        msg => msg.senderId !== user.uid && !msg.isRead
      );
      
      if (unreadMessages.length > 0) {
        unreadMessages.forEach(async (msg) => {
          await updateDoc(doc(db, 'messages', msg.id), {
            isRead: true
          });
        });
        
        // Update conversation read status
        updateDoc(doc(db, 'conversations', conversationId), {
          isRead: true
        });
      }
    });
    
    return () => unsubscribe();
  }, [conversationId, user]);
  
  // Fetch available users for new conversations (connections only, robust)
  useEffect(() => {
    if (!user) return;

    const fetchConnectedUsers = async () => {
      try {
        // 1. Query connections where user1 or user2 is the current user
        const connectionsQuery1 = query(
          collection(db, 'connections'),
          where('user1', '==', user.uid)
        );
        const connectionsQuery2 = query(
          collection(db, 'connections'),
          where('user2', '==', user.uid)
        );
        const [snapshot1, snapshot2] = await Promise.all([
          getDocs(connectionsQuery1),
          getDocs(connectionsQuery2)
        ]);
        // 2. Collect the other user IDs
        const connectedUserIds = new Set<string>();
        snapshot1.forEach(doc => {
          const data = doc.data();
          if (data.user2 && data.user2 !== user.uid) connectedUserIds.add(data.user2);
        });
        snapshot2.forEach(doc => {
          const data = doc.data();
          if (data.user1 && data.user1 !== user.uid) connectedUserIds.add(data.user1);
        });
        if (connectedUserIds.size === 0) {
          setAvailableUsers([]);
          return;
        }
        // 3. Fetch user details for these IDs in parallel
        const userDocs = await Promise.all(
          Array.from(connectedUserIds).map(userId => getDoc(doc(db, 'users', userId)))
        );
        const usersData: User[] = [];
        userDocs.forEach((userDoc, idx) => {
          if (userDoc.exists()) {
            const userData = userDoc.data();
            usersData.push({
              id: userDoc.id,
              name: userData.displayName || userData.username || userData.email?.split('@')[0] || 'Unknown User',
              username: userData.username || userData.email?.split('@')[0] || 'unknown',
              avatar: userData.photoURL || 'https://randomuser.me/api/portraits/lego/1.jpg',
              status: userData.status || 'offline',
              lastActive: userData.lastActive || 'Unknown'
            });
          }
          // If userDoc does not exist, skip this connection
        });
        setAvailableUsers(usersData);
      } catch (error) {
        console.error('Error fetching connected users:', error);
      }
    };

    if (showNewConversation) {
      fetchConnectedUsers();
    }
  }, [user, showNewConversation]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (messageText.trim() === '' || !user || !conversationId) return;
    
    try {
      // Add message to Firestore
      const messageData: any = {
        conversationId,
        senderId: user.uid,
        text: messageText.replace(/^\s+|\s+$/g, ''), // Only trim leading/trailing whitespace
        timestamp: serverTimestamp(),
        isRead: false
      };
      if (replyToMessage) {
        messageData.replyTo = replyToMessage.id;
      }
      await addDoc(collection(db, 'messages'), messageData);
      
      // Update conversation's last message
      await updateDoc(doc(db, 'conversations', conversationId), {
        lastMessage: {
          text: messageText.replace(/^\s+|\s+$/g, ''), // Only trim leading/trailing whitespace
          timestamp: serverTimestamp(),
          senderId: user.uid
        }
      });
      
      setMessageText('');
      setReplyToMessage(null);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

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
  
  const filteredConversations = conversations.filter(conversation => {
    const otherUserId = conversation.participants.find(id => id !== user?.uid);
    const otherUser = users[otherUserId || ''];
    return otherUser?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });
  
  const currentConversation = conversationId 
    ? conversations.find(c => c.id === conversationId)
    : null;
    
  const otherUserId = currentConversation?.participants.find(id => id !== user?.uid);
  const otherUser = otherUserId ? users[otherUserId] : null;
  
  const formatTimestamp = (timestamp: Timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate();
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'long', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };
  
  // Start a new conversation with a selected user
  const startNewConversation = async (selectedUser: User) => {
    if (!user) return;
    
    try {
      // Check if conversation already exists
      const existingConversation = conversations.find(conv => 
        conv.participants.includes(selectedUser.id) && 
        conv.participants.includes(user.uid)
      );
      
      if (existingConversation) {
        navigate(`/messages/${existingConversation.id}`);
        setShowNewConversation(false);
        return;
      }
      
      // Create new conversation
      const conversationData = {
        participants: [user.uid, selectedUser.id],
        lastMessage: {
          text: '',
          timestamp: serverTimestamp(),
          senderId: user.uid
        },
        isRead: true
      };
      
      const conversationRef = await addDoc(collection(db, 'conversations'), conversationData);
      
      // Navigate to the new conversation
      navigate(`/messages/${conversationRef.id}`);
      setShowNewConversation(false);
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };
  
  // Typing indicator logic
  useEffect(() => {
    if (!conversationId || !user) return;
    const typingRef = doc(db, 'conversations', conversationId);
    const unsubscribe = onSnapshot(typingRef, (docSnap) => {
      const data = docSnap.data();
      if (data && data.typing && data.typing !== user.uid) {
        setOtherTyping(true);
      } else {
        setOtherTyping(false);
      }
    });
    return () => unsubscribe();
  }, [conversationId, user]);

  const handleTyping = () => {
    if (!conversationId || !user) return;
    setIsTyping(true);
    updateDoc(doc(db, 'conversations', conversationId), { typing: user.uid });
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      setIsTyping(false);
      updateDoc(doc(db, 'conversations', conversationId), { typing: '' });
    }, 2000);
  };

  // Handle Shift+Enter for new line
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Allow the default behavior for Shift+Enter (new line)
        return;
      } else {
        // Prevent form submission on Enter without Shift
        e.preventDefault();
        if (messageText.trim() !== '') {
          handleSendMessage(e as any);
        }
      }
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [messageText]);

  // Message edit/delete logic
  const handleEditMessage = (msg: Message) => {
    setEditingMessageId(msg.id);
    setEditText(msg.text);
  };

  const handleEditSubmit = async (msg: Message) => {
    if (!editText.trim()) return;
    await updateDoc(doc(db, 'messages', msg.id), {
      text: editText.trim(),
      edited: true,
      editTimestamp: serverTimestamp(),
    });
    setEditingMessageId(null);
    setEditText('');
  };

  const handleDeleteMessage = async (msg: Message, forEveryone = false) => {
    if (forEveryone) {
      await updateDoc(doc(db, 'messages', msg.id), {
        deleted: true,
        text: '',
      });
    } else {
      await updateDoc(doc(db, 'messages', msg.id), {
        deletedFor: [...(msg.deletedFor || []), user.uid],
      });
    }
  };

  // Seen/Read receipts logic
  useEffect(() => {
    if (!conversationId || !user) return;
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.senderId !== user.uid && (!lastMsg.seenBy || !lastMsg.seenBy.includes(user.uid))) {
      updateDoc(doc(db, 'messages', lastMsg.id), {
        seenBy: [...(lastMsg.seenBy || []), user.uid],
      });
    }
  }, [messages, conversationId, user]);
  
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.relative')) {
        setOpenDropdownId(null);
      }
    };
    if (openDropdownId) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [openDropdownId]);
  
  // Handle direct user navigation
  useEffect(() => {
    if (!user || !userId) return;

    const findOrCreateConversation = async () => {
      try {
        // First, check if a conversation already exists with this user
        const conversationsQuery1 = query(
          collection(db, 'conversations'),
          where('participants', 'array-contains', user.uid)
        );
        
        const snapshot = await getDocs(conversationsQuery1);
        let existingConversation = null;
        
        snapshot.forEach(doc => {
          const data = doc.data();
          if (data.participants.includes(userId)) {
            existingConversation = { id: doc.id, ...data };
          }
        });

        if (existingConversation) {
          // If conversation exists, navigate to it
          navigate(`/messages/${existingConversation.id}`);
        } else {
          // If no conversation exists, create one
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const newConversation = await addDoc(collection(db, 'conversations'), {
              participants: [user.uid, userId],
              createdAt: serverTimestamp(),
              lastMessage: {
                text: '',
                timestamp: serverTimestamp(),
                senderId: user.uid
              },
              isRead: true
            });
            navigate(`/messages/${newConversation.id}`);
          }
        }
      } catch (error) {
        console.error('Error finding/creating conversation:', error);
      }
    };

    findOrCreateConversation();
  }, [user, userId, navigate]);

  // Add this effect to close context menu on outside click
  useEffect(() => {
    if (!contextMenu) return;
    const handleClick = () => setContextMenu(null);
    window.addEventListener('mousedown', handleClick);
    return () => window.removeEventListener('mousedown', handleClick);
  }, [contextMenu]);

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
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowNewConversation(true)}
              className="whitespace-nowrap"
            >
              New Chat
            </Button>
          </div>
        </div>
        
        {/* New Conversation Modal */}
        {showNewConversation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[80vh] overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-lg font-semibold">Start a New Conversation</h2>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setShowNewConversation(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="p-4 border-b">
                <Input
                  placeholder="Search users..."
                  className="w-full"
                  onChange={(e) => {
                    const searchTerm = e.target.value.toLowerCase();
                    const filteredUsers = availableUsers.filter(user => 
                      user.name.toLowerCase().includes(searchTerm) || 
                      user.username.toLowerCase().includes(searchTerm)
                    );
                    setAvailableUsers(filteredUsers);
                  }}
                />
              </div>
              
              <div className="overflow-y-auto max-h-[50vh]">
                {availableUsers.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">No users found</div>
                ) : (
                  availableUsers.map(user => (
                    <div
                      key={user.id}
                      className="p-4 hover:bg-gray-50 cursor-pointer flex items-center gap-3"
                      onClick={() => startNewConversation(user)}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} alt={`${user.name}'s avatar`} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{user.name}</h3>
                        <p className="text-sm text-gray-500">@{user.username}</p>
                      </div>
                      {user.status === 'online' && (
                        <span className="ml-auto h-3 w-3 rounded-full bg-green-500"></span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-gray-400">No conversations found</div>
          ) : (
            filteredConversations.map(conversation => {
              const otherParticipantId = conversation.participants.find(id => id !== user?.uid);
              const otherParticipant = otherParticipantId ? users[otherParticipantId] : null;
              const isSelected = conversationId === conversation.id;

              return (
                <Link
                  key={conversation.id}
                  to={`/messages/${conversation.id}`}
                  className={`block p-4 rounded-xl shadow-sm mb-2 bg-white hover:bg-blue-50 transition-colors ${isSelected ? 'border border-blue-400' : 'border border-transparent'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={otherParticipant?.avatar} alt={`${otherParticipant?.name}'s avatar`} />
                        <AvatarFallback>{otherParticipant?.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold truncate text-base">{otherParticipant?.name || 'Unknown User'}</h3>
                        <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                          {conversation.lastMessage?.timestamp
                            ? formatTimestamp(conversation.lastMessage.timestamp)
                            : 'No messages'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {conversation.lastMessage?.senderId === user?.uid ? 'You: ' : ''}
                        {conversation.lastMessage?.text || 'No messages yet'}
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
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white shadow-sm">
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
                <AvatarImage src={otherUser?.avatar} alt={`${otherUser?.name}'s avatar`} />
                <AvatarFallback>{otherUser?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-base">{otherUser?.name}</h3>
                <p className="text-xs text-gray-400">
                  {otherUser?.status === 'online'
                    ? 'Online'
                    : `Last active ${otherUser?.lastActive || 'unknown'}`}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 messages-container">
            {messages.map(message => {
              const isOwn = message.senderId === user?.uid;
              const isDeleted = message.deleted || (message.deletedFor && message.deletedFor.includes(user.uid));
              // Find the replied-to message if any
              const repliedMessage = message.replyTo ? messages.find(m => m.id === message.replyTo) : null;

              return (
                <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}>
                  {!isOwn && (
                    <Avatar className="h-8 w-8 mr-2 mt-1" />
                  )}
                  <div className="max-w-[70%] flex flex-col items-end">
                    <div
                      className={
                        isOwn
                          ? 'bg-blue-100 text-blue-900 rounded-2xl rounded-br-md shadow-sm px-4 py-2 transition-colors'
                          : 'bg-gray-100 text-gray-900 rounded-2xl rounded-bl-md shadow-sm px-4 py-2 transition-colors'
                      }
                      onContextMenu={e => {
                        e.preventDefault();
                        setContextMenu({ x: e.clientX, y: e.clientY, message });
                      }}
                    >
                      {/* Show replied-to message preview if any */}
                      {repliedMessage && (
                        <div className="mb-1 px-2 py-1 border-l-4 border-blue-400 bg-blue-50 text-xs text-gray-700 max-w-xs truncate">
                          <span className="font-medium">{repliedMessage.senderId === user?.uid ? 'You' : users[repliedMessage.senderId]?.name || 'User'}: </span>
                          {repliedMessage.text}
                        </div>
                      )}
                      {isDeleted ? (
                        <span className="italic text-gray-400">This message was deleted</span>
                      ) : editingMessageId === message.id ? (
                        <form onSubmit={e => { e.preventDefault(); handleEditSubmit(message); }} className="flex gap-2">
                          <Input value={editText} onChange={e => setEditText(e.target.value)} className="flex-1 bg-white text-black border border-gray-300" />
                          <Button type="submit" size="sm">Save</Button>
                          <Button type="button" size="sm" variant="ghost" onClick={() => setEditingMessageId(null)}>Cancel</Button>
                        </form>
                      ) : (
                        <>
                          <ReactMarkdown remarkPlugins={[remarkBreaks]}>{message.text}</ReactMarkdown>
                          {message.edited && <span className="ml-2 text-xs italic text-gray-400">(edited)</span>}
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs text-gray-400">{formatTimestamp(message.timestamp)}</span>
                      {isOwn && !isDeleted && (
                        <span className="inline-flex items-center">
                          {message.seenBy && otherUserId && message.seenBy.includes(otherUserId) ? (
                            <CheckCheck className="h-3 w-3 text-blue-400 ml-1" />
                          ) : (
                            <Check className="h-3 w-3 text-gray-300 ml-1" />
                          )}
                        </span>
                      )}
                    </div>
                    {isOwn && !isDeleted && editingMessageId !== message.id && (
                      <div className="flex gap-2 mt-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                        <Button size="sm" variant="ghost" onClick={() => handleEditMessage(message)}><Pencil className="h-4 w-4" /></Button>
                        <div className="relative">
                          <Button size="sm" variant="ghost" onClick={() => setOpenDropdownId(openDropdownId === message.id ? null : message.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          {openDropdownId === message.id && (
                            <div className="absolute right-0 z-10 mt-2 w-40 bg-white border rounded shadow-lg">
                              <button
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                                onClick={() => { handleDeleteMessage(message, false); setOpenDropdownId(null); }}
                              >
                                Delete for me
                              </button>
                              <button
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600"
                                onClick={() => { handleDeleteMessage(message, true); setOpenDropdownId(null); }}
                              >
                                Delete for everyone
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
            {otherTyping && (
              <div className="text-xs text-gray-500 mb-2">{otherUser.name} is typing...</div>
            )}
            {/* Context menu for reply */}
            {contextMenu && (
              <div
                className="fixed z-50 bg-white border rounded shadow-lg py-1 text-sm"
                style={{ left: contextMenu.x, top: contextMenu.y }}
                onContextMenu={e => e.preventDefault()}
              >
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onMouseDown={() => {
                    setReplyToMessage(contextMenu.message);
                    setContextMenu(null);
                  }}
                >
                  Reply
                </button>
              </div>
            )}
          </div>
          
          {/* Input */}
          <div className="p-4 border-t border-gray-100 bg-white shadow-sm">
            {replyToMessage && (
              <div className="flex items-center bg-gray-100 px-3 py-2 mb-2 rounded border-l-4 border-blue-400">
                <div className="flex-1">
                  <div className="text-xs text-gray-500">Replying to {replyToMessage.senderId === user?.uid ? 'yourself' : users[replyToMessage.senderId]?.name || 'User'}</div>
                  <div className="text-sm text-gray-700 truncate max-w-xs">{replyToMessage.text}</div>
                </div>
                <button className="ml-2 text-gray-400 hover:text-gray-600" onClick={() => setReplyToMessage(null)}>
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <Button type="button" size="icon" variant="ghost">
                <Image className="h-5 w-5 text-gray-400" />
              </Button>
              <Textarea
                ref={inputRef}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onInput={handleTyping}
                onKeyDown={handleKeyDown}
                placeholder="Write a message..."
                className="flex-1 bg-gray-50 px-4 py-2 focus:outline-none focus:ring-0 resize-none min-h-[40px] max-h-[120px] overflow-hidden"
                rows={1}
              />
              <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                <PopoverTrigger asChild>
                  <Button type="button" size="icon" variant="ghost" onClick={() => setShowEmojiPicker((v) => !v)}>
                    <Smile className="h-5 w-5 text-gray-400" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 border-none shadow-none bg-transparent" align="end" sideOffset={8}>
                  <Picker data={data} onEmojiSelect={handleEmojiSelect} theme="light" previewPosition="none" skinTonePosition="search" />
                </PopoverContent>
              </Popover>
              <Popover open={showFormatToolbar} onOpenChange={setShowFormatToolbar}>
                <PopoverTrigger asChild>
                  <Button type="button" size="icon" variant="ghost" onClick={() => setShowFormatToolbar((v) => !v)}>
                    <Type className="h-5 w-5 text-gray-400" />
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
              <Button type="submit" size="icon" disabled={messageText.trim() === ''} className="bg-blue-500 hover:bg-blue-600 text-white rounded-full">
                <Send className="h-5 w-5" />
              </Button>
            </form>
            <div className="text-xs text-gray-400 mt-2 text-center">
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
            <Button 
              className="mt-4"
              onClick={() => setShowNewConversation(true)}
            >
              Start a new conversation
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;
