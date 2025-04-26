// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { doc, getDoc, collection, getDocs, query, where, addDoc } from 'firebase/firestore';
// import { db } from '@/config/firebaseConfig';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Card } from '@/components/ui/card';
// import { MoreHorizontal, Search, LayoutGrid, List } from 'lucide-react';
// import { toast } from 'sonner';
// import { useAuth } from '@/context/AuthContext';

// // Default images
// const DEFAULT_COVER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjQwMCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDgiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Hcm91cCBDb3ZlcjwvdGV4dD48L3N2Zz4=';

// interface GroupMember {
//   id: string;
//   userId: string;
//   role: 'admin' | 'moderator' | 'member';
//   joinedAt: string;
//   displayName: string;
//   photoURL?: string;
// }

// interface Group {
//   id: string;
//   name: string;
//   description?: string;
//   createdAt: string;
//   lastActive: string;
//   createdBy: string;
//   privacy: 'public' | 'private';
//   memberCount: number;
//   coverImage?: string;
// }

// const GroupDetailsPage = () => {
//   const { groupId } = useParams();
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const [group, setGroup] = useState<Group | null>(null);
//   const [members, setMembers] = useState<GroupMember[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [activeTab, setActiveTab] = useState('members');
//   const [isMember, setIsMember] = useState(false);
//   const [memberRole, setMemberRole] = useState<'admin' | 'moderator' | 'member' | null>(null);
//   const [membersView, setMembersView] = useState<'grid' | 'list'>('grid');
//   const [searchQuery, setSearchQuery] = useState('');

//   useEffect(() => {
//     const fetchGroupData = async () => {
//       if (!groupId) return;
      
//       setLoading(true);
//       setError(null);

//       try {
//         // Fetch group details
//         const groupDoc = await getDoc(doc(db, 'groups', groupId));
//         if (!groupDoc.exists()) {
//           setError('Group not found');
//           return;
//         }

//         const groupData = groupDoc.data() as Group;
//         setGroup({ id: groupDoc.id, ...groupData });

//         // Fetch group members
//         const membersQuery = query(
//           collection(db, 'groupMembers'),
//           where('groupId', '==', groupId)
//         );
//         const membersSnapshot = await getDocs(membersQuery);
//         const membersData = membersSnapshot.docs.map(doc => ({
//           id: doc.id,
//           ...doc.data()
//         })) as GroupMember[];
//         setMembers(membersData);

//         // Check if current user is a member
//         if (user) {
//           const userMember = membersData.find(member => member.userId === user.uid);
//           setIsMember(!!userMember);
//           setMemberRole(userMember?.role || null);
//         }

//       } catch (error) {
//         console.error('Error fetching group data:', error);
//         setError('Failed to load group data');
//         toast.error('Failed to load group data');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchGroupData();
//   }, [groupId, user]);

//   const handleJoinGroup = async () => {
//     if (!user || !groupId) return;

//     try {
//       // Check if user is already a member
//       if (isMember) {
//         toast.error('You are already a member of this group');
//         return;
//       }

//       // Add join request to Firestore
//       await addDoc(collection(db, 'groupJoinRequests'), {
//         groupId,
//         userId: user.uid,
//         status: 'pending',
//         createdAt: new Date().toISOString(),
//         displayName: user.displayName || 'Anonymous',
//         photoURL: user.photoURL
//       });

//       toast.success('Join request sent successfully');
//     } catch (error) {
//       console.error('Error sending join request:', error);
//       toast.error('Failed to send join request');
//     }
//   };

//   const getInitials = (name: string) => {
//     return name
//       .split(' ')
//       .map(part => part[0])
//       .join('')
//       .toUpperCase();
//   };

//   const generateGradient = (text: string) => {
//     // Generate a consistent color based on the text
//     let hash = 0;
//     for (let i = 0; i < text.length; i++) {
//       hash = text.charCodeAt(i) + ((hash << 5) - hash);
//     }
    
//     const h1 = hash % 360;
//     const h2 = (hash * 2) % 360;
//     return `from-[hsl(${h1},70%,50%)] to-[hsl(${h2},70%,50%)]`;
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//       </div>
//     );
//   }

//   if (error || !group) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen">
//         <p className="text-red-600 mb-4">{error || 'Group not found'}</p>
//         <Button onClick={() => navigate('/groups')}>Back to Groups</Button>
//       </div>
//     );
//   }

//   const filteredMembers = members.filter(member =>
//     member.displayName.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Cover Image */}
//       <div className={`h-64 relative bg-gradient-to-br ${group ? generateGradient(group.name) : ''}`}>
//         {group?.coverImage && (
//           <img 
//             src={group.coverImage} 
//             alt={group.name} 
//             className="w-full h-full object-cover"
//             onError={(e) => {
//               // Remove the image on error and show the gradient background
//               (e.target as HTMLImageElement).style.display = 'none';
//             }}
//           />
//         )}
//         <div className="absolute inset-0 flex items-center justify-center">
//           <span className="text-white text-6xl font-bold">
//             {group && getInitials(group.name)}
//           </span>
//         </div>
//       </div>

