
import React from 'react';
import CreatePost from '@/components/home/CreatePost';
import FeedItem from '@/components/home/FeedItem';
import ProfileCompletion from '@/components/home/ProfileCompletion';
import GroupsList from '@/components/home/GroupsList';
import MembersList from '@/components/home/MembersList';
import { posts, currentUser } from '@/data/mockData';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const { user } = useAuth();
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Homepage</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left sidebar */}
        <div className="space-y-6">
          {user && <ProfileCompletion progress={user.profileComplete || 0} />}
          <GroupsList />
        </div>
        
        {/* Main feed */}
        <div className="md:col-span-2">
          <CreatePost />
          
          <div className="mb-4 pb-2 border-b border-gray-200">
            <button className="font-medium text-blue-600 border-b-2 border-blue-600 pb-2 mr-4">
              All Updates
            </button>
          </div>
          
          {posts.map(post => (
            <FeedItem key={post.id} post={post} />
          ))}
        </div>
        
        {/* Right sidebar */}
        <div className="md:col-start-3 row-start-1">
          <MembersList />
        </div>
      </div>
    </div>
  );
};

export default Index;
