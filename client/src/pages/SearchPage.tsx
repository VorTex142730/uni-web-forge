import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy, limit, or } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, Users, MessageSquare, Image, Video, BookOpen } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface SearchResult {
  id: string;
  type: 'user' | 'group' | 'forum' | 'post' | 'photo' | 'video';
  title: string;
  description?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt?: string;
  user?: {
    name: string;
    photoURL?: string;
  };
}

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [activeTab, setActiveTab] = useState('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const performSearch = async () => {
      if (!query) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const searchResults: SearchResult[] = [];
        const searchTerm = query.toLowerCase();

        // Search users
        try {
          const usersQuery = query(
            collection(db, 'users'),
            or(
              where('firstName', '>=', searchTerm),
              where('lastName', '>=', searchTerm),
              where('nickname', '>=', searchTerm)
            ),
            limit(10)
          );
          const usersSnapshot = await getDocs(usersQuery);
          usersSnapshot.forEach(doc => {
            const userData = doc.data();
            if (
              userData.firstName?.toLowerCase().includes(searchTerm) ||
              userData.lastName?.toLowerCase().includes(searchTerm) ||
              userData.nickname?.toLowerCase().includes(searchTerm)
            ) {
              searchResults.push({
                id: doc.id,
                type: 'user',
                title: `${userData.firstName || ''} ${userData.lastName || ''}`,
                description: userData.role,
                imageUrl: userData.photoURL,
                createdAt: userData.createdAt || new Date().toISOString(),
                user: {
                  name: `${userData.firstName || ''} ${userData.lastName || ''}`,
                  photoURL: userData.photoURL
                }
              });
            }
          });
        } catch (error) {
          console.error('Error searching users:', error);
        }

        // Search groups
        try {
          const groupsQuery = query(
            collection(db, 'groups'),
            where('name', '>=', searchTerm),
            limit(10)
          );
          const groupsSnapshot = await getDocs(groupsQuery);
          groupsSnapshot.forEach(doc => {
            const groupData = doc.data();
            if (groupData.name?.toLowerCase().includes(searchTerm)) {
              searchResults.push({
                id: doc.id,
                type: 'group',
                title: groupData.name,
                description: groupData.description,
                imageUrl: groupData.photoURL,
                createdAt: groupData.createdAt || new Date().toISOString(),
                updatedAt: groupData.updatedAt
              });
            }
          });
        } catch (error) {
          console.error('Error searching groups:', error);
        }

        // Search forums
        try {
          const forumsQuery = query(
            collection(db, 'forums'),
            where('title', '>=', searchTerm),
            limit(10)
          );
          const forumsSnapshot = await getDocs(forumsQuery);
          forumsSnapshot.forEach(doc => {
            const forumData = doc.data();
            if (forumData.title?.toLowerCase().includes(searchTerm)) {
              searchResults.push({
                id: doc.id,
                type: 'forum',
                title: forumData.title,
                description: forumData.description,
                createdAt: forumData.createdAt || new Date().toISOString(),
                updatedAt: forumData.updatedAt
              });
            }
          });
        } catch (error) {
          console.error('Error searching forums:', error);
        }

        // Sort results by relevance and date
        searchResults.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA;
        });

        setResults(searchResults);
        
        if (searchResults.length === 0) {
          toast.info('No results found. Try a different search term.');
        }
      } catch (error) {
        console.error('Search error:', error);
        setError('Failed to perform search. Please try again.');
        toast.error('Search failed. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query]);

  const filteredResults = results.filter(result => {
    if (activeTab === 'all') return true;
    return result.type === activeTab;
  });

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <Users className="h-4 w-4" />;
      case 'group':
        return <Users className="h-4 w-4" />;
      case 'forum':
        return <MessageSquare className="h-4 w-4" />;
      case 'photo':
        return <Image className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-2">Search Results</h1>
        <p className="text-gray-600">
          {loading ? 'Searching...' : `Found ${filteredResults.length} results for "${query}"`}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="user">People</TabsTrigger>
          <TabsTrigger value="group">Groups</TabsTrigger>
          <TabsTrigger value="forum">Forums</TabsTrigger>
          <TabsTrigger value="photo">Photos</TabsTrigger>
          <TabsTrigger value="video">Videos</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">{error}</div>
          ) : filteredResults.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No results found for "{query}"
            </div>
          ) : (
            <div className="space-y-4">
              {filteredResults.map((result) => (
                <Link
                  key={`${result.type}-${result.id}`}
                  to={`/${result.type}s/${result.id}`}
                  className="block p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start space-x-4">
                    {result.imageUrl ? (
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={result.imageUrl} alt={result.title} />
                        <AvatarFallback>{result.title[0]}</AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                        {getResultIcon(result.type)}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{result.title}</h3>
                        <span className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(result.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      {result.description && (
                        <p className="text-sm text-gray-600 mt-1">{result.description}</p>
                      )}
                      {result.user && (
                        <p className="text-sm text-gray-500 mt-1">
                          By {result.user.name}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SearchPage; 