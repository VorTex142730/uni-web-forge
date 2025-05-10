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
import { useUniversalSearch, UniversalSearchType, UniversalSearchResult } from '@/hooks/useUniversalSearch';

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
  extra?: {
    username?: string;
  };
}

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [activeTab, setActiveTab] = useState<UniversalSearchType | 'all'>('all');
  const { results, loading, error } = useUniversalSearch(query, 20);

  // Group results by type
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) acc[result.type] = [];
    acc[result.type].push(result);
    return acc;
  }, {} as Record<UniversalSearchType, UniversalSearchResult[]>);

  const typeLabels: Record<UniversalSearchType, string> = {
    user: 'People',
    group: 'Groups',
    forum: 'Forums',
    post: 'Posts',
    blog: 'Blog Posts',
    photo: 'Photos',
    video: 'Videos',
  };
  const typeIcons: Record<UniversalSearchType, JSX.Element> = {
    user: <Users className="h-4 w-4" />, group: <Users className="h-4 w-4" />, forum: <MessageSquare className="h-4 w-4" />, post: <BookOpen className="h-4 w-4" />, blog: <BookOpen className="h-4 w-4" />, photo: <Image className="h-4 w-4" />, video: <Video className="h-4 w-4" />
  };

  const filteredResults = activeTab === 'all'
    ? results
    : results.filter(result => result.type === activeTab);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-2">Search Results</h1>
        <p className="text-gray-600">
          {loading ? 'Searching...' : `Found ${filteredResults.length} results for "${query}"`}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 flex flex-wrap gap-2">
          <TabsTrigger value="all">All</TabsTrigger>
          {Object.keys(typeLabels).map(type => (
            <TabsTrigger key={type} value={type}>{typeLabels[type as UniversalSearchType]}</TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={activeTab} className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
          ) : filteredResults.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No results found.</div>
          ) : (
            <div className="space-y-4">
              {filteredResults.map(result => {
                let to = '/';
                switch (result.type) {
                  case 'user':
                    to = `/profile/${result.extra?.username || result.id}`;
                    break;
                  case 'blog':
                    to = `/blog/${result.id}`;
                    break;
                  case 'forum':
                    to = `/forums/${result.id}`;
                    break;
                  case 'group':
                    to = `/groups/${result.id}`;
                    break;
                  case 'post':
                    to = `/posts/${result.id}`;
                    break;
                  case 'photo':
                    to = `/photos`;
                    break;
                  case 'video':
                    to = `/videos`;
                    break;
                  default:
                    break;
                }
                return (
                  <Link
                    key={`${result.type}-${result.id}`}
                    to={to}
                    className="flex items-center gap-4 bg-white rounded-lg shadow p-4 hover:bg-gray-50 transition"
                  >
                    {result.imageUrl ? (
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={result.imageUrl} alt={result.title} />
                        <AvatarFallback>{result.title[0]}</AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                        {typeIcons[result.type]}
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-lg flex items-center gap-2">
                        {result.title}
                        <span className="ml-2 text-xs text-gray-400">{typeLabels[result.type]}</span>
                      </div>
                      {result.description && <div className="text-gray-500 text-sm">{result.description}</div>}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SearchPage; 