import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';

// Mock data to replicate the screenshot
const MOCK_FORUMS = [
  {
    id: '1',
    title: 'Adventure and Thrill',
    isPrivate: false,
    description: '',
    lastActivity: null,
    memberCount: 0,
    image: null
  },
  {
    id: '2',
    title: 'Private: Entrepreneurship Club',
    isPrivate: true,
    description: 'To meet the future entrepreneur in the campus.',
    lastActivity: null,
    memberCount: 0,
    image: 'mission-unicorn.png'
  },
  {
    id: '3',
    title: 'Private: Game development Group',
    isPrivate: true,
    description: '',
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30 - 1000 * 60 * 60 * 24 * 14), // 1 month, 2 weeks ago
    memberCount: 0,
    image: null
  },
  {
    id: '4',
    title: 'Nexora',
    isPrivate: false,
    description: '',
    lastActivity: null,
    memberCount: 0,
    image: null
  },
  {
    id: '5',
    title: 'Testing club',
    isPrivate: false,
    description: 'Just to check if the website is working properly or not ?',
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30 * 6 - 1000 * 60 * 60 * 24 * 14), // 6 months, 2 weeks ago
    memberCount: 0,
    image: 'hotspot.png'
  },
  {
    id: '6',
    title: 'Private: Travify',
    isPrivate: true,
    description: '',
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30 - 1000 * 60 * 60 * 24 * 14), // 1 month, 2 weeks ago
    memberCount: 0,
    image: null
  }
];

// Mock discussion data
const DISCUSSIONS = [
  {
    id: '1',
    title: 'Unreal or Unity ?',
    author: 'Robert',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30 - 1000 * 60 * 60 * 24 * 14), // 1 month, 2 weeks ago
    memberCount: 2,
    replyCount: 2,
    group: 'Game development Group'
  }
];

const ForumsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const formatDate = (date) => {
    if (!date) return null;
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const months = Math.floor(days / 30);
    const weeks = Math.floor((days % 30) / 7);
    
    if (months >= 1) {
      return `${months} month${months > 1 ? 's' : ''}, ${weeks} weeks ago`;
    }
    return `${weeks} weeks ago`;
  };

  return (
    <div className="bg-pink-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-medium">Forums</h1>
          <div className="relative">
            <input
              type="text"
              placeholder="Search forums..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {MOCK_FORUMS.map((forum) => (
            <div key={forum.id} className="bg-white rounded-lg overflow-hidden shadow-sm">
              <div className="h-32 bg-slate-500 relative">
                {forum.image && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black">
                    <img 
                      src={`/images/${forum.image}`} 
                      alt={forum.title}
                      className="max-h-full object-contain"
                    />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900">{forum.title}</h3>
                {forum.description && (
                  <p className="text-gray-600 text-sm mt-1">
                    {forum.description}
                  </p>
                )}
                <div className="text-sm text-gray-500 mt-2">
                  {forum.lastActivity ? (
                    <span>{formatDate(forum.lastActivity)}</span>
                  ) : (
                    <span>No Discussions</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-sm text-gray-500 mb-6">
          Viewing 1 - 6 of 6 forums
        </div>

        <div className="bg-white rounded-lg p-4">
          <h2 className="text-lg font-medium mb-4">All Discussions</h2>
          
          {DISCUSSIONS.map(discussion => (
            <div key={discussion.id} className="border-t border-gray-100 py-4 flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-300 mr-4"></div>
                <div>
                  <h3 className="font-medium">{discussion.title}</h3>
                  <div className="text-sm text-gray-500">
                    <span>{discussion.author} replied {formatDate(discussion.date)}</span>
                    <span className="mx-1">·</span>
                    <span>{discussion.memberCount} Members</span>
                    <span className="mx-1">·</span>
                    <span>{discussion.replyCount} Replies</span>
                  </div>
                </div>
              </div>
              <div className="bg-blue-500 text-white text-xs rounded-full px-3 py-1">
                {discussion.group}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ForumsPage;

/* 
Firebase integration would go here:

1. Import Firebase hooks and functions:
import { useAuth } from '@/context/AuthContext';
import { getForums, createForum } from '@/lib/firebase/forums';

2. Add state for loading and forum data:
const [forums, setForums] = useState([]);
const [loading, setLoading] = useState(true);
const { user } = useAuth();

3. Load forums from Firebase on component mount:
useEffect(() => {
  const loadForums = async () => {
    try {
      const forumsData = await getForums();
      setForums(forumsData);
    } catch (error) {
      console.error('Error loading forums:', error);
    } finally {
      setLoading(false);
    }
  };
  
  loadForums();
}, []);

4. For forum creation, you would need the Dialog component and related state:
const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
const [newForumData, setNewForumData] = useState({
  title: '',
  description: '',
  isPrivate: false,
});

const handleCreateForum = async () => {
  try {
    const forumRef = await createForum({
      title: newForumData.title,
      description: newForumData.description,
      isPrivate: newForumData.isPrivate,
    });
    
    // Reset form and reload data
    setIsCreateDialogOpen(false);
    setNewForumData({ title: '', description: '', isPrivate: false });
    loadForums();
  } catch (error) {
    console.error('Error creating forum:', error);
  }
};
*/