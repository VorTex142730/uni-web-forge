import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getConnections, getIncomingRequests, acceptConnectionRequest, rejectConnectionRequest } from '@/lib/firebase/connections';
import { createConnectionAcceptedNotification, createConnectionRejectedNotification } from '@/components/notifications/NotificationService';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Search, Users, UserPlus, MessageSquare, MoreHorizontal } from 'lucide-react';

interface Connection {
  id: string;
  user1: string;
  user2: string;
  createdAt: any;
}

interface ConnectionRequest {
  id: string;
  from: string;
  to: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: any;
}

interface UserDetails {
  id: string;
  firstName?: string;
  lastName?: string;
  college?: string;
  role?: string;
  avatar?: string;
  photoURL?: string;
  [key: string]: any;
}

const ConnectionsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { user, userDetails } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'connections' | 'requests'>('connections');
  const [connections, setConnections] = useState<Connection[]>([]);
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [connectionUsers, setConnectionUsers] = useState<UserDetails[]>([]);
  const [requestUsers, setRequestUsers] = useState<UserDetails[]>([]);
  const [mutualConnections, setMutualConnections] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const [removingRequestId, setRemovingRequestId] = useState<string | null>(null);
  
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const fetchConnectionsAndUsers = async () => {
      const connectionsData = await getConnections(user.uid);
      setConnections(connectionsData as Connection[]);
      
      // Fetch user details for each connection
      const userPromises = connectionsData.map(async (conn: Connection) => {
        const otherUserId = conn.user1 === user.uid ? conn.user2 : conn.user1;
        const userDoc = await getDoc(doc(db, 'users', otherUserId));
        return { id: otherUserId, ...userDoc.data() } as UserDetails;
      });
      
      const users = await Promise.all(userPromises);
      setConnectionUsers(users);

      // Fetch mutual connections count for each user
      const mutualPromises = users.map(async (connectedUser) => {
        const userConnections = await getConnections(connectedUser.id) as Connection[];
        const mutualCount = userConnections.filter((conn) =>
          (conn.user1 === user.uid || conn.user2 === user.uid) &&
          (conn.user1 === connectedUser.id || conn.user2 === connectedUser.id)
        ).length;
        return { userId: connectedUser.id, count: mutualCount };
      });

      const mutualCounts = await Promise.all(mutualPromises);
      const mutualMap = mutualCounts.reduce((acc, { userId, count }) => {
        acc[userId] = count;
        return acc;
      }, {} as Record<string, number>);
      setMutualConnections(mutualMap);
      
      // Fetch requests and their user details
      const requestsData = await getIncomingRequests(user.uid);
      setRequests(requestsData as ConnectionRequest[]);
      
      const requestUserPromises = requestsData.map(async (req: ConnectionRequest) => {
        const userDoc = await getDoc(doc(db, 'users', req.from));
        return { id: req.from, ...userDoc.data() } as UserDetails;
      });
      
      const requestUsers = await Promise.all(requestUserPromises);
      setRequestUsers(requestUsers);
    };
    
    fetchConnectionsAndUsers().finally(() => setLoading(false));
  }, [user]);

  const handleAccept = async (request: ConnectionRequest) => {
    try {
      await acceptConnectionRequest(request.id);
      await createConnectionAcceptedNotification(request.from, user.uid, userDetails.firstName + ' ' + userDetails.lastName);
      setFeedback('Connection accepted!');
      setRemovingRequestId(request.id);
      setTimeout(async () => {
        // Remove request from local state only
        setRequests((prev) => prev.filter((r) => r.id !== request.id));
        setRequestUsers((prev) => prev.filter((u) => u.id !== request.from));
        setRemovingRequestId(null);
        // Refetch connections to update UI
        const connectionsData = await getConnections(user.uid) as Connection[];
        setConnections(connectionsData);
        const userPromises = connectionsData.map(async (conn) => {
          const otherUserId = conn.user1 === user.uid ? conn.user2 : conn.user1;
          const userDoc = await getDoc(doc(db, 'users', otherUserId));
          return { id: otherUserId, ...userDoc.data() } as UserDetails;
        });
        const users = await Promise.all(userPromises);
        setConnectionUsers(users);
      }, 400); // 400ms matches the animation duration
    } catch (e) {
      setFeedback('Failed to accept connection.');
    }
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleReject = async (request: ConnectionRequest) => {
    try {
      await rejectConnectionRequest(request.id);
      await createConnectionRejectedNotification(request.from, user.uid, userDetails.firstName + ' ' + userDetails.lastName);
      setFeedback('Connection request rejected.');
      setRemovingRequestId(request.id);
      setTimeout(() => {
        // Remove request from local state only
        setRequests((prev) => prev.filter((r) => r.id !== request.id));
        setRequestUsers((prev) => prev.filter((u) => u.id !== request.from));
        setRemovingRequestId(null);
      }, 400); // 400ms matches the animation duration
    } catch (e) {
      setFeedback('Failed to reject connection.');
    }
    setTimeout(() => setFeedback(null), 3000);
  };

  const filteredConnections = connectionUsers.filter(user => 
    user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.college?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user || !userDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Profile Header Banner */}
      <div className="relative">
        <div className="bg-slate-500 h-48 w-full relative">
          <div className="absolute inset-0 opacity-20">
          </div>
        </div>
        <div className="absolute left-8 -bottom-16">
          <div className="w-32 h-32 bg-gray-200 rounded-full border-4 border-white flex items-center justify-center overflow-hidden">
            {userDetails.photoURL ? (
              <img 
                src={userDetails.photoURL} 
                alt={user.displayName || ''} 
                className="w-full h-full object-cover"
              />
            ) : (
              <img 
                src={'/default-avatar.png'}
                alt="Default Avatar"
                className="w-full h-full rounded-full object-cover"
              />
            )}
          </div>
          <div className="absolute top-0 right-0">
            <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
        </div>
      </div>
      
      {/* Profile Info */}
      <div className="mt-20 px-8">
        <div className="flex items-center">
          <h2 className="text-2xl font-bold mr-2">{userDetails.firstName} {userDetails.lastName}</h2>
          <span className="bg-blue-100 text-blue-500 text-xs px-2 py-1 rounded">
            {userDetails.role}
          </span>
        </div>
        <div className="text-gray-500 mt-1">
          @{user.username || user.displayName?.toLowerCase().replace(/\s/g, '')} • Joined {new Date(user.metadata.creationTime).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} • Active now
        </div>
      </div>
      
      {/* Profile Content */}
      <div className="mt-8 px-8 flex">
        {/* Sidebar */}
        <div className="w-1/4 pr-4">
          <nav className="space-y-1">
            <button onClick={() => navigate('/profile')} className="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50">Profile</button>
            <button onClick={() => navigate('/timeline')} className="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50">Timeline</button>
            <button onClick={() => navigate('/connections')} className="w-full text-left px-4 py-2 text-blue-500 font-medium border-l-4 border-blue-500">Connections</button>
            <button onClick={() => navigate('/groups')} className="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50">Groups</button>
            <button onClick={() => navigate('/videos')} className="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50">Videos</button>
            <button onClick={() => navigate('/photos')} className="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50">Photos</button>
            <button onClick={() => navigate('/forums')} className="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50">Forums</button>
          </nav>
        </div>
        
        {/* Main Content */}
        <div className="w-3/4">
          {/* Search and Tabs */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search connections..."
                  className="pl-10 pr-4 py-2 border rounded-full w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('connections')}
                  className={`${
                    activeTab === 'connections'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Connections ({connectionUsers.length})
                </button>
                <button
                  onClick={() => setActiveTab('requests')}
                  className={`${
                    activeTab === 'requests'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Pending Requests ({requestUsers.length})
                </button>
              </nav>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {activeTab === 'connections' ? (
                filteredConnections.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg shadow">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No connections found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchQuery ? 'Try adjusting your search' : 'Start connecting with other members'}
                    </p>
                  </div>
                ) : (
                  filteredConnections.map((member) => (
                    <div key={member.id} className="bg-white rounded-lg shadow p-6">
                      <div className="flex items-start">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>
                            {member.firstName?.[0]}{member.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-4 flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">
                                {member.firstName} {member.lastName}
                              </h3>
                              <p className="text-sm text-gray-500">{member.college}</p>
                              <p className="text-sm text-gray-500">{member.role}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => navigate(`/messages/user/${member.id}`)}
                              >
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Message
                              </Button>
                              <Button variant="outline" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          {mutualConnections[member.id] > 0 && (
                            <p className="mt-2 text-sm text-gray-500">
                              {mutualConnections[member.id]} mutual connection{mutualConnections[member.id] !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )
              ) : (
                requestUsers.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg shadow">
                    <UserPlus className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No pending requests</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      You're all caught up! No pending connection requests.
                    </p>
                  </div>
                ) : (
                  requestUsers.map((member) => {
                    const request = requests.find(r => r.from === member.id);
                    return (
                      <div
                        key={member.id}
                        className={`bg-white rounded-lg shadow p-6 transition-opacity duration-400 ${removingRequestId === request?.id ? 'opacity-0' : 'opacity-100'}`}
                      >
                        <div className="flex items-start">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback>
                              {member.firstName?.[0]}{member.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="ml-4 flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="text-lg font-medium text-gray-900">
                                  {member.firstName} {member.lastName}
                                </h3>
                                <p className="text-sm text-gray-500">{member.college}</p>
                                <p className="text-sm text-gray-500">{member.role}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleAccept(request)}
                                >
                                  Accept
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleReject(request)}
                                >
                                  Ignore
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )
              )}
            </div>
          )}
        </div>
      </div>
      {feedback && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-100 text-blue-800 px-4 py-2 rounded shadow z-50">
          {feedback}
        </div>
      )}
    </div>
  );
};

export default ConnectionsPage;