import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { BlogService } from '@/services/blogService';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft } from 'lucide-react';
import { db } from '@/config/firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';

const CreateBlogPostPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, userDetails } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Restrict to admins only
  if (!userDetails?.role || userDetails.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded shadow text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-gray-600">Only admins can create new blog posts.</p>
          <Button className="mt-6" onClick={() => navigate('/blog')}>Back to Blog</Button>
        </div>
      </div>
    );
  }

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    imageUrl: '', // Will be set after upload
    readTime: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError('Image must be smaller than 5MB');
      return;
    }

    setImageFile(file);
    
    // Convert to base64 for preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      let imageUrl = formData.imageUrl;
      if (imageFile) {
        // Convert image to base64
        const reader = new FileReader();
        reader.readAsDataURL(imageFile);
        
        // Wait for the base64 conversion to complete
        imageUrl = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('Failed to convert image to base64'));
        });
      }
      
      await BlogService.createPost({
        ...formData,
        imageUrl,
        author: {
          name: user.displayName || 'Anonymous',
          avatar: user.photoURL || 'https://via.placeholder.com/40'
        },
        likes: 0,
        comments: 0,
        date: new Date().toISOString()
      });
      navigate('/blog');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create blog post';
      setError(errorMessage);
      console.error('Error creating blog post:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdf0eb] py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6 -ml-2 hover:bg-[#854f6c]/10 hover:text-[#854f6c]"
          onClick={() => navigate('/blog')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blog
        </Button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Blog Post</h1>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter blog post title"
            />
          </div>

          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">
              Excerpt
            </label>
            <Textarea
              id="excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              required
              placeholder="Enter a brief excerpt"
              rows={3}
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <Textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              placeholder="Enter blog post content"
              rows={10}
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <Input
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              placeholder="Enter category"
            />
          </div>

          <div>
            <label htmlFor="imageUpload" className="block text-sm font-medium text-gray-700 mb-1">
              Upload Image
            </label>
            <Input
              id="imageUpload"
              name="imageUpload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="mt-2 w-48 h-32 object-cover rounded" />
            )}
          </div>

          <div>
            <label htmlFor="readTime" className="block text-sm font-medium text-gray-700 mb-1">
              Read Time
            </label>
            <Input
              id="readTime"
              name="readTime"
              value={formData.readTime}
              onChange={handleChange}
              required
              placeholder="e.g., 5 min read"
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#854f6c] hover:bg-[#854f6c]/90 text-white"
            >
              {loading ? 'Creating...' : 'Create Post'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBlogPostPage; 