//       {/* Group Info */}
//       <div className="max-w-7xl mx-auto px-4 -mt-8">
//         <Card className="bg-white shadow-lg">
//           <div className="p-6">
//             <div className="flex justify-between items-start">
//               <div>
//                 <div className="flex items-center space-x-2">
//                   <h1 className="text-2xl font-semibold">{group.name}</h1>
//                   <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
//                     Group
//                   </span>
//                 </div>
//                 <p className="text-sm text-gray-500 mt-1">
//                   {group.privacy} • {members.length} members
//                 </p>
//               </div>
//               <div className="flex items-center space-x-2">
//                 {!isMember && (
//                   <Button
//                     variant="default"
//                     className="bg-blue-600 hover:bg-blue-700 text-white"
//                     onClick={handleJoinGroup}
//                   >
//                     Join Group
//                   </Button>
//                 )}
//                 <button className="p-2 hover:bg-gray-100 rounded-full">
//                   <MoreHorizontal className="text-gray-500" size={20} />
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Navigation */}
//           <div className="border-t">
//             <div className="flex items-center px-6">
//               <button
//                 className={`px-4 py-3 text-sm font-medium border-b-2 ${
//                   activeTab === 'members'
//                     ? 'border-blue-600 text-blue-600'
//                     : 'border-transparent text-gray-500 hover:text-gray-700'
//                 }`}
//                 onClick={() => setActiveTab('members')}
//               >
//                 Members
//                 <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
//                   {members.length}
//                 </span>
//               </button>
//               <button
//                 className={`px-4 py-3 text-sm font-medium border-b-2 ${
//                   activeTab === 'feed'
//                     ? 'border-blue-600 text-blue-600'
//                     : 'border-transparent text-gray-500 hover:text-gray-700'
//                 }`}
//                 onClick={() => setActiveTab('feed')}
//               >
//                 Feed
//               </button>
//               <button
//                 className={`px-4 py-3 text-sm font-medium border-b-2 ${
//                   activeTab === 'photos'
//                     ? 'border-blue-600 text-blue-600'
//                     : 'border-transparent text-gray-500 hover:text-gray-700'
//                 }`}
//                 onClick={() => setActiveTab('photos')}
//               >
//                 Photos
//               </button>
//               <button
//                 className={`px-4 py-3 text-sm font-medium border-b-2 ${
//                   activeTab === 'videos'
//                     ? 'border-blue-600 text-blue-600'
//                     : 'border-transparent text-gray-500 hover:text-gray-700'
//                 }`}
//                 onClick={() => setActiveTab('videos')}
//               >
//                 Videos
//               </button>
//               <button
//                 className={`px-4 py-3 text-sm font-medium border-b-2 ${
//                   activeTab === 'albums'
//                     ? 'border-blue-600 text-blue-600'
//                     : 'border-transparent text-gray-500 hover:text-gray-700'
//                 }`}
//                 onClick={() => setActiveTab('albums')}
//               >
//                 Albums
//               </button>
//             </div>
//           </div>
//         </Card>

//         {/* Content Area */}
//         <div className="mt-6">
//           {activeTab === 'members' && (
//             <Card className="bg-white">
//               <div className="p-6">
//                 <div className="flex justify-between items-center mb-6">
//                   <div className="relative flex-1 max-w-sm">
//                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
//                     <Input
//                       type="search"
//                       placeholder="Search Members..."
//                       className="pl-10"
//                       value={searchQuery}
//                       onChange={(e) => setSearchQuery(e.target.value)}
//                     />
//                   </div>
//                   <div className="flex items-center border rounded-lg p-1">
//                     <button
//                       className={`p-2 rounded ${membersView === 'grid' ? 'bg-gray-100' : ''}`}
//                       onClick={() => setMembersView('grid')}
//                     >
//                       <LayoutGrid size={18} />
//                     </button>
//                     <button
//                       className={`p-2 rounded ${membersView === 'list' ? 'bg-gray-100' : ''}`}
//                       onClick={() => setMembersView('list')}
//                     >
//                       <List size={18} />
//                     </button>
//                   </div>
//                 </div>

//                 <div className="mb-6">
//                   <h3 className="text-lg font-medium mb-4">Organizers</h3>
//                   <div className={`grid ${
//                     membersView === 'grid' ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6' : 'grid-cols-1'
//                   } gap-4`}>
//                     {filteredMembers
//                       .filter(member => ['admin', 'moderator'].includes(member.role))
//                       .map(member => (
//                         <div key={member.id} className="flex flex-col items-center p-4 border rounded-lg">
//                           <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-medium mb-2">
//                             {getInitials(member.displayName)}
//                           </div>
//                           <h4 className="font-medium text-center">{member.displayName}</h4>
//                           <p className="text-sm text-gray-500 capitalize">{member.role}</p>
//                         </div>
//                       ))}
//                   </div>
//                 </div>

//                 <div>
//                   <h3 className="text-lg font-medium mb-4">Members</h3>
//                   <div className={`grid ${
//                     membersView === 'grid' ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6' : 'grid-cols-1'
//                   } gap-4`}>
//                     {filteredMembers
//                       .filter(member => member.role === 'member')
//                       .map(member => (
//                         <div key={member.id} className="flex flex-col items-center p-4 border rounded-lg">
//                           <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-medium mb-2">
//                             {getInitials(member.displayName)}
//                           </div>
//                           <h4 className="font-medium text-center">{member.displayName}</h4>
//                           <p className="text-sm text-gray-500 capitalize">{member.role}</p>
//                         </div>
//                       ))}
//                   </div>
//                 </div>
//               </div>
//             </Card>
//           )}

//           {activeTab === 'feed' && (
//             <Card className="bg-white p-6">
//               <div className="text-center text-gray-500">No posts yet</div>
//             </Card>
//           )}

//           {activeTab === 'photos' && (
//             <Card className="bg-white p-6">
//               <div className="text-center text-gray-500">No photos yet</div>
//             </Card>
//           )}

//           {activeTab === 'videos' && (
//             <Card className="bg-white p-6">
//               <div className="text-center text-gray-500">No videos yet</div>
//             </Card>
//           )}

//           {activeTab === 'albums' && (
//             <Card className="bg-white p-6">
//               <div className="text-center text-gray-500">No albums yet</div>
//             </Card>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default GroupDetailsPage; 