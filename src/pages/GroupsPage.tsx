
// import React, { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { 
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import { Grid, ListFilter, Search, Plus, LayoutGrid, List } from 'lucide-react';
// import GroupCard from '@/components/groups/GroupCard';
// import { groups } from '@/data/mockData';
// import { Link } from 'react-router-dom';

// const GroupsPage = () => {
//   const [view, setView] = useState<'grid' | 'list'>('grid');
//   const [sortBy, setSortBy] = useState('recently-active');
//   const [searchQuery, setSearchQuery] = useState('');
  
//   return (
//     <div>
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold">Groups</h1>
        
//         <div className="flex gap-4">
//           <Button variant="outline" className="gap-1" asChild>
//             <Link to="#all-groups">
//               All Groups
//               <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-xs text-red-600">
//                 {groups.length}
//               </span>
//             </Link>
//           </Button>
          
//           <Button className="gap-2">
//             <Plus className="h-4 w-4" />
//             Create a Group
//           </Button>
//         </div>
//       </div>
      
//       <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
//         <div className="flex flex-col md:flex-row gap-4">
//           <div className="flex-1 relative">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
//             <Input
//               placeholder="Search Groups..."
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
//                 <SelectItem value="most-members">Most Members</SelectItem>
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
//         {groups.map(group => (
//           <GroupCard key={group.id} group={group} />
//         ))}
//       </div>
      
//       <div className="mt-8 text-center text-sm text-gray-500">
//         <p>Viewing 1 - {groups.length} of {groups.length} groups</p>
//       </div>
//     </div>
//   );
// };

// export default GroupsPage;
