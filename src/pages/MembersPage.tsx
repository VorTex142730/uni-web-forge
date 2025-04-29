import React, { useState, useEffect, useMemo } from 'react';
import { Search, LayoutGrid, List, Users } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import MemberCard from '@/components/members/MemberCard';
import { useAuth } from '@/context/AuthContext';
import { getConnections, getOutgoingRequests } from '@/lib/firebase/connections';

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
    <div className="min-h-screen bg-gray-50">
      {/* Header with Fixed Gradient */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-7xl mx-auto px-4">
          {/* Cover Photo Area */}
          <div className="relative h-32">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600" />
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-center gap-4">
                {userDetails?.photoURL ? (
                  <img
                    src={userDetails.photoURL}
                    alt="Profile"
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                    {/* Default avatar */}
                    <span className="text-gray-500">U</span>
                  </div>
                )}
                <div className="text-white flex-1">
                  <div className="flex items-center gap-4 text-sm">
                    <span>{allMembers.length} total members</span>
                    <span>•</span>
                    <span>{filteredMembers.length} matching your search</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search Members..."
              className="border border-gray-200 pl-10 pr-4 py-2 rounded-lg w-60 text-sm"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="border border-gray-200 px-4 py-2 rounded-lg"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            <option value="recently-active">Recently Active</option>
            <option value="alphabetical">Alphabetical</option>
          </select>

          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            <button
              className={`p-2 ${view === 'grid' ? 'bg-gray-100' : 'bg-white'}`}
              onClick={() => setView('grid')}
            >
              <LayoutGrid className="h-5 w-5" />
            </button>
            <button
              className={`p-2 ${view === 'list' ? 'bg-gray-100' : 'bg-white'}`}
              onClick={() => setView('list')}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center text-gray-500">Loading members...</div>
        ) : error ? (
          <div className="bg-white p-8 rounded-lg text-center text-red-500">{error}</div>
        ) : filteredMembers.length > 0 ? (
          <div className={view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6' : 'flex flex-col gap-4'}>
            {filteredMembers.map(member => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-lg text-center">
            <p className="text-gray-500">No members found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MembersContent;