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
      
      const userPromises = connectionsData.map(async (conn: Connection) => {
        const otherUserId = conn.user1 === user.uid ? conn.user2 : conn.user1;
        const userDoc = await getDoc(doc(db, 'users', otherUserId));
        return { id: otherUserId, ...userDoc.data() } as UserDetails;
      });
      
      const users = await Promise.all(userPromises);
      setConnectionUsers(users);

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
        setRequests((prev) => prev.filter((r) => r.id !== request.id));
        setRequestUsers((prev) => prev.filter((u) => u.id !== request.from));
        setRemovingRequestId(null);
        const connectionsData = await getConnections(user.uid) as Connection[];
        setConnections(connectionsData);
        const userPromises = connectionsData.map(async (conn) => {
          const otherUserId = conn.user1 === user.uid ? conn.user2 : conn.user1;
          const userDoc = await getDoc(doc(db, 'users', otherUserId));
          return { id: otherUserId, ...userDoc.data() } as UserDetails;
        });
        const users = await Promise.all(userPromises);
        setConnectionUsers(users);
      }, 400);
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
        setRequests((prev) => prev.filter((r) => r.id !== request.id));
        setRequestUsers((prev) => prev.filter((u) => u.id !== request.from));
        setRemovingRequestId(null);
      }, 400);
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdf0eb]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex space-x-8">
        {/* Left Column: Profile Card and Sidebar */}
        <div className="flex flex-col w-80">
          {/* Profile Card */}
          <div className="bg-white shadow-sm rounded-xl p-6 mb-4">
            <div className="relative group">
              <div className="w-16 h-16 rounded-full border-2 border-white shadow-md overflow-hidden relative mx-auto">
                {userDetails?.photoURL ? (
                  <img 
                    src={userDetails.photoURL} 
                    alt={user.displayName || ''} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img 
                    src={'/default-avatar.png'}
                    alt="Default Avatar"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="absolute bottom-0 right-8 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
            <div className="mt-2 text-center">
              <h1 className="text-lg font-bold text-gray-900">{userDetails.firstName} {userDetails.lastName}</h1>
              <div className="mt-1 text-xs text-gray-500">
                @{user.username || user.displayName?.toLowerCase().replace(/\s/g, '')} • Joined {new Date(user.metadata.creationTime).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
              <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                {userDetails.role}
              </span>
            </div>
          </div>

          {/* Sidebar */}
          <nav className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
            <button onClick={() => navigate('/profile')} className="block px-4 py-3 rounded-lg text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200">Profile</button>
            <button onClick={() => navigate('/connections')} className="block px-4 py-3 rounded-lg text-base font-medium bg-indigo-50 text-indigo-600 transition-colors duration-200">Connections</button>
            <button onClick={() => navigate('/profilegroups')} className="block px-4 py-3 rounded-lg text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200">Groups</button>
            <button onClick={() => navigate('/forums')} className="block px-4 py-3 rounded-lg text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200">Forums</button>
            <button onClick={() => navigate('/blog')} className="block px-4 py-3 rounded-lg text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200">Blog</button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-sm p-8">
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