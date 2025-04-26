
// import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Bell, Check, Heart, MessageSquare, User, Users, Calendar, Info } from 'lucide-react';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { Button } from '@/components/ui/button';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { notifications } from '@/data/notificationsData';

// const NotificationsPage = () => {
//   const [filter, setFilter] = useState('all');
//   const [viewMode, setViewMode] = useState('unread');
  
//   const getNotificationIcon = (type: string) => {
//     switch (type) {
//       case 'like':
//         return <Heart className="h-4 w-4 text-red-500" />;
//       case 'comment':
//         return <MessageSquare className="h-4 w-4 text-blue-500" />;
//       case 'friend':
//         return <User className="h-4 w-4 text-green-500" />;
//       case 'group':
//         return <Users className="h-4 w-4 text-purple-500" />;
//       case 'event':
//         return <Calendar className="h-4 w-4 text-orange-500" />;
//       case 'system':
//         return <Info className="h-4 w-4 text-gray-500" />;
//       default:
//         return <Bell className="h-4 w-4 text-gray-500" />;
//     }
//   };
  
//   const filteredNotifications = viewMode === 'all' 
//     ? notifications 
//     : notifications.filter(notification => 
//         viewMode === 'unread' ? !notification.isRead : notification.isRead
//       );
  
//   const hasUnreadNotifications = notifications.some(notification => !notification.isRead);

//   return (
//     <div>
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold">Notifications</h1>
//         {hasUnreadNotifications && (
//           <Button variant="outline" size="sm" className="gap-2">
//             <Check className="h-4 w-4" />
//             Mark all as read
//           </Button>
//         )}
//       </div>
      
//       <div className="flex justify-between items-center mb-6">
//         <Tabs value={viewMode} onValueChange={setViewMode} className="w-auto">
//           <TabsList>
//             <TabsTrigger value="unread">Unread</TabsTrigger>
//             <TabsTrigger value="read">Read</TabsTrigger>
//             <TabsTrigger value="all">All</TabsTrigger>
//           </TabsList>
//         </Tabs>
        
//         <Select value={filter} onValueChange={setFilter}>
//           <SelectTrigger className="w-[180px]">
//             <SelectValue placeholder="Filter by" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">- View All -</SelectItem>
//             <SelectItem value="mentions">Mentions</SelectItem>
//             <SelectItem value="comments">Comments</SelectItem>
//             <SelectItem value="likes">Likes</SelectItem>
//             <SelectItem value="friendRequests">Friend Requests</SelectItem>
//           </SelectContent>
//         </Select>
//       </div>
      
//       <div className="space-y-4">
//         {filteredNotifications.length === 0 ? (
//           <div className="flex flex-col items-center justify-center p-12 text-center">
//             <Bell className="h-12 w-12 text-gray-300 mb-4" />
//             <h3 className="text-lg font-semibold">You have no unread notifications</h3>
//             <p className="text-gray-500 mt-2">We'll notify you when something important happens</p>
//           </div>
//         ) : (
//           filteredNotifications.map((notification) => (
//             <Link 
//               key={notification.id} 
//               to={notification.link}
//               className={`block p-4 rounded-lg border transition-colors ${
//                 notification.isRead ? 'bg-white' : 'bg-blue-50'
//               } hover:bg-gray-50`}
//             >
//               <div className="flex items-start gap-3">
//                 <div className="flex-shrink-0 mt-1">
//                   {notification.user ? (
//                     <Avatar className="h-10 w-10">
//                       <AvatarImage src={notification.user.avatar} alt={notification.user.name} />
//                       <AvatarFallback>{notification.user.name.charAt(0)}</AvatarFallback>
//                     </Avatar>
//                   ) : (
//                     <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
//                       {getNotificationIcon(notification.type)}
//                     </div>
//                   )}
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <div className="flex items-start justify-between">
//                     <div>
//                       <p className="text-sm">
//                         {notification.user && (
//                           <span className="font-semibold">{notification.user.name} </span>
//                         )}
//                         <span>{notification.content}</span>
//                       </p>
//                       <span className="text-xs text-gray-500">{notification.timestamp}</span>
//                     </div>
//                     <span className="ml-2 flex-shrink-0">
//                       {getNotificationIcon(notification.type)}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </Link>
//           ))
//         )}
//       </div>
//     </div>
//   );
// };

// export default NotificationsPage;
