// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { ChevronDown, User, Users, Clock, Bell, MessageSquare, UserPlus, Image, Video, Mail, LogOut } from 'lucide-react';
// import { cn } from '@/lib/utils';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';
// import { useAuth } from '@/context/AuthContext';
// import { useSidebar } from '@/context/SidebarContext';

// const Header: React.FC = () => {
//   const [searchQuery, setSearchQuery] = useState('');
//   const { user, signOut } = useAuth();
//   const { expanded } = useSidebar();
//   const navigate = useNavigate();
  
//   const handleNavigation = (path: string) => {
//     navigate(path);
//   };

//   const handleLogout = async () => {
//     try {
//       await signOut();
//       navigate('/login');
//     } catch (error) {
//       console.error('Error signing out:', error);
//     }
//   };

//   return (
//     <header className="fixed top-0 left-0 w-full bg-white border-b border-border z-10">
//       <div className={cn(
//         "flex justify-between items-center px-4 py-2 transition-all duration-300",
//         expanded ? "pl-60" : "pl-20"
//       )}>
//         <div className="flex items-center">
//           <Link to="/" className="text-2xl font-bold">HotSpoT</Link>
//         </div>
        
//         <div className="flex-1 mx-8 max-w-md">
//           <div className="relative">
//             <input
//               type="text"
//               placeholder="Search..."
//               className="w-full bg-gray-100 rounded-full px-4 py-2 pl-10 text-sm"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//             />
//             <div className="absolute inset-y-0 left-0 flex items-center pl-3">
//               <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//               </svg>
//             </div>
//           </div>
//         </div>
        
//         <div className="flex items-center space-x-6">
//           <Link to="/messages" className="relative hover:text-primary">
//             <MessageSquare className="h-5 w-5" />
//           </Link>
          
//           <Link to="/notifications" className="relative hover:text-primary">
//             <Bell className="h-5 w-5" />
//           </Link>
          
//           <Link to="/cart" className="relative hover:text-primary">
//             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//               <circle cx="9" cy="21" r="1"></circle>
//               <circle cx="20" cy="21" r="1"></circle>
//               <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
//             </svg>
//           </Link>
          
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <button className="flex items-center space-x-2 cursor-pointer">
//                 <span className="text-sm">Raviraj</span>
//                 <ChevronDown size={16} />
//               </button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end" className="w-[240px] p-0">
//               <div className="px-4 py-3 border-b border-gray-100">
//                 <div className="flex items-center gap-3">
//                   <Avatar className="h-10 w-10">
//                     <AvatarFallback>R</AvatarFallback>
//                   </Avatar>
//                   <div className="flex flex-col">
//                     <span className="font-medium">Raviraj</span>
//                     <span className="text-sm text-gray-500">@Vortex</span>
//                   </div>
//                 </div>
//               </div>
              
//               <div className="py-1">
//                 <DropdownMenuItem className="px-4 py-2.5 cursor-pointer text-gray-600 hover:bg-gray-50 flex items-center">
//                   <User className="mr-3 h-4 w-4" />
//                   <span>Profile</span>
//                 </DropdownMenuItem>
                
//                 <DropdownMenuItem className="px-4 py-2.5 cursor-pointer text-gray-600 hover:bg-gray-50 flex items-center">
//                   <User className="mr-3 h-4 w-4" />
//                   <span>Account</span>
//                 </DropdownMenuItem>
                
//                 <DropdownMenuItem className="px-4 py-2.5 cursor-pointer text-gray-600 hover:bg-gray-50 flex items-center">
//                   <Clock className="mr-3 h-4 w-4" />
//                   <span>Timeline</span>
//                 </DropdownMenuItem>
                
//                 <DropdownMenuItem className="px-4 py-2.5 cursor-pointer text-gray-600 hover:bg-gray-50 flex items-center justify-between">
//                   <div className="flex items-center">
//                     <Bell className="mr-3 h-4 w-4" />
//                     <span>Notifications</span>
//                   </div>
//                   <div className="h-2 w-2 bg-red-500 rounded-full"></div>
//                 </DropdownMenuItem>
                
//                 <DropdownMenuItem className="px-4 py-2.5 cursor-pointer text-gray-600 hover:bg-gray-50 flex items-center">
//                   <MessageSquare className="mr-3 h-4 w-4" />
//                   <span>Messages</span>
//                 </DropdownMenuItem>
                
//                 <DropdownMenuItem className="px-4 py-2.5 cursor-pointer text-gray-600 hover:bg-gray-50 flex items-center justify-between">
//                   <div className="flex items-center">
//                     <UserPlus className="mr-3 h-4 w-4" />
//                     <span>Connections</span>
//                   </div>
//                   <div className="h-2 w-2 bg-red-500 rounded-full"></div>
//                 </DropdownMenuItem>
                
//                 <DropdownMenuItem className="px-4 py-2.5 cursor-pointer text-gray-600 hover:bg-gray-50 flex items-center">
//                   <Users className="mr-3 h-4 w-4" />
//                   <span>Groups</span>
//                 </DropdownMenuItem>
                
//                 <DropdownMenuItem className="px-4 py-2.5 cursor-pointer text-gray-600 hover:bg-gray-50 flex items-center">
//                   <MessageSquare className="mr-3 h-4 w-4" />
//                   <span>Forums</span>
//                 </DropdownMenuItem>
                
//                 <DropdownMenuItem className="px-4 py-2.5 cursor-pointer text-gray-600 hover:bg-gray-50 flex items-center">
//                   <Image className="mr-3 h-4 w-4" />
//                   <span>Photos</span>
//                 </DropdownMenuItem>
                
//                 <DropdownMenuItem className="px-4 py-2.5 cursor-pointer text-gray-600 hover:bg-gray-50 flex items-center">
//                   <Video className="mr-3 h-4 w-4" />
//                   <span>Videos</span>
//                 </DropdownMenuItem>
                
//                 <DropdownMenuItem className="px-4 py-2.5 cursor-pointer text-gray-600 hover:bg-gray-50 flex items-center">
//                   <Mail className="mr-3 h-4 w-4" />
//                   <span>Email Invites</span>
//                 </DropdownMenuItem>
                
//                 <DropdownMenuItem 
//                   className="px-4 py-2.5 cursor-pointer text-gray-600 hover:bg-gray-50 flex items-center"
//                   onClick={handleLogout}
//                 >
//                   <LogOut className="mr-3 h-4 w-4" />
//                   <span>Log Out</span>
//                 </DropdownMenuItem>
//               </div>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Header;