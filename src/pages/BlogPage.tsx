import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  author: string;
  imageUrl: string;
}

const samplePosts: BlogPost[] = [
  {
    id: '1',
    title: 'Processing Tips To Improve Your Photos',
    excerpt: 'Learn the essential techniques and tools to enhance your photography with these professional processing tips.',
    category: 'Lifestyle',
    date: 'FEBRUARY 13, 2023',
    author: 'CRIMSONTHEMES',
    imageUrl: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?ixlib=rb-4.0.3'
  },
  {
    id: '2',
    title: 'Pictures Of The Year – Real Life & Moments',
    excerpt: 'A collection of breathtaking photographs capturing the most memorable moments of the year.',
    category: 'Lifestyle / Travel',
    date: 'FEBRUARY 13, 2023',
    author: 'CRIMSONTHEMES',
    imageUrl: 'https://images.unsplash.com/photo-1518457607834-6e8d80c183c5?ixlib=rb-4.0.3'
  },
  {
    id: '3',
    title: "We Can't Get Enough Of These Hairstyles",
    excerpt: 'Discover the latest trending hairstyles that are taking the fashion world by storm.',
    category: 'Lifestyle',
    date: 'FEBRUARY 13, 2023',
    author: 'CRIMSONTHEMES',
    imageUrl: 'https://images.unsplash.com/photo-1522336572468-97b06e8ef143?ixlib=rb-4.0.3'
  },
  {
    id: '4',
    title: 'The Art of Mindful Living',
    excerpt: 'Explore ways to incorporate mindfulness into your daily routine for a more balanced life.',
    category: 'Wellness',
    date: 'FEBRUARY 14, 2023',
    author: 'CRIMSONTHEMES',
    imageUrl: 'https://images.unsplash.com/photo-1545389336-cf090694435e?ixlib=rb-4.0.3'
  }
];

const BlogPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Blog</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover stories, thinking, and expertise from writers on any topic.
          </p>
        </div>

        {/* Blog Posts - Alternating Layout */}
        <div className="space-y-12">
          {samplePosts.map((post, index) => (
            <article
              key={post.id}
              className="bg-white rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:-translate-y-1"
            >
              <div className={`flex flex-col md:flex-row ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                {/* Image Section */}
                <div className="md:w-2/5">
                  <div className="relative h-[300px]">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="inline-block bg-orange-100 text-orange-500 px-3 py-1 rounded-full text-sm font-medium">
                        {post.category}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="md:w-3/5 p-6 flex flex-col justify-center">
                  <div className="text-sm text-gray-500 mb-2">
                    {post.author} • {post.date}
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
                    {post.excerpt}
                  </p>
                  <Button
                    variant="ghost"
                    className="text-blue-600 hover:text-blue-800 self-start text-sm"
                    onClick={() => navigate(`/blog/${post.id}`)}
                  >
                    Read More →
                  </Button>
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
