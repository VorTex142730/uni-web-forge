
// import React, { useState } from 'react';
// import { useParams, Link, useNavigate } from 'react-router-dom';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { 
//   Search, 
//   Edit, 
//   MoreVertical, 
//   Image, 
//   Video, 
//   Smile, 
//   Send, 
//   ChevronLeft,
//   MessageSquare
// } from 'lucide-react';
// import { Separator } from '@/components/ui/separator';
// import { conversations, messages, users } from '@/data/messagesData';

// const MessagesPage: React.FC = () => {
//   const { conversationId } = useParams<{ conversationId: string }>();
//   const navigate = useNavigate();
//   const [messageText, setMessageText] = useState('');
//   const [searchQuery, setSearchQuery] = useState('');
  
//   const filteredConversations = conversations.filter(conversation =>
//     users.find(user => conversation.participants.includes(user.id) && user.id !== 1)?.name
//       .toLowerCase()
//       .includes(searchQuery.toLowerCase())
//   );
  
//   const currentConversation = conversationId 
//     ? conversations.find(c => c.id === parseInt(conversationId))
//     : null;
    
//   const otherUserId = currentConversation?.participants.find(id => id !== 1);
//   const otherUser = users.find(user => user.id === otherUserId);
//   const currentMessages = conversationId ? messages[parseInt(conversationId)] || [] : [];
  
//   const handleSendMessage = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (messageText.trim() === '') return;
    
//     // In a real app, we'd add the message to the database
//     // and update the state accordingly
    
//     setMessageText('');
//   };
  
//   return (
//     <div className="flex h-[calc(100vh-80px)] -mt-4 -mx-4 overflow-hidden">
//       {/* Conversation List */}
//       <div className={`bg-white border-r border-gray-200 flex flex-col ${conversationId ? 'hidden md:flex w-1/3' : 'w-full md:w-1/3'}`}>
//         <div className="p-4 border-b border-gray-200">
//           <h1 className="text-2xl font-bold mb-4">Messages</h1>
//           <div className="flex gap-2">
//             <div className="relative flex-1">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
//               <Input
//                 placeholder="Search messages..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="pl-10"
//               />
//             </div>
//             <Button size="icon" variant="ghost">
//               <Edit className="h-5 w-5" />
//             </Button>
//           </div>
//         </div>
        
//         <div className="flex-1 overflow-y-auto">
//           {filteredConversations.length === 0 ? (
//             <div className="p-4 text-center text-gray-500">No conversations found</div>
//           ) : (
//             filteredConversations.map(conversation => {
//               const otherParticipantId = conversation.participants.find(id => id !== 1);
//               const otherParticipant = users.find(user => user.id === otherParticipantId);
//               const isSelected = conversationId === conversation.id.toString();
              
//               return (
//                 <Link
//                   key={conversation.id}
//                   to={`/messages/${conversation.id}`}
//                   className={`block p-4 hover:bg-gray-50 transition-colors ${
//                     isSelected ? 'bg-gray-100' : ''
//                   } ${!conversation.isRead ? 'bg-blue-50 hover:bg-blue-50' : ''}`}
//                 >
//                   <div className="flex items-center gap-3">
//                     <div className="relative">
//                       <Avatar className="h-12 w-12">
//                         <AvatarImage src={otherParticipant?.avatar} />
//                         <AvatarFallback>{otherParticipant?.name.charAt(0)}</AvatarFallback>
//                       </Avatar>
//                       {otherParticipant?.status === 'online' && (
//                         <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
//                       )}
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <div className="flex justify-between items-start">
//                         <h3 className="font-semibold truncate">{otherParticipant?.name}</h3>
//                         <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
//                           {conversation.lastMessage.timestamp}
//                         </span>
//                       </div>
//                       <p className="text-sm text-gray-600 truncate">
//                         {conversation.lastMessage.senderId === 1 ? 'You: ' : ''}
//                         {conversation.lastMessage.text}
//                       </p>
//                     </div>
//                   </div>
//                 </Link>
//               );
//             })
//           )}
//         </div>
//       </div>
      
