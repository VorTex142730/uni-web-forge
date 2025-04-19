
// import React, { useState } from 'react';
// import { Input } from '@/components/ui/input';
// import { Search } from 'lucide-react';
// import ForumCard from '@/components/forums/ForumCard';
// import { forums } from '@/data/mockData';

// const ForumsPage = () => {
//   const [searchQuery, setSearchQuery] = useState('');
  
//   return (
//     <div>
//       <h1 className="text-3xl font-bold mb-6">Forums</h1>
      
//       <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
//         <div className="relative">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
//           <Input
//             placeholder="Search forums..."
//             className="pl-10"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//           />
//         </div>
//       </div>
      
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {forums.map(forum => (
//           <ForumCard key={forum.id} forum={forum} />
//         ))}
//       </div>
//     </div>
//   );
// };

// export default ForumsPage;
