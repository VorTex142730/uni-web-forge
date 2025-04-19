
// import React, { useState } from 'react';
// import { Input } from '@/components/ui/input';
// import { 
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import { ListFilter, Search, LayoutGrid, List } from 'lucide-react';
// import MemberCard from '@/components/members/MemberCard';
// import { users, currentUser } from '@/data/mockData';
// import { useAuth } from '@/context/AuthContext';

// const MembersPage = () => {
//   const [view, setView] = useState<'grid' | 'list'>('grid');
//   const [sortBy, setSortBy] = useState('recently-active');
//   const [searchQuery, setSearchQuery] = useState('');
//   const { user } = useAuth();
  
//   return (
//     <div>
//       <h1 className="text-3xl font-bold mb-6">Members</h1>
      
//       <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
//         <div className="flex flex-col md:flex-row gap-4">
//           <div className="flex-1 relative">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
//             <Input
//               placeholder="Search Members..."
//               className="pl-10"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//             />
//           </div>
          
//           <div className="flex gap-4">
//             <Select value={sortBy} onValueChange={setSortBy}>
//               <SelectTrigger className="w-[180px]">
//                 <ListFilter className="h-4 w-4 mr-2" />
//                 <SelectValue placeholder="Recently Active" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="recently-active">Recently Active</SelectItem>
//                 <SelectItem value="newest">Newest</SelectItem>
//                 <SelectItem value="alphabetical">Alphabetical</SelectItem>
//               </SelectContent>
//             </Select>
            
//             <div className="flex border rounded-md overflow-hidden">
//               <button
//                 className={`p-2 ${view === 'grid' ? 'bg-gray-200' : 'bg-white'}`}
//                 onClick={() => setView('grid')}
//               >
//                 <LayoutGrid className="h-5 w-5" />
//               </button>
//               <button
//                 className={`p-2 ${view === 'list' ? 'bg-gray-200' : 'bg-white'}`}
//                 onClick={() => setView('list')}
//               >
//                 <List className="h-5 w-5" />
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
      
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         {users.map(member => (
//           <MemberCard 
//             key={member.id} 
//             member={member} 
//             isCurrentUser={user?.id === member.id}
//           />
//         ))}
//       </div>
      
//       <div className="mt-8 text-center text-sm text-gray-500">
//         <p>Viewing 1 - {users.length} of {users.length} members</p>
//       </div>
//     </div>
//   );
// };

// export default MembersPage;
