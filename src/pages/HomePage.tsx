import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Image, Video, MoreVertical, ThumbsUp } from 'lucide-react';
import { collection, getDocs, query, orderBy, limit, where, Timestamp, addDoc } from 'firebase/firestore';
import { db, auth } from '@/config/firebaseConfig';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface Update {
  id: string;
  type: 'group_created' | 'post';
  user: {
    name: string;
    avatar: string;
  };
  content?: string;
  group?: {
    name: string;
    type: string;
  };
  timestamp: any;
  likes: string[];
}

interface Member {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
}

const HomePage = () => {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [activeMembers, setActiveMembers] = useState<Member[]>([]);
  const [postContent, setPostContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Profile completion data
  const profileCompletion = {
    percentage: 71,
    details: { completed: 5, total: 5 },
    profilePhoto: { completed: 0, total: 1 },
    coverPhoto: { completed: 0, total: 1 }
  };

  // Mock group data
  const groups = [
    {
      id: '1',
      name: 'dsfas',
      memberCount: 1,
      avatar: '/default-group.png'
    }
  ];

  // Forum statistics
  const forumStats = {
    registeredMembers: 25,
    publicForums: 3
  };

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const updatesQuery = query(
          collection(db, 'updates'),
          orderBy('timestamp', 'desc'),
          limit(10)
        );
        const snapshot = await getDocs(updatesQuery);
        const updatesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate()
        })) as Update[];
        setUpdates(updatesData);
      } catch (error) {
        console.error('Error fetching updates:', error);
      }
    };

    const fetchActiveMembers = async () => {
      try {
        const now = Timestamp.now();
        const fiveMinutesAgo = new Timestamp(now.seconds - 300, now.nanoseconds);
        
        const membersQuery = query(
          collection(db, 'users'),
          where('lastActive', '>=', fiveMinutesAgo),
          limit(5)
        );
        const snapshot = await getDocs(membersQuery);
        const membersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          isOnline: true
        })) as Member[];
        setActiveMembers(membersData);
      } catch (error) {
        console.error('Error fetching active members:', error);
      }
    };

    const fetchGroups = async () => {
      try {
        const groupsQuery = query(
          collection(db, 'groups'),
          orderBy('lastActive', 'desc'),
          limit(5)
        );
        const snapshot = await getDocs(groupsQuery);
        const groupsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        // Update groups state here if needed
      } catch (error) {
        console.error('Error fetching groups:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUpdates();
    fetchActiveMembers();
    fetchGroups();
  }, []);

  const handlePostSubmit = async () => {
    if (!postContent.trim() || !auth.currentUser) return;

    try {
      const updateData = {
        type: 'post',
        user: {
          name: auth.currentUser.displayName,
          avatar: auth.currentUser.photoURL,
          id: auth.currentUser.uid
        },
        content: postContent,
        timestamp: Timestamp.now(),
        likes: []
      };

      await addDoc(collection(db, 'updates'), updateData);
      setPostContent('');
      // Refresh updates
      const updatesQuery = query(
        collection(db, 'updates'),
        orderBy('timestamp', 'desc'),
        limit(10)
      );
      const snapshot = await getDocs(updatesQuery);
      const updatesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      })) as Update[];
      setUpdates(updatesData);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Main grid container - stack on mobile, grid on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Sidebar - Full width on mobile */}
        <div className="md:col-span-3 space-y-6">
          {/* Profile Completion Card */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="font-semibold mb-4">COMPLETE YOUR PROFILE</h2>
            <div className="relative w-24 h-24 md:w-32 md:h-32 mx-auto mb-4">
              <svg viewBox="0 0 100 100" className="transform -rotate-90">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="6"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="6"
                  strokeDasharray={`${profileCompletion.percentage * 2.83} 283`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold">{profileCompletion.percentage}%</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-green-500 mr-2" />
                  Details
                </span>
                <span className="text-sm text-gray-500">{profileCompletion.details.completed}/{profileCompletion.details.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <div className="w-4 h-4 rounded-full border-2 mr-2" />
                  Profile Photo
                </span>
                <span className="text-sm text-gray-500">{profileCompletion.profilePhoto.completed}/{profileCompletion.profilePhoto.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <div className="w-4 h-4 rounded-full border-2 mr-2" />
                  Cover Photo
                </span>
                <span className="text-sm text-gray-500">{profileCompletion.coverPhoto.completed}/{profileCompletion.coverPhoto.total}</span>
              </div>
            </div>
          </div>

          {/* Groups Card */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">GROUPS</h2>
              <div className="flex space-x-4">
                <button className="text-sm text-gray-600 hidden md:block">Newest</button>
                <button className="text-sm text-gray-600 hidden md:block">Active</button>
                <button className="text-sm text-red-500">Popular</button>
              </div>
            </div>
            <div className="space-y-4">
              {groups.map(group => (
                <div key={group.id} className="flex items-center space-x-3">
                  <img src={group.avatar} alt={group.name} className="w-10 h-10 rounded-full" />
                  <div>
                    <h3 className="font-medium">{group.name}</h3>
                    <p className="text-sm text-gray-500">{group.memberCount} member</p>
                  </div>
                </div>
              ))}
              <Link to="/groups" className="text-red-500 text-sm">
                SEE ALL →
              </Link>
            </div>
          </div>

          {/* Forum Statistics */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="font-semibold mb-4">FORUM STATISTICS</h2>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <h3 className="text-3xl font-bold">{forumStats.registeredMembers}</h3>
                <p className="text-sm text-gray-500">Registered Members</p>
              </div>
              <div>
                <h3 className="text-3xl font-bold">{forumStats.publicForums}</h3>
                <p className="text-sm text-gray-500">Public Forums</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Full width on mobile */}
        <div className="md:col-span-6">
          <h1 className="text-xl md:text-2xl font-semibold mb-6">Homepage</h1>
          
          {/* Post Creation */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-4">
              <div className="flex items-start space-x-3">
                <Avatar className="hidden md:block">
                  <AvatarImage src={auth.currentUser?.photoURL || undefined} />
                  <AvatarFallback>
                    {auth.currentUser?.displayName?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Input
                    placeholder="Share what's on your mind..."
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    className="w-full"
                  />
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between mt-4 space-y-4 md:space-y-0">
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center text-gray-600">
                        <Image className="w-5 h-5 mr-2" />
                        Photo
                      </button>
                      <button className="flex items-center text-gray-600">
                        <Video className="w-5 h-5 mr-2" />
                        Video
                      </button>
                    </div>
                    <Button
                      onClick={handlePostSubmit}
                      disabled={!postContent.trim()}
                      className="w-full md:w-auto"
                    >
                      Post
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Updates Feed */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
              <h2 className="font-semibold">All Updates</h2>
              <Input
                placeholder="Search Feed..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-64"
              />
            </div>

            {/* Update Items */}
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : updates.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No updates yet
                </div>
              ) : (
                updates.map((update) => (
                  <div key={update.id} className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8 md:w-10 md:h-10">
                          <AvatarImage src={update.user.avatar} />
                          <AvatarFallback>{update.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm md:text-base">
                            <span className="font-medium">{update.user.name}</span>
                            {update.type === 'group_created' && (
                              <> created the group <span className="font-medium">{update.group?.name}</span></>
                            )}
                          </p>
                          <span className="text-xs md:text-sm text-gray-500">
                            {formatDistanceToNow(update.timestamp, { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      <button>
                        <MoreVertical className="w-5 h-5 text-gray-500" />
                      </button>
                    </div>
                    {update.content && (
                      <p className="mt-3 text-sm md:text-base">{update.content}</p>
                    )}
                    <div className="mt-4">
                      <button className="flex items-center text-gray-600">
                        <ThumbsUp className="w-5 h-5 mr-2" />
                        Like
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Hidden on mobile, shown on desktop */}
        <div className="hidden md:block md:col-span-3">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="font-semibold mb-4">MEMBERS</h2>
            <div className="flex space-x-4 mb-4">
              <button className="text-sm text-gray-600">Newest</button>
              <button className="text-sm text-red-500">Active</button>
              <button className="text-sm text-gray-600">Popular</button>
            </div>
            <div className="space-y-4">
              {activeMembers.map((member) => (
                <div key={member.id} className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {member.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <span className="font-medium">{member.name}</span>
                </div>
              ))}
              <Link to="/members" className="text-red-500 text-sm">
                SEE ALL →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 