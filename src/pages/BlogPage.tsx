import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BlogService, BlogPost } from '@/services/blogService';
import { format } from 'date-fns';
import { collection, getCountFromServer } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';

const BlogPage: React.FC = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [counts, setCounts] = useState<Record<string, { likes: number; comments: number }>>({});

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const blogPosts = await BlogService.getPosts();
        setPosts(blogPosts);
        // Fetch likes and comments count for each post
        const countsObj: Record<string, { likes: number; comments: number }> = {};
        await Promise.all(blogPosts.map(async (post) => {
          const likesSnap = await getCountFromServer(collection(db, 'blogPosts', post.id, 'likes'));
          const commentsSnap = await getCountFromServer(collection(db, 'blogPosts', post.id, 'comments'));
          countsObj[post.id] = {
            likes: likesSnap.data().count,
            comments: commentsSnap.data().count,
          };
        }));
        setCounts(countsObj);
      } catch (err) {
        setError('Failed to load blog posts');
        console.error('Error fetching blog posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // For sidebar: get recent posts (top 5)
  const recentPosts = posts.slice(0, 5);

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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Journey Blog</h1>
          <p className="text-md text-gray-500 mb-2">A new breed of explorer</p>
          <Button
            onClick={() => navigate('/blog/create')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Create New Post
          </Button>
        </div>
        {/* Alternating Blog List */}
        <div className="space-y-16">
          {posts.map((post, index) => {
            const isEven = index % 2 === 1;
            return (
              <article
                key={post.id}
                className={`bg-white rounded-xl overflow-hidden shadow group flex flex-col md:flex-row ${isEven ? 'md:flex-row-reverse' : ''} transition-all duration-300 hover:shadow-lg cursor-pointer`}
                onClick={() => navigate(`/blog/${post.id}`)}
              >
                {/* Image */}
                <div className="md:w-2/5 w-full h-56 md:h-auto relative flex-shrink-0">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Content */}
                <div className="flex-1 p-6 flex flex-col justify-center">
                  {/* Category/Tags */}
                  <div className="mb-2">
                    {post.categories && post.categories.length > 0 && (
                      <span className="text-xs font-semibold text-yellow-500 uppercase tracking-wide">
                        {post.categories.join(' / ')}
                      </span>
                    )}
                  </div>
                  {/* Title */}
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                  {/* Meta info */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <span className="font-semibold uppercase tracking-wide">{post.author.name}</span>
                    <span>•</span>
                    <span>{format(post.createdAt?.toDate ? post.createdAt.toDate() : new Date(), 'MMMM d, yyyy')}</span>
                  </div>
                  {/* Excerpt */}
                  <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
                    {post.excerpt}
                  </p>
                  {/* Read more and meta */}
                  <div className="flex items-center justify-between mt-auto pt-2">
                    <Button
                      variant="ghost"
                      className="text-blue-600 hover:text-blue-800 text-sm px-2"
                      onClick={e => { e.stopPropagation(); navigate(`/blog/${post.id}`); }}
                    >
                      Read More →
                    </Button>
                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                      <span>👍 {counts[post.id]?.likes ?? 0}</span>
                      <span>💬 {counts[post.id]?.comments ?? 0}</span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BlogPage;

