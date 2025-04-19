import React, { useState } from 'react';
import { Search, Plus, LayoutGrid, List } from 'lucide-react';

// Mock data for the groups
const mockGroups = [
  {
    id: 1,
    name: "Game development Group",
    privacy: "Private",
    lastActive: "20 hours ago",
    coverImage: "/purple-cover.jpg",
    icon: "/game-dev-icon.png",
    members: [{ id: 1, avatar: "/avatar1.png" }, { id: 2, avatar: "/avatar2.png" }, { id: 3, avatar: "/avatar3.png" }],
    canJoin: false
  },
  {
    id: 2,
    name: "Nexora",
    privacy: "Public",
    lastActive: "6 weeks ago",
    coverImage: "/gray-cover.jpg",
    icon: "/nexora-icon.png",
    members: [{ id: 1, avatar: "/avatar1.png" }, { id: 2, avatar: "/avatar2.png" }],
    canJoin: true
  },
  {
    id: 3,
    name: "Entrepreneurship Club",
    privacy: "Private",
    lastActive: "6 weeks ago",
    coverImage: "/blue-cover.jpg",
    icon: "/entrepreneur-icon.png",
    members: [{ id: 1, avatar: "/avatar1.png" }, { id: 2, avatar: "/avatar2.png" }],
    canJoin: false
  },
  {
    id: 4,
    name: "The Hotspot Community..",
    privacy: "Public",
    lastActive: "6 weeks ago",
    coverImage: "/black-cover.jpg",
    icon: "/hotspot-icon.png",
    members: [{ id: 1, avatar: "/avatar1.png" }, { id: 2, avatar: "/avatar2.png" }, { id: 3, avatar: "/avatar3.png" }],
    canJoin: true
  }
];

const GroupCard = ({ group, viewType }) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100">
      <div className="h-24 bg-gray-200 relative" style={{ backgroundImage: `url(${group.coverImage})`, backgroundSize: 'cover' }}>
        <div className="absolute -bottom-8 left-4">
          <div className="w-16 h-16 bg-white rounded-lg p-1 shadow-md">
            <img src={group.icon} alt={group.name} className="w-full h-full object-cover rounded" />
          </div>
        </div>
      </div>
      
      <div className="pt-10 px-4 pb-4">
        <h3 className="text-lg font-semibold text-gray-800">{group.name}</h3>
        <div className="flex items-center text-sm text-gray-500 mt-1 space-x-1">
          <span className={group.privacy === "Private" ? "text-gray-500" : "text-gray-500"}>{group.privacy}</span>
          <span>•</span>
          <span>Group</span>
          <span>•</span>
          <span>Active {group.lastActive}</span>
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center">
            {group.members.slice(0, 3).map((member, index) => (
              <div key={member.id} className="w-7 h-7 rounded-full bg-gray-200 border-2 border-white overflow-hidden" style={{ marginLeft: index > 0 ? "-8px" : "0" }}>
                <img src={member.avatar} alt="Member" className="w-full h-full object-cover" />
              </div>
            ))}
            {group.members.length > 3 && (
              <div className="w-7 h-7 rounded-full bg-gray-200 border-2 border-white overflow-hidden flex items-center justify-center text-xs text-gray-600" style={{ marginLeft: "-8px" }}>
                +{group.members.length - 3}
              </div>
            )}
          </div>
          
          <button className={`text-sm px-4 py-2 rounded-md ${group.canJoin ? "text-gray-700 border border-gray-300 hover:bg-gray-50" : "text-blue-600 border border-blue-200 hover:bg-blue-50"}`}>
            {group.canJoin ? "Join Group" : "Request Access"}
          </button>
        </div>
      </div>
    </div>
  );
}

const GroupsPage = () => {
  const [view, setView] = useState('grid');
  const [sortBy, setSortBy] = useState('Recently Active');
  const [searchQuery, setSearchQuery] = useState('');
  const totalGroups = 4;

  return (
    <div className="px-4 py-6">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Groups</h1>
          <div className="w-64">
            <div className="relative">
              <input
                type="text"
                placeholder="Search Groups..."
                className="w-full py-2 px-4 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button className="py-3 px-4 text-gray-800 font-medium border-b-2 border-blue-500 flex items-center">
            All Groups
            <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{totalGroups}</span>
          </button>
          <button className="py-3 px-4 text-gray-500 font-medium flex items-center">
            <Plus size={18} className="mr-2" />
            Create a Group
          </button>
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative inline-block">
            <select 
              className="appearance-none bg-white border border-gray-200 rounded-lg py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option>Recently Active</option>
              <option>Most Members</option>
              <option>Newest</option>
              <option>Alphabetical</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>

          <div className="flex space-x-2">
            <button 
              className={`p-2 rounded ${view === 'grid' ? 'bg-gray-100' : 'bg-white'}`}
              onClick={() => setView('grid')}
            >
              <LayoutGrid size={18} className={view === 'grid' ? 'text-gray-800' : 'text-gray-400'} />
            </button>
            <button 
              className={`p-2 rounded ${view === 'list' ? 'bg-gray-100' : 'bg-white'}`}
              onClick={() => setView('list')}
            >
              <List size={18} className={view === 'list' ? 'text-gray-800' : 'text-gray-400'} />
            </button>
          </div>
        </div>

        {/* Group Cards */}
        <div className={`${view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6' : 'space-y-4'}`}>
          {mockGroups.map(group => (
            <GroupCard key={group.id} group={group} viewType={view} />
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-6 text-sm text-gray-500">
          Viewing 1 - {totalGroups} of {totalGroups} groups
        </div>
      </div>
    </div>
  );
};

export default GroupsPage;