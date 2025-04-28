import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getConnections, getIncomingRequests, acceptConnectionRequest, rejectConnectionRequest } from '@/lib/firebase/connections';
import { createConnectionAcceptedNotification, createConnectionRejectedNotification } from '@/components/notifications/NotificationService';

const ConnectionsPage: React.FC = () => {
  const [sortOption, setSortOption] = useState<string>("Recently Active");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { user, userDetails } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'connections' | 'requests'>('connections');
  const [connections, setConnections] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getConnections(user.uid).then(setConnections);
    getIncomingRequests(user.uid).then(setRequests);
    setLoading(false);
  }, [user]);

  const handleAccept = async (request: any) => {
    await acceptConnectionRequest(request.id);
    await createConnectionAcceptedNotification(request.from, user.uid, userDetails.firstName + ' ' + userDetails.lastName);
    setRequests(requests.filter((r) => r.id !== request.id));
    setConnections([...connections, { users: [user.uid, request.from], createdAt: new Date() }]);
  };
  const handleReject = async (request: any) => {
    await rejectConnectionRequest(request.id);
    await createConnectionRejectedNotification(request.from, user.uid, userDetails.firstName + ' ' + userDetails.lastName);
    setRequests(requests.filter((r) => r.id !== request.id));
  };

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
          {/* Background with faint image icons */}
          <div className="absolute inset-0 opacity-20">
            {/* This would be the background pattern with image icons */}
          </div>
        </div>
        <div className="absolute left-8 -bottom-16">
          <div className="w-32 h-32 bg-gray-200 rounded-full border-4 border-white flex items-center justify-center overflow-hidden">
            {user.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName || ''} 
                className="w-full h-full object-cover"
              />
            ) : (
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
          </div>
          {/* Online status indicator */}
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
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-4">
            <div className="flex">
              <div className={`mr-6 pb-2 px-2 font-medium cursor-pointer ${activeTab === 'connections' ? 'border-b-2 border-red-500' : 'text-gray-500'}`}
                onClick={() => setActiveTab('connections')}>My Connections</div>
              <div className={`mr-6 pb-2 px-2 cursor-pointer ${activeTab === 'requests' ? 'border-b-2 border-red-500 font-medium' : 'text-gray-500'}`}
                onClick={() => setActiveTab('requests')}>Requests</div>
            </div>
          </div>
          
          {/* Connections filters and view toggle */}
          <div className="flex justify-between mb-4">
            <div></div>
            <div className="flex items-center">
              {/* Sort dropdown */}
              <div className="relative mr-2">
                <select 
                  className="bg-white border border-gray-300 rounded-md py-2 px-4 pr-8 appearance-none text-sm"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option>Recently Active</option>
                  <option>Newest</option>
                  <option>Alphabetical</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
              
              {/* View mode toggle */}
              <div className="flex border border-gray-300 rounded-md">
                <button
                  className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : 'bg-white'}`}
                  onClick={() => setViewMode('grid')}
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                  </svg>
                </button>
                <button
                  className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : 'bg-white'}`}
                  onClick={() => setViewMode('list')}
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {loading ? <div>Loading...</div> : (
            activeTab === 'connections' ? (
              connections.length === 0 ? (
                <div className="flex items-start p-4 bg-white border border-gray-200 rounded-md">
                  <div className="p-2 bg-blue-100 rounded-full mr-4">
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-700">You haven't connected with anyone yet. Start exploring members to make connections!</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {connections.map((conn) => {
                    const otherId = conn.users.find((id: string) => id !== user.uid);
                    return <div key={conn.id} className="p-4 border rounded">Connected to: {otherId}</div>;
                  })}
                </div>
              )
            ) : (
              requests.length === 0 ? (
                <div className="flex items-start p-4 bg-white border border-gray-200 rounded-md">
                  <div className="p-2 bg-blue-100 rounded-full mr-4">
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-700">No pending connection requests.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((req) => (
                    <div key={req.id} className="flex items-center gap-4 p-4 bg-white border rounded">
                      <div className="flex-1">Request from: {req.from}</div>
                      <button className="bg-green-500 text-white px-3 py-1 rounded mr-2" onClick={() => handleAccept(req)}>Accept</button>
                      <button className="bg-red-500 text-white px-3 py-1 rounded" onClick={() => handleReject(req)}>Reject</button>
                    </div>
                  ))}
                </div>
              )
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ConnectionsPage;