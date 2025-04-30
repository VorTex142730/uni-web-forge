import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BlogService, BlogPost } from '@/services/blogService';
import { format } from 'date-fns';

const BlogPage: React.FC = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const blogPosts = await BlogService.getPosts();
        setPosts(blogPosts);
      } catch (err) {
        setError('Failed to load blog posts');
        console.error('Error fetching blog posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff4f4] py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Blog</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            Discover stories, thinking, and expertise from writers on any topic.
          </p>
          <Button
            onClick={() => navigate('/blog/create')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Create New Post
          </Button>
        </div>

        {/* Blog Posts - Alternating Layout */}
        <div className="space-y-12">
          {posts.map((post, index) => (
            <article
              key={post.id}
              className="bg-white rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="flex flex-col md:flex-row">
                {/* Image Section */}
                <div className="md:w-2/5">
                  <div className="relative h-[300px]">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Content Section */}
                <div className="md:w-3/5 p-6 flex flex-col justify-center">
                  <div className="text-sm text-gray-500 mb-2">
                    {post.author.name} • {format(post.createdAt?.toDate ? post.createdAt.toDate() : new Date(), 'MMMM d, yyyy')}
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                      onClick={() => navigate(`/blog/${post.id}`)}
                    >
                      Read More →
                    </Button>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{post.likes} likes</span>
                      <span>{post.comments} comments</span>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
