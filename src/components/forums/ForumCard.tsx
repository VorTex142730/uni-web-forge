
// import React from 'react';
// import { Link } from 'react-router-dom';
// import { Forum } from '@/types';

// interface ForumCardProps {
//   forum: Forum;
// }

// const ForumCard: React.FC<ForumCardProps> = ({ forum }) => {
//   return (
//     <div className="mb-8">
//       <div className="relative h-48 w-full rounded-lg overflow-hidden bg-gray-200 mb-3">
//         <img 
//           src={forum.image || '/placeholder.svg'} 
//           alt={forum.name}
//           className="w-full h-full object-cover"
//         />
//       </div>
      
//       <Link to={`/forums/${forum.id}`} className="text-xl font-semibold hover:text-blue-600">
//         {forum.name}
//       </Link>
      
//       {forum.description && (
//         <p className="text-gray-600 mt-1">{forum.description}</p>
//       )}
      
//       <p className="text-gray-500 text-sm mt-2">
//         {forum.discussions === 0 ? 'No Discussions' : `${forum.discussions} Discussions`}
//         {forum.lastActive && ` • Last active ${forum.lastActive}`}
//       </p>
//     </div>
//   );
// };

// export default ForumCard;
