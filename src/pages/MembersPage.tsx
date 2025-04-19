import React, { useState, useEffect, useMemo } from 'react';
import { Search, LayoutGrid, List } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import MemberCard from '@/components/members/MemberCard';

const MembersContent = () => {
  const [view, setView] = useState('grid');
  const [sortBy, setSortBy] = useState('recently-active');
  const [searchQuery, setSearchQuery] = useState('');
  const [allMembers, setAllMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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
  }, [searchQuery, sortBy, allMembers]);

  return (
    <div className="bg-gray-50 p-6">
      <h2 className="text-2xl font-bold mb-4">Members</h2>

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
  );
};

export default MembersContent;