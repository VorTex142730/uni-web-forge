import React, { useState, useEffect } from 'react';
import { Search, LayoutGrid, List, MoreHorizontal, Mail, UserPlus, Check } from 'lucide-react';

const MembersContent = () => {
  const [view, setView] = useState('grid');
  const [sortBy, setSortBy] = useState('recently-active');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [showMemberOptions, setShowMemberOptions] = useState(null);
  
  // Mock data for members based on the image
  const allMembers = [
    {
      id: 1,
      name: 'Raviraj',
      avatar: null,
      type: 'Student',
      joinDate: 'Apr 2025',
      joinDateTimestamp: new Date('2025-04-15').getTime(),
      status: 'Active now',
      lastActive: Date.now(),
      isCurrentUser: true
    },
    {
      id: 2,
      name: 'Riya',
      avatar: null,
      type: 'Student',
      joinDate: 'Apr 2025',
      joinDateTimestamp: new Date('2025-04-10').getTime(),
      status: 'Active 4 minutes ago',
      lastActive: Date.now() - 4 * 60 * 1000,
      connectionStatus: 'Pending Request'
    },
    {
      id: 3,
      name: 'Morningstar',
      avatar: '/api/placeholder/200/200',
      type: 'Member',
      joinDate: 'Mar 2024',
      joinDateTimestamp: new Date('2024-03-20').getTime(),
      status: 'Active 9 hours ago',
      lastActive: Date.now() - 9 * 60 * 60 * 1000,
      connectionStatus: 'Request Sent'
    },
    {
      id: 4,
      name: 'Aneesh',
      avatar: null,
      type: 'Student',
      joinDate: 'Apr 2025',
      joinDateTimestamp: new Date('2025-04-05').getTime(),
      status: 'Active 6 days ago',
      lastActive: Date.now() - 6 * 24 * 60 * 60 * 1000,
      connectionStatus: 'Connect'
    }
  ];

  // Handle member search and sorting
  useEffect(() => {
    let result = [...allMembers];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(member => 
        member.name.toLowerCase().includes(query) || 
        member.type.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'recently-active':
        result.sort((a, b) => b.lastActive - a.lastActive);
        break;
      case 'newest':
        result.sort((a, b) => b.joinDateTimestamp - a.joinDateTimestamp);
        break;
      case 'alphabetical':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }
    
    setFilteredMembers(result);
  }, [searchQuery, sortBy, allMembers]);

  // Close member options menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowMemberOptions(null);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Handle connection status updates
  const updateConnectionStatus = (memberId, newStatus) => {
    const updatedMembers = allMembers.map(member => {
      if (member.id === memberId) {
        return { ...member, connectionStatus: newStatus };
      }
      return member;
    });
    
    // In a real app, you would send this to your API
    console.log(`Updated member ${memberId} to status: ${newStatus}`);
    
    // Update the state with the new connection status
    setFilteredMembers(
      filteredMembers.map(member => {
        if (member.id === memberId) {
          return { ...member, connectionStatus: newStatus };
        }
        return member;
      })
    );
  };

  // Handle member options toggle
  const toggleMemberOptions = (e, memberId) => {
    e.stopPropagation();
    setShowMemberOptions(currentId => currentId === memberId ? null : memberId);
  };

  // Handle message member
  const messageMember = (memberId) => {
    console.log(`Opening message dialog for member ${memberId}`);
    // In a real app, this would open a messaging interface
    alert(`Messaging member #${memberId}`);
  };

  return (
    <div className="bg-gray-50 p-6">
      <h2 className="text-2xl font-bold mb-4">Members</h2>
      
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="bg-white py-2 px-4 rounded-lg shadow-sm border border-gray-200">
          <button className="text-blue-600 font-medium border-b-2 border-blue-600 pb-1 mr-4">
            All Members <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 ml-1">{allMembers.length}</span>
          </button>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input 
              type="text" 
              placeholder="Search Members..." 
              className="border border-gray-200 pl-10 pr-4 py-2 rounded-lg w-60 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <select 
              className="border border-gray-200 px-4 py-2 rounded-lg appearance-none pr-8 bg-white"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="recently-active">Recently Active</option>
              <option value="newest">Newest</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
            <svg className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24">
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </div>
          
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            <button 
              className={`p-2 ${view === 'grid' ? 'bg-gray-100' : 'bg-white'}`}
              onClick={() => setView('grid')}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-5 w-5" />
            </button>
            <button 
              className={`p-2 ${view === 'list' ? 'bg-gray-100' : 'bg-white'}`}
              onClick={() => setView('list')}
              aria-label="List view"
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Members Grid or List */}
      {filteredMembers.length > 0 ? (
        <div className={view === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" : "flex flex-col gap-4"}>
          {filteredMembers.map((member) => (
            <div 
              key={member.id} 
              className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${
                view === 'list' ? "flex items-center" : ""
              }`}
            >
              {view === 'grid' ? (
                // Grid View
                <>
                  <div className="p-4 relative">
                    <div className="absolute top-4 right-4">
                      <button onClick={(e) => toggleMemberOptions(e, member.id)}>
                        <MoreHorizontal className="h-5 w-5 text-gray-400" />
                      </button>
                      {showMemberOptions === member.id && (
                        <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-md shadow-md z-10">
                          <ul className="py-1">
                            <li>
                              <button 
                                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                onClick={() => messageMember(member.id)}
                              >
                                Message
                              </button>
                            </li>
                            <li>
                              <button className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                                View Profile
                              </button>
                            </li>
                            {!member.isCurrentUser && (
                              <li>
                                <button className="px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left">
                                  Block
                                </button>
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <div className="relative mb-2">
                        {member.avatar ? (
                          <img 
                            src={member.avatar} 
                            alt={member.name} 
                            className="w-20 h-20 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                            <svg viewBox="0 0 24 24" className="w-8 h-8 text-gray-400">
                              <circle cx="12" cy="8" r="4" stroke="currentColor" fill="none" strokeWidth="2" />
                              <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="currentColor" fill="none" strokeWidth="2" />
                            </svg>
                          </div>
                        )}
                        
                        {member.isCurrentUser && (
                          <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      
                      <div className="bg-blue-100 text-blue-600 text-xs rounded-full px-3 py-1 mb-2">
                        {member.type}
                      </div>
                      
                      <h3 className="text-lg font-medium">{member.name}</h3>
                      
                      <div className="text-sm text-gray-500 mt-1">
                        Joined {member.joinDate} • {member.status}
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-4 py-3 bg-gray-50 flex justify-center">
                    {member.isCurrentUser ? (
                      <div></div>
                    ) : member.connectionStatus === 'Pending Request' ? (
                      <button 
                        className="text-sm text-gray-700 font-medium py-1"
                        onClick={() => updateConnectionStatus(member.id, 'Accepted')}
                      >
                        Pending Request
                      </button>
                    ) : member.connectionStatus === 'Request Sent' ? (
                      <button 
                        className="text-sm text-gray-700 font-medium py-1 flex items-center"
                        onClick={() => updateConnectionStatus(member.id, 'Connect')}
                      >
                        <Check className="h-4 w-4 mr-1" /> Request Sent
                      </button>
                    ) : (
                      <button 
                        className="text-sm text-gray-700 font-medium py-1 flex items-center"
                        onClick={() => updateConnectionStatus(member.id, 'Request Sent')}
                      >
                        <UserPlus className="h-4 w-4 mr-1" /> Connect
                      </button>
                    )}
                  </div>
                  
                  <div className="border-t border-gray-200 p-3 flex justify-center">
                    <button 
                      className="text-gray-500 hover:text-blue-600 transition-colors"
                      onClick={() => messageMember(member.id)}
                    >
                      <Mail className="h-5 w-5" />
                    </button>
                  </div>
                </>
              ) : (
                // List View
                <>
                  <div className="p-4 flex items-center flex-1">
                    <div className="relative mr-4">
                      {member.avatar ? (
                        <img 
                          src={member.avatar} 
                          alt={member.name} 
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <svg viewBox="0 0 24 24" className="w-6 h-6 text-gray-400">
                            <circle cx="12" cy="8" r="4" stroke="currentColor" fill="none" strokeWidth="2" />
                            <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="currentColor" fill="none" strokeWidth="2" />
                          </svg>
                        </div>
                      )}
                      
                      {member.isCurrentUser && (
                        <div className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h3 className="text-lg font-medium mr-2">{member.name}</h3>
                        <div className="bg-blue-100 text-blue-600 text-xs rounded-full px-2 py-0.5">
                          {member.type}
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        Joined {member.joinDate} • {member.status}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {!member.isCurrentUser && (
                        <div>
                          {member.connectionStatus === 'Pending Request' ? (
                            <button 
                              className="text-sm text-gray-700 font-medium py-1 px-3 border border-gray-200 rounded-md"
                              onClick={() => updateConnectionStatus(member.id, 'Accepted')}
                            >
                              Pending Request
                            </button>
                          ) : member.connectionStatus === 'Request Sent' ? (
                            <button 
                              className="text-sm text-gray-700 font-medium py-1 px-3 border border-gray-200 rounded-md flex items-center"
                              onClick={() => updateConnectionStatus(member.id, 'Connect')}
                            >
                              <Check className="h-4 w-4 mr-1" /> Request Sent
                            </button>
                          ) : (
                            <button 
                              className="text-sm text-gray-700 font-medium py-1 px-3 border border-gray-200 rounded-md flex items-center"
                              onClick={() => updateConnectionStatus(member.id, 'Request Sent')}
                            >
                              <UserPlus className="h-4 w-4 mr-1" /> Connect
                            </button>
                          )}
                        </div>
                      )}
                      
                      <button 
                        className="text-gray-500 hover:text-blue-600 transition-colors p-2"
                        onClick={() => messageMember(member.id)}
                      >
                        <Mail className="h-5 w-5" />
                      </button>
                      
                      <button 
                        className="text-gray-400 p-2 relative"
                        onClick={(e) => toggleMemberOptions(e, member.id)}
                      >
                        <MoreHorizontal className="h-5 w-5" />
                        {showMemberOptions === member.id && (
                          <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-md shadow-md z-10">
                            <ul className="py-1">
                              <li>
                                <button 
                                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                  onClick={() => messageMember(member.id)}
                                >
                                  Message
                                </button>
                              </li>
                              <li>
                                <button className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                                  View Profile
                                </button>
                              </li>
                              {!member.isCurrentUser && (
                                <li>
                                  <button className="px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left">
                                    Block
                                  </button>
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg text-center">
          <p className="text-gray-500">No members found matching your search.</p>
        </div>
      )}
      
      {/* Empty state when no members are found */}
      {filteredMembers.length === 0 && searchQuery && (
        <div className="mt-6 text-center">
          <button 
            className="text-blue-600 font-medium"
            onClick={() => setSearchQuery('')}
          >
            Clear search and show all members
          </button>
        </div>
      )}
    </div>
  );
};

export default MembersContent;