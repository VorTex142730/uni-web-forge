import React, { useState, useEffect, useMemo } from 'react';
import { Search, LayoutGrid, List, Users } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { MemberCard } from '@/components/members/MemberCard';
import { useAuth } from '@/context/AuthContext';
import { getConnections, getOutgoingRequests } from '@/lib/firebase/connections';
import { useTheme } from '@/context/ThemeContext';

const MembersContent = () => {
  const [view, setView] = useState('grid');
  const [sortBy, setSortBy] = useState('recently-active');
  const [searchQuery, setSearchQuery] = useState('');
  const [allMembers, setAllMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, userDetails } = useAuth();
  const [connectedIds, setConnectedIds] = useState<string[]>([]);
  const [pendingIds, setPendingIds] = useState<string[]>([]);
  const { theme } = useTheme();

  // Fetch members from Firestore
  useEffect(() => {
    const fetchMembers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const members = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAllMembers(members);
      } catch (error) {
        console.error('Error fetching members:', error);
        setError('Failed to load members. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchConnections = async () => {
      const connections = await getConnections(user.uid);
      const ids = connections.map((c: any) => c.otherUserId);
      setConnectedIds(ids);
      const outgoing = await getOutgoingRequests(user.uid);
      setPendingIds(outgoing.map((r: any) => r.to));
    };
    fetchConnections();
  }, [user]);

  // Memoized filtering and sorting
  const filteredMembers = useMemo(() => {
    let result = [...allMembers];

    // Search filtering
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(member =>
        (member.firstName?.toLowerCase() || '').includes(query) ||
        (member.lastName?.toLowerCase() || '').includes(query) ||
        (member.role?.toLowerCase() || '').includes(query)
      );
    }

    // Hide already connected or pending
    if (user) {
      result = result.filter(m => m.id !== user.uid && !connectedIds.includes(m.id));
    }

    // Sorting
    switch (sortBy) {
      case 'recently-active':
        result.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        break;
      case 'alphabetical':
        result.sort((a, b) =>
          (a.firstName || '').localeCompare(b.firstName || '')
        );
        break;
      default:
        break;
    }

    return result;
  }, [searchQuery, sortBy, allMembers, user, connectedIds, pendingIds]);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#001F1F]' : 'bg-[#fdf0eb]'}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className={`mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${theme === 'dark' ? 'bg-[#072E2E]' : 'bg-white/50'} backdrop-blur-sm p-4 rounded-xl shadow-sm`}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search Members..."
              className={`border ${theme === 'dark' ? 'border-[#072E2E] bg-[#072E2E] text-white' : 'border-gray-200 bg-white/80'} pl-10 pr-4 py-2 rounded-lg w-full text-sm backdrop-blur-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className={`border ${theme === 'dark' ? 'border-[#072E2E] bg-[#072E2E] text-white' : 'border-gray-200 bg-white/80'} px-4 py-2 rounded-lg backdrop-blur-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200`}
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            <option value="recently-active">Recently Active</option>
            <option value="alphabetical">Alphabetical</option>
          </select>

          <div className={`flex border ${theme === 'dark' ? 'border-[#072E2E]' : 'border-gray-200'} rounded-lg overflow-hidden ${theme === 'dark' ? 'bg-[#072E2E]' : 'bg-white/80'} backdrop-blur-sm`}>
            <button
              className={`p-2 ${view === 'grid' ? 'bg-gradient-to-r from-[#F53855] to-[#FF8A00] text-white' : theme === 'dark' ? 'bg-[#072E2E] text-white' : 'bg-white'}`}
              onClick={() => setView('grid')}
            >
              <LayoutGrid className="h-5 w-5" />
            </button>
            <button
              className={`p-2 ${view === 'list' ? 'bg-gradient-to-r from-[#F53855] to-[#FF8A00] text-white' : theme === 'dark' ? 'bg-[#072E2E] text-white' : 'bg-white'}`}
              onClick={() => setView('list')}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className={`text-center text-gray-500 ${theme === 'dark' ? 'bg-[#072E2E] text-white' : 'bg-white/50'} backdrop-blur-sm p-8 rounded-xl`}>Loading members...</div>
        ) : error ? (
          <div className={`${theme === 'dark' ? 'bg-[#072E2E] text-white' : 'bg-white/50'} backdrop-blur-sm p-8 rounded-xl text-center text-red-500`}>{error}</div>
        ) : filteredMembers.length > 0 ? (
          <div className={view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6' : 'flex flex-col gap-4'}>
            {filteredMembers.map(member => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        ) : (
          <div className={`${theme === 'dark' ? 'bg-[#072E2E] text-white' : 'bg-white/50'} backdrop-blur-sm p-8 rounded-xl text-center`}>
            <p className="text-gray-500">No members found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MembersContent;