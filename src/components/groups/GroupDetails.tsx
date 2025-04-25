import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, arrayUnion, Timestamp, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Crown } from 'lucide-react';
import toast from 'react-hot-toast';
import { createGroupJoinRequestNotification, createGroupJoinResponseNotification } from '@/components/notifications/NotificationService';
import { Avatar } from '@/components/ui/avatar';

interface GroupMember {
  userId: string;
  displayName: string;
  photoURL: string | null;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: Timestamp;
}

interface GroupData {
  id: string;
  name: string;
  description: string;
  privacy: 'public' | 'private';
  coverPhoto: string;
  photo: string;
  createdAt: Timestamp;
  lastActive: Timestamp;
  hasForum: boolean;
  members: GroupMember[];
  permissions: {
    posts: string;
    photos: string;
    events: string;
    messages: string;
  };
  createdBy: {
    userId: string;
    displayName: string;
    photoURL: string | null;
  };
}

interface JoinRequest {
  id: string;
  userId: string;
  displayName: string;
  photoURL: string | null;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Timestamp;
}

const GroupDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [group, setGroup] = useState<GroupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('members');
  const [memberStatus, setMemberStatus] = useState<'none' | 'pending' | 'member'>('none');
  const [searchQuery, setSearchQuery] = useState('');
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const fetchGroupDetails = async () => {
      if (!id) return;

      try {
        const groupDoc = await getDoc(doc(db, 'groups', id));
        if (!groupDoc.exists()) {
          navigate('/groups');
          return;
        }

        const groupData = {
          id: groupDoc.id,
          ...groupDoc.data()
        } as GroupData;

        setGroup(groupData);
        setIsOwner(user?.uid === groupData.createdBy.userId);

        // Check member status
        if (user) {
          // Check if already a member
          const memberQuery = query(
            collection(db, 'groupMembers'),
            where('groupId', '==', id),
            where('userId', '==', user.uid)
          );
          const memberDocs = await getDocs(memberQuery);
          
          if (!memberDocs.empty) {
            setMemberStatus('member');
          } else {
            // Check if join request is pending
            const requestQuery = query(
              collection(db, 'groupJoinRequests'),
              where('groupId', '==', id),
              where('userId', '==', user.uid),
              where('status', '==', 'pending')
            );
            const requestDocs = await getDocs(requestQuery);
            
            if (!requestDocs.empty) {
              setMemberStatus('pending');
            }
          }
        }

        // If user is owner, listen to join requests
        if (user?.uid === groupData.createdBy.userId) {
          const requestsQuery = query(
            collection(db, 'groupJoinRequests'),
            where('groupId', '==', id),
            where('status', '==', 'pending')
          );

          const unsubscribe = onSnapshot(requestsQuery, (snapshot) => {
            const requests = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as JoinRequest[];
            setJoinRequests(requests);
          });

          return () => unsubscribe();
        }
      } catch (error) {
        console.error('Error fetching group details:', error);
        toast.error('Failed to load group details');
      } finally {
        setLoading(false);
      }
    };

    fetchGroupDetails();
  }, [id, user]);

  const handleJoinGroup = async () => {
    if (!user || !group) return;

    try {
      // Add join request
      const joinRequest = await addDoc(collection(db, 'groupJoinRequests'), {
        groupId: group.id,
        userId: user.uid,
        displayName: user.displayName || 'Anonymous',
        photoURL: user.photoURL,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      // Create notification for group owner
      await createGroupJoinRequestNotification(
        group.createdBy.userId,
        user.uid,
        user.displayName || 'Anonymous',
        group.id,
        group.name
      );

      setMemberStatus('pending');
      toast.success('Join request sent successfully');
    } catch (error) {
      console.error('Error joining group:', error);
      toast.error('Failed to send join request');
    }
  };

  const handleRequestResponse = async (requestId: string, accept: boolean) => {
    try {
      const requestRef = doc(db, 'groupJoinRequests', requestId);
      const request = joinRequests.find(r => r.id === requestId);

      if (!request || !group) return;

      if (accept) {
        // Add user as member
        await addDoc(collection(db, 'groupMembers'), {
          groupId: id,
          userId: request.userId,
          displayName: request.displayName,
          photoURL: request.photoURL,
          role: 'member',
          joinedAt: serverTimestamp()
        });

        // Update group member count
        const groupRef = doc(db, 'groups', id!);
        await updateDoc(groupRef, {
          memberCount: (group.members?.length || 0) + 1,
          lastActive: serverTimestamp()
        });

        // Create notification for the user
        await createGroupJoinResponseNotification(
          request.userId,
          user?.uid || '',
          group.id,
          group.name,
          true
        );

        toast.success(`Accepted ${request.displayName}'s join request`);
      } else {
        // Create rejection notification
        await createGroupJoinResponseNotification(
          request.userId,
          user?.uid || '',
          group.id,
          group.name,
          false
        );

        toast.success(`Rejected ${request.displayName}'s join request`);
      }

      // Update request status
      await updateDoc(requestRef, {
        status: accept ? 'accepted' : 'rejected',
        updatedAt: serverTimestamp()
      });

    } catch (error) {
      console.error('Error handling join request:', error);
      toast.error('Failed to process join request');
    }
  };

  const generateGradient = (text: string) => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const h1 = hash % 360;
    const h2 = (h1 + 40) % 360;
    return `from-[hsl(${h1},70%,60%)] to-[hsl(${h2},70%,50%)]`;
  };

  const getInitials = (name: string = '') => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase() || '?';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!group) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Gradient */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-7xl mx-auto px-4">
          {/* Cover Photo Area */}
          <div className="relative h-64">
            <div className={`absolute inset-0 bg-gradient-to-br ${generateGradient(group.name)}`} />
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-center gap-4">
                <div className={`w-20 h-20 rounded-lg flex items-center justify-center bg-gradient-to-br ${generateGradient(group.name + '-logo')}`}>
                  <span className="text-white text-2xl font-bold">
                    {getInitials(group.name)}
                  </span>
                </div>
                <div className="text-white flex-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-bold">{group.name}</h1>
                    {group.createdBy && (
                      <div className="flex items-center text-sm bg-white/10 px-3 py-1 rounded-full">
                        <Crown size={14} className="text-yellow-400 mr-1" />
                        <span>Created by {group.createdBy.displayName}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm mt-2">
                    <span className="capitalize">{group.privacy} Group</span>
                    <span>•</span>
                    <span>{group.members?.length || 0} members</span>
                  </div>
                </div>
                <div>
                  {memberStatus === 'none' && (
                    <Button 
                      onClick={handleJoinGroup} 
                      size="lg"
                      variant="secondary"
                      className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                    >
                      {group.privacy === 'private' ? 'Request to Join' : 'Join Group'}
                    </Button>
                  )}
                  {memberStatus === 'pending' && (
                    <Button 
                      variant="secondary" 
                      size="lg" 
                      disabled
                      className="bg-white/10 text-white border-white/20"
                    >
                      Join Request Pending
                    </Button>
                  )}
                  {memberStatus === 'member' && (
                    <Button 
                      variant="secondary" 
                      size="lg"
                      className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                    >
                      Member
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('feed')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                activeTab === 'feed'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Feed
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                activeTab === 'members'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Members
            </button>
            <button
              onClick={() => setActiveTab('photos')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                activeTab === 'photos'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Photos
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                activeTab === 'videos'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Videos
            </button>
            <button
              onClick={() => setActiveTab('albums')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                activeTab === 'albums'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Albums
            </button>
            {isOwner && (
              <button
                onClick={() => setActiveTab('requests')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                  activeTab === 'requests'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Join Requests
                {joinRequests.length > 0 && (
                  <span className="ml-2 bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">
                    {joinRequests.length}
                  </span>
                )}
              </button>
            )}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="search"
                placeholder={activeTab === 'requests' ? "Search Requests..." : "Search Members..."}
                className="pl-10 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="p-4">
            {activeTab === 'members' && (
              <div className="space-y-4">
                {!group.members || group.members.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No members yet</p>
                ) : (
                  group.members.map((member) => (
                    <div key={member.userId} className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg">
                      <Avatar src={member.photoURL} alt={member.displayName} />
                      <div className="flex-1">
                        <p className="font-medium">{member.displayName}</p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                      </div>
                      {group.ownerId === user?.uid && member.userId !== user?.uid && (
                        <button
                          onClick={() => handleRemoveMember(member.userId)}
                          className="text-red-500 hover:text-red-600"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))
                )}
                {[...Array(8)].map((_, index) => (
                  <div
                    key={`skeleton-${index}`}
                    className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse"
                  >
                    <div className="h-10 bg-gray-200"></div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'requests' && isOwner && (
              <div className="space-y-4">
                {joinRequests.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No pending join requests</p>
                ) : (
                  joinRequests.map((request) => (
                    <div key={request.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg">
                      {request.photoURL ? (
                        <img src={request.photoURL} alt={request.displayName} className="w-10 h-10 rounded-full" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-600 font-medium">
                            {getInitials(request.displayName)}
                          </span>
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium">{request.displayName || 'Anonymous'}</h3>
                        <p className="text-sm text-gray-500">
                          Requested {new Date(request.createdAt.toDate()).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleRequestResponse(request.id, true)}
                          variant="default"
                          size="sm"
                        >
                          Accept
                        </Button>
                        <Button
                          onClick={() => handleRequestResponse(request.id, false)}
                          variant="outline"
                          size="sm"
                        >
                          Decline
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDetails; 