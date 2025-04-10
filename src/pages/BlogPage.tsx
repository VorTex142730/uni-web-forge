
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, Search } from 'lucide-react';
import { blogPosts } from '@/data/blogData';
import BlogPost from '@/components/blog/BlogPost';

const BlogPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const featuredPost = blogPosts[0];
  const recentPosts = blogPosts.slice(1);

  const categories = [
    { name: 'All', value: 'all' },
    { name: 'Programming', value: 'programming' },
    { name: 'Education', value: 'education' },
    { name: 'Campus Life', value: 'campus-life' },
    { name: 'Career', value: 'career' },
    { name: 'Lifestyle', value: 'lifestyle' }
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Blog</h1>
        <p className="text-gray-600">Explore the latest articles, tips, and insights</p>
      </div>

      <div className="relative mb-8">
        <Input
          placeholder="Search articles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
      </div>

      <Tabs defaultValue="all" className="mb-8">
        <TabsList className="w-full overflow-x-auto flex whitespace-nowrap py-1 justify-start">
          {categories.map((category) => (
            <TabsTrigger 
              key={category.value} 
              value={category.value}
              className="px-4 py-2 text-sm"
            >
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Featured Post</h2>
        </div>
        <BlogPost post={featuredPost} featured={true} />
      </div>

      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Recent Posts</h2>
          <Button variant="ghost" className="text-hotspot-primary hover:text-hotspot-primary/90">
            View All <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentPosts.map((post) => (
            <BlogPost key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
