
import React, { useState } from 'react';
import { Camera, Video } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const CreatePost: React.FC = () => {
  const [postContent, setPostContent] = useState('');
  const { user } = useAuth();
  
  // Generate initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would create a post in the database
    console.log('Creating post:', postContent);
    setPostContent('');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-4">
      <div className="flex items-start mb-4">
        <Avatar className="h-10 w-10 mr-3">
          <AvatarImage src={user?.avatar || ''} alt={user?.name || 'User'} />
          <AvatarFallback>{user?.name ? getInitials(user.name) : 'U'}</AvatarFallback>
        </Avatar>
        
        <div className="flex-grow">
          <textarea
            placeholder={`Share what's on your mind, ${user?.name}...`}
            className="w-full border border-gray-200 rounded-lg p-3 min-h-[60px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex space-x-4">
          <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
            <Camera className="h-5 w-5" />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
            <Video className="h-5 w-5" />
          </button>
        </div>
        
        <Button 
          className={cn(
            "px-4 py-2",
            !postContent.trim() && "opacity-50 cursor-not-allowed"
          )}
          onClick={handlePostSubmit}
          disabled={!postContent.trim()}
        >
          Post
        </Button>
      </div>
    </div>
  );
};

export default CreatePost;
