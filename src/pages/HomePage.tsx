import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Image, Video, MoreVertical, ThumbsUp, Users, MessageSquare, BookOpen, Search } from 'lucide-react';
import { collection, getDocs, query, orderBy, limit, where, Timestamp, addDoc, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/config/firebaseConfig';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import ImageUpload from '@/components/ImageUpload';
import { GroupAvatar } from '@/components/groups/GroupAvatar';

interface Update {
  id: string;
  type: 'group_created' | 'post';
  user: {
    name: string;
    avatar: string;
  };
  content?: string;
  image?: string;
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

interface Group {
  id: string;
  name: string;
  memberCount: number;
  avatar: string;
}

interface ProfileCompletion {
  percentage: number;
  details: { completed: number; total: number };
  profilePhoto: { completed: number; total: number };
  coverPhoto: { completed: number; total: number };
}

const HomePage = () => {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [activeMembers, setActiveMembers] = useState<Member[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [postContent, setPostContent] = useState('');
  const [postImage, setPostImage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [profileCompletion, setProfileCompletion] = useState<ProfileCompletion>({
    percentage: 0,
    details: { completed: 0, total: 5 },
    profilePhoto: { completed: 0, total: 1 },
    coverPhoto: { completed: 0, total: 1 }
  });
  const [forumStats, setForumStats] = useState({
    registeredMembers: 0,
    publicForums: 0
  });
  const { userDetails } = useAuth();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!auth.currentUser) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const completed = {
            details: 0,
            profilePhoto: userData.photoURL ? 1 : 0,
            coverPhoto: userData.coverPhoto ? 1 : 0
          };

          // Check completed profile details
          if (userData.displayName) completed.details++;
          if (userData.bio) completed.details++;
          if (userData.location) completed.details++;
          if (userData.interests?.length > 0) completed.details++;
          if (userData.skills?.length > 0) completed.details++;

          const totalCompleted = completed.details + completed.profilePhoto + completed.coverPhoto;
          const totalFields = 7; // 5 details + 1 profile photo + 1 cover photo
          const percentage = Math.round((totalCompleted / totalFields) * 100);

          setProfileCompletion({
            percentage,
            details: { completed: completed.details, total: 5 },
            profilePhoto: { completed: completed.profilePhoto, total: 1 },
            coverPhoto: { completed: completed.coverPhoto, total: 1 }
          });
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    const fetchForumStats = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const forumsSnapshot = await getDocs(collection(db, 'forums'));

        setForumStats({
          registeredMembers: usersSnapshot.size,
          publicForums: forumsSnapshot.size
        });
      } catch (error) {
        console.error('Error fetching forum stats:', error);
      }
    };

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
          orderBy('memberCount', 'desc'),
          limit(5)
        );
        const snapshot = await getDocs(groupsQuery);
        const groupsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Group[];
        setGroups(groupsData);
      } catch (error) {
        console.error('Error fetching groups:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
    fetchForumStats();
    fetchUpdates();
    fetchActiveMembers();
    fetchGroups();
  }, []);

  const handlePostSubmit = async () => {
    if ((!postContent.trim() && !postImage) || !auth.currentUser) return;

    try {
      const updateData = {
        type: 'post',
        user: {
          name: auth.currentUser.displayName,
          avatar: auth.currentUser.photoURL,
          id: auth.currentUser.uid
        },
        content: postContent,
        image: postImage,
        timestamp: Timestamp.now(),
        likes: []
      };

      await addDoc(collection(db, 'updates'), updateData);
      setPostContent('');
      setPostImage('');
      
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {userDetails?.displayName || 'User'}!</h1>
          <p className="text-gray-600 mt-2">Here's what's happening in your community</p>
        </div>

        {/* Main grid container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Community Stats</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="text-gray-600">Active Members</span>
                  </div>
                  <span className="font-semibold">{activeMembers.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <MessageSquare className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-gray-600">Forums</span>
                  </div>
                  <span className="font-semibold">{forumStats.publicForums}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <BookOpen className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="text-gray-600">Total Members</span>
                  </div>
                  <span className="font-semibold">{forumStats.registeredMembers}</span>
                </div>
              </div>
            </div>

            {/* Profile Completion */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Complete Your Profile</h2>
              <div className="relative w-32 h-32 mx-auto mb-4">
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
                    stroke="#8B5CF6"
                    strokeWidth="6"
                    strokeDasharray={`${profileCompletion.percentage * 2.83} 283`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-purple-600">{profileCompletion.percentage}%</span>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Details', completed: profileCompletion.details.completed, total: profileCompletion.details.total },
                  { label: 'Profile Photo', completed: profileCompletion.profilePhoto.completed, total: profileCompletion.profilePhoto.total },
                  { label: 'Cover Photo', completed: profileCompletion.coverPhoto.completed, total: profileCompletion.coverPhoto.total }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="flex items-center text-gray-600">
                      <div className={`w-4 h-4 rounded-full ${item.completed === item.total ? 'bg-purple-600' : 'border-2 border-gray-300'} mr-2`} />
                      {item.label}
                    </span>
                    <span className="text-sm text-gray-500">{item.completed}/{item.total}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-6 space-y-6">
            {/* Create Post */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center space-x-4 mb-4">
                <Avatar>
                  <AvatarImage src={userDetails?.photoURL || ''} />
                  <AvatarFallback>{userDetails?.displayName?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <Input
                  placeholder="What's on your mind?"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="flex-1"
                />
              </div>
              
              {postImage && (
                <div className="mb-4">
                  <ImageUpload
                    currentImage={postImage}
                    onImageUpload={setPostImage}
                    aspectRatio="cover"
                    className="max-h-96"
                  />
                </div>
              )}
              
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex space-x-4">
                  <Button 
                    variant="ghost" 
                    className="text-gray-600"
                    onClick={() => document.querySelector('input[type="file"]')?.click()}
                  >
                    <Image className="w-5 h-5 mr-2" />
                    Photo
                  </Button>
                  <Button variant="ghost" className="text-gray-600">
                    <Video className="w-5 h-5 mr-2" />
                    Video
                  </Button>
                </div>
                <Button 
                  onClick={handlePostSubmit}
                  disabled={!postContent.trim() && !postImage}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Post
                </Button>
              </div>
            </div>

            {/* Updates Feed */}
            <div className="space-y-6">
              {updates.map((update) => (
                <div key={update.id} className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={update.user.avatar} />
                        <AvatarFallback>{update.user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{update.user.name}</h3>
                        <p className="text-sm text-gray-500">
                          {formatDistanceToNow(update.timestamp, { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </div>
                  
                  {update.content && (
                    <p className="text-gray-700 mb-4">{update.content}</p>
                  )}
                  
                  {update.image && (
                    <div className="mb-4">
                      <img
                        src={update.image}
                        alt="Post"
                        className="w-full rounded-lg max-h-96 object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-4 text-gray-500">
                    <Button variant="ghost" size="sm" className="flex items-center">
                      <ThumbsUp className="w-4 h-4 mr-2" />
                      {update.likes.length} Likes
                    </Button>
                    <Button variant="ghost" size="sm">Comment</Button>
                    <Button variant="ghost" size="sm">Share</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            {/* Active Members */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Active Members</h2>
              <div className="space-y-4">
                {activeMembers.map((member) => (
                  <div key={member.id} className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name[0]}</AvatarFallback>
                      </Avatar>
                      {member.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">{member.name}</h3>
                      <p className="text-sm text-gray-500">Online now</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Groups */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Popular Groups</h2>
                <Link to="/groups" className="text-purple-600 text-sm hover:text-purple-700">
                  See All
                </Link>
              </div>
              <div className="space-y-4">
                {groups.map((group) => (
                  <div key={group.id} className="flex items-center space-x-3">
                    <GroupAvatar photo={group.avatar} name={group.name} size={48} />
                    <div>
                      <h3 className="font-medium">{group.name}</h3>
                      <p className="text-sm text-gray-500">{group.memberCount} members</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 