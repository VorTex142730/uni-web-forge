import React from 'react';
import { useParams } from 'react-router-dom';
import { MoreHorizontal } from 'lucide-react';

const ForumDetailsPage = () => {
  const { forumId } = useParams();

  // Mock data for the forum (replace with actual data fetching)
  const forum = {
    id: forumId,
    title: 'Nexora',
    type: 'Group',
    isPublic: true,
    lastActive: '7 weeks ago',
    organizer: {
      id: '1',
      name: 'John Doe',
      avatar: null,
    },
    memberCount: 2,
    subgroupCount: 1,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Banner */}
      <div className="h-48 bg-gray-600"></div>

      {/* Forum Info Section */}
      <div className="max-w-6xl mx-auto px-4 -mt-16">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6">
            <div className="flex items-start justify-between">
              {/* Left side - Forum info */}
              <div className="flex items-start space-x-4">
                <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0"></div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className="text-2xl font-semibold">{forum.title}</h1>
                    <span className="px-2 py-1 bg-blue-100 text-blue-600 text-sm rounded">
                      {forum.type}
                    </span>
                  </div>
                  <div className="flex items-center mt-2 text-sm text-gray-600 space-x-4">
                    <span>{forum.isPublic ? 'Public' : 'Private'}</span>
                    <span>•</span>
                    <span>Active {forum.lastActive}</span>
                  </div>
                  <div className="mt-4">
                    <div className="text-sm text-gray-600">Organizer:</div>
                    <div className="flex items-center mt-1">
                      <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right side - Actions */}
              <div className="flex items-center space-x-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  + Join Group
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <MoreHorizontal className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="border-t">
            <nav className="flex space-x-6 px-6">
              <NavItem label="Members" count={forum.memberCount} isActive={false} />
              <NavItem label="Feed" />
              <NavItem label="Photos" />
              <NavItem label="Videos" />
              <NavItem label="Albums" />
              <NavItem label="Subgroups" count={forum.subgroupCount} />
              <NavItem label="Discussions" />
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium mb-4">All Discussions</h2>
          <div className="flex items-center justify-center py-8 text-gray-500">
            <div className="text-center">
              <div className="mb-2">Sorry, there were no discussions found.</div>
              <div>You cannot create new discussions.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const NavItem = ({ label, count, isActive = false }: { label: string; count?: number; isActive?: boolean }) => (
  <button
    className={`px-4 py-3 text-sm font-medium border-b-2 ${
      isActive
        ? 'border-blue-600 text-blue-600'
        : 'border-transparent text-gray-600 hover:text-gray-900'
    }`}
  >
    {label}
    {count !== undefined && (
      <span className="ml-2 bg-gray-100 px-2 py-0.5 rounded-full text-xs">
        {count}
      </span>
    )}
  </button>
);

export default ForumDetailsPage; 