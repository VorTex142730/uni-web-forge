
import React from 'react';
import { Link } from 'react-router-dom';
import { ThumbsUp, MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Post, User, Group } from '@/types';
import { users, groups } from '@/data/mockData';

interface FeedItemProps {
  post: Post;
}

const FeedItem: React.FC<FeedItemProps> = ({ post }) => {
  // Find author and group details
  const author = users.find(user => user.id === post.authorId);
  const group = post.groupId ? groups.find(g => g.id === post.groupId) : undefined;
  
  // Generate initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-4">
      <div className="flex items-start mb-4">
        <Link to={`/profile/${author?.id}`}>
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={author?.avatar || ''} alt={author?.name || 'User'} />
            <AvatarFallback>{author?.name ? getInitials(author.name) : 'U'}</AvatarFallback>
          </Avatar>
        </Link>
        
        <div>
          <div className="flex items-center">
            <Link to={`/profile/${author?.id}`} className="font-medium hover:underline">
              {author?.name}
            </Link>
            
            {group && (
              <>
                <span className="mx-2 text-gray-500">created the group</span>
                <Link to={`/groups/${group.id}`} className="font-medium hover:underline">
                  {group.name}
                </Link>
              </>
            )}
            
            <span className="ml-2 text-gray-500 text-sm">{post.createdAt}</span>
          </div>
          
          {post.content && (
            <p className="mt-2 text-gray-700">{post.content}</p>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <Button variant="ghost" className="text-gray-600">
          <ThumbsUp className="h-4 w-4 mr-2" />
          Like
        </Button>
      </div>
    </div>
  );
};

export default FeedItem;
