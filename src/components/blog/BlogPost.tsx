
import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { MessageSquare, ThumbsUp, Share2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BlogPostProps {
  post: {
    id: string | number;
    title: string;
    excerpt: string;
    content: string;
    coverImage?: string;
    author: {
      name: string;
      avatar?: string;
    };
    date: string;
    readTime: string;
    likes: number;
    comments: number;
    category: string;
  };
  featured?: boolean;
}

const BlogPost: React.FC<BlogPostProps> = ({ post, featured = false }) => {
  return (
    <Card className={cn(
      "overflow-hidden transition-all hover:shadow-md",
      featured ? "border-0 shadow-lg" : ""
    )}>
      {post.coverImage && (
        <div className="w-full">
          <img
            src={post.coverImage}
            alt={post.title}
            className={cn(
              "w-full object-cover",
              featured ? "h-64" : "h-48"
            )}
          />
        </div>
      )}
      
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Link 
            to={`/blog/category/${post.category.toLowerCase()}`}
            className="text-xs font-semibold uppercase text-hotspot-primary tracking-wide"
          >
            {post.category}
          </Link>
          <div className="flex items-center text-gray-500 text-sm">
            <Clock className="h-3 w-3 mr-1" />
            <span>{post.readTime}</span>
          </div>
        </div>
        <Link to={`/blog/${post.id}`} className="hover:text-hotspot-primary">
          <h3 className={cn(
            "font-bold text-gray-900 hover:text-hotspot-primary transition-colors line-clamp-2",
            featured ? "text-2xl mt-2" : "text-lg mt-1"
          )}>
            {post.title}
          </h3>
        </Link>
      </CardHeader>
      
      <CardContent>
        <p className="text-gray-600 text-sm line-clamp-3 mb-4">{post.excerpt}</p>
        
        <div className="flex items-center">
          <Avatar className="h-8 w-8">
            <AvatarImage src={post.author.avatar} alt={post.author.name} />
            <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="ml-2">
            <Link to={`/profile/${post.author.name.toLowerCase()}`} className="text-sm font-medium hover:text-hotspot-primary">
              {post.author.name}
            </Link>
            <p className="text-xs text-gray-500">{post.date}</p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-3 flex justify-between">
        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-hotspot-primary">
          <ThumbsUp className="h-4 w-4 mr-1" />
          <span>{post.likes}</span>
        </Button>
        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-hotspot-primary">
          <MessageSquare className="h-4 w-4 mr-1" />
          <span>{post.comments}</span>
        </Button>
        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-hotspot-primary">
          <Share2 className="h-4 w-4 mr-1" />
          <span>Share</span>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BlogPost;