//       {/* Message Detail */}
//       {currentConversation && otherUser ? (
//         <div className={`bg-white flex flex-col ${conversationId ? 'w-full md:w-2/3' : 'hidden md:flex md:w-2/3'}`}>
//           {/* Header */}
//           <div className="p-4 border-b border-gray-200 flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <Button 
//                 variant="ghost" 
//                 size="icon" 
//                 className="md:hidden"
//                 onClick={() => navigate('/messages')}
//               >
//                 <ChevronLeft className="h-5 w-5" />
//               </Button>
//               <Avatar className="h-10 w-10">
//                 <AvatarImage src={otherUser.avatar} />
//                 <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
//               </Avatar>
//               <div>
//                 <h3 className="font-semibold">{otherUser.name}</h3>
//                 <p className="text-xs text-gray-500">
//                   {otherUser.status === 'online' 
//                     ? 'Online' 
//                     : `Last active ${otherUser.lastActive}`}
//                 </p>
//               </div>
//             </div>
//             <Button variant="ghost" size="icon">
//               <MoreVertical className="h-5 w-5" />
//             </Button>
//           </div>
          
//           {/* Messages */}
//           <div className="flex-1 overflow-y-auto p-4 space-y-4">
//             {currentMessages.map(message => {
//               const isOwn = message.senderId === 1;
//               const sender = users.find(u => u.id === message.senderId);
              
//               return (
//                 <div 
//                   key={message.id} 
//                   className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
//                 >
//                   {!isOwn && (
//                     <Avatar className="h-8 w-8 mr-2 mt-1">
//                       <AvatarImage src={sender?.avatar} />
//                       <AvatarFallback>{sender?.name.charAt(0)}</AvatarFallback>
//                     </Avatar>
//                   )}
//                   <div className="max-w-[70%]">
//                     <div 
//                       className={`p-3 rounded-lg ${
//                         isOwn 
//                           ? 'bg-blue-500 text-white rounded-br-none' 
//                           : 'bg-gray-100 text-gray-900 rounded-bl-none'
//                       }`}
//                     >
//                       {message.text}
//                     </div>
//                     <div 
//                       className={`text-xs text-gray-500 mt-1 ${
//                         isOwn ? 'text-right' : 'text-left'
//                       }`}
//                     >
//                       {message.timestamp}
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
          
//           {/* Input */}
//           <div className="p-4 border-t border-gray-200">
//             <form onSubmit={handleSendMessage} className="flex items-center gap-2">
//               <Button type="button" size="icon" variant="ghost">
//                 <Image className="h-5 w-5 text-gray-500" />
//               </Button>
//               <Button type="button" size="icon" variant="ghost">
//                 <Video className="h-5 w-5 text-gray-500" />
//               </Button>
//               <Input
//                 value={messageText}
//                 onChange={(e) => setMessageText(e.target.value)}
//                 placeholder="Write a message..."
//                 className="flex-1"
//               />
//               <Button type="button" size="icon" variant="ghost">
//                 <Smile className="h-5 w-5 text-gray-500" />
//               </Button>
//               <Button type="submit" size="icon" disabled={messageText.trim() === ''}>
//                 <Send className="h-5 w-5" />
//               </Button>
//             </form>
//             <div className="text-xs text-gray-500 mt-2 text-center">
//               Enter to Send • Shift+Enter to add a new line
//             </div>
//           </div>
//         </div>
//       ) : (
//         <div className="hidden md:flex md:w-2/3 items-center justify-center bg-gray-50">
//           <div className="text-center p-8">
//             <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
//               <MessageSquare className="h-10 w-10 text-blue-600" />
//             </div>
//             <h3 className="mt-4 text-lg font-semibold">Your Messages</h3>
//             <p className="mt-1 text-sm text-gray-500">
//               Select a conversation to start messaging
//             </p>
//             <Button className="mt-4">Start a new conversation</Button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default MessagesPage;
