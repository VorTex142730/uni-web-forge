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
import GroupFeed from './GroupFeed';

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
  memberCount?: number;
}

interface JoinRequest {
  id: string;
  userId: string;
  displayName: string;
  photoURL: string | null;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: {
    toDate: () => Date;
  } | string;
  groupId: string;
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
        // Listen to group document changes
        const groupRef = doc(db, 'groups', id);
        const unsubscribeGroup = onSnapshot(groupRef, async (groupDoc) => {
          if (!groupDoc.exists()) {
            navigate('/groups');
            return;
          }

          const groupData = {
            id: groupDoc.id,
            ...groupDoc.data()
          } as GroupData;

          // Listen to group members
          const membersQuery = query(
            collection(db, 'groupMembers'),
            where('groupId', '==', id)
          );

          const membersSnapshot = await getDocs(membersQuery);
          const members = membersSnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
          })) as GroupMember[];

          setGroup({ ...groupData, members });
          setIsOwner(user?.uid === groupData.createdBy.userId);

          // Check member status
          if (user) {
            const memberQuery = query(
              collection(db, 'groupMembers'),
              where('groupId', '==', id),
              where('userId', '==', user.uid)
            );
            const memberDocs = await getDocs(memberQuery);
            
            if (!memberDocs.empty) {
              setMemberStatus('member');
            } else {
              const requestQuery = query(
                collection(db, 'groupJoinRequests'),
                where('groupId', '==', id),
                where('userId', '==', user.uid),
                where('status', '==', 'pending')
              );
              const requestDocs = await getDocs(requestQuery);
              
              if (!requestDocs.empty) {
                setMemberStatus('pending');
              } else {
                setMemberStatus('none');
              }
            }
          }

          // Listen to join requests if user is owner
          if (user?.uid === groupData.createdBy.userId) {
            const requestsQuery = query(
              collection(db, 'groupJoinRequests'),
              where('groupId', '==', id),
              where('status', '==', 'pending')
            );

            const unsubscribeRequests = onSnapshot(requestsQuery, (snapshot) => {
              const requests = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt
              })) as JoinRequest[];
              setJoinRequests(requests);
            });

            return () => {
              unsubscribeGroup();
              unsubscribeRequests();
            };
          }

          return () => unsubscribeGroup();
        });
      } catch (error) {
        console.error('Error fetching group details:', error);
        toast.error('Failed to load group details');
      } finally {
        setLoading(false);
      }
    };

    fetchGroupDetails();
  }, [id, user, navigate]);

  const handleJoinRequest = async () => {
    if (!user || !group) return;

    try {
      const joinRequestRef = collection(db, 'groupJoinRequests');
      await addDoc(joinRequestRef, {
        groupId: id,
        userId: user.uid,
        displayName: user.displayName,
        photoURL: user.photoURL,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      setMemberStatus('pending');
      toast.success('Join request sent successfully');

      // Create notification for group owner
      await addDoc(collection(db, 'notifications'), {
        userId: group.createdBy.userId,
        type: 'JOIN_REQUEST',
        message: `${user.displayName} has requested to join your group "${group.name}"`,
        read: false,
        createdAt: serverTimestamp(),
        groupId: id,
        requesterId: user.uid
      });
    } catch (error) {
      console.error('Error sending join request:', error);
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

  const handleRemoveMember = async (memberId: string) => {
    if (!group || !user || !isOwner) return;

    try {
      // Find the member document
      const memberQuery = query(
        collection(db, 'groupMembers'),
        where('groupId', '==', id),
        where('userId', '==', memberId)
      );
      const memberDocs = await getDocs(memberQuery);

      if (!memberDocs.empty) {
        // Delete the member document
        const memberDoc = memberDocs.docs[0];
        await memberDoc.ref.delete();

        // Update group member count
        const groupRef = doc(db, 'groups', id);
        await updateDoc(groupRef, {
          memberCount: (group.memberCount || 0) - 1,
          lastActive: serverTimestamp()
        });

        toast.success('Member removed successfully');
      }
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
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

  const formatDate = (timestamp: JoinRequest['createdAt']) => {
    if (!timestamp) return 'Unknown date';
    if (typeof timestamp === 'string') return new Date(timestamp).toLocaleDateString();
    return timestamp.toDate().toLocaleDateString();
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
      {/* Header with Fixed Gradient */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-7xl mx-auto px-4">
          {/* Cover Photo Area */}
          <div className="relative h-48">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600" />
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-lg flex items-center justify-center bg-gradient-to-br ${generateGradient(group.name + '-logo')}`}>
                  <span className="text-white text-xl font-bold">
                    {getInitials(group.name)}
                  </span>
                </div>
                <div className="text-white flex-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold">{group.name}</h1>
                    {group.createdBy && (
                      <div className="flex items-center text-sm bg-white/10 px-3 py-1 rounded-full">
                        <Crown size={14} className="text-yellow-400 mr-1" />
                        <span>Created by {group.createdBy.displayName}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm mt-1">
                    <span className="capitalize">{group.privacy} Group</span>
                    <span>•</span>
                    <span>{group.members?.length || 0} members</span>
                  </div>
                </div>
                <div>
                  {memberStatus === 'none' && (
                    <Button 
                      onClick={handleJoinRequest} 
                      size="default"
                      variant="secondary"
                      className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                    >
                      {group.privacy === 'private' ? 'Request to Join' : 'Join Group'}
                    </Button>
                  )}
                  {memberStatus === 'pending' && (
                    <Button 
                      variant="secondary" 
                      size="default" 
                      disabled
                      className="bg-white/10 text-white border-white/20"
                    >
                      Join Request Pending
                    </Button>
                  )}
                  {memberStatus === 'member' && (
                    <Button 
                      variant="secondary" 
                      size="default"
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
        <div className="flex-1">
          {activeTab === 'members' && (
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  type="search"
                  placeholder="Search Members..."
                  className="pl-10 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="p-4">
            {activeTab === 'feed' && (
              <GroupFeed
                groupId={id || ''}
                isOwner={isOwner}
                isMember={memberStatus === 'member'}
              />
            )}

            {activeTab === 'members' && (
              <div className="space-y-4">
                {!group.members || group.members.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No members yet</p>
                ) : (
                  group.members
                    .filter(member => 
                      member.displayName.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .sort((a, b) => {
                      // Always put owner (admin) first
                      if (a.role === 'admin') return -1;
                      if (b.role === 'admin') return 1;
                      // Then sort by role (moderator before member)
                      if (a.role === 'moderator' && b.role === 'member') return -1;
                      if (a.role === 'member' && b.role === 'moderator') return 1;
                      // Finally sort by name
                      return a.displayName.localeCompare(b.displayName);
                    })
                    .map((member) => (
                      <div key={member.userId} className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg">
                        <Avatar src={member.photoURL} alt={member.displayName} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{member.displayName}</p>
                            {member.role === 'admin' && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                Admin
                              </span>
                            )}
                            {member.role === 'moderator' && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                Moderator
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            Joined {member.joinedAt?.toDate().toLocaleDateString()}
                          </p>
                        </div>
                        {isOwner && member.userId !== user?.uid && (
                          <Button
                            onClick={() => handleRemoveMember(member.userId)}
                            variant="destructive"
                            size="sm"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    ))
                )}
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
                          Requested {formatDate(request.createdAt)}
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