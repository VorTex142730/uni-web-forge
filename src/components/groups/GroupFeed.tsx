import React, { useState, useEffect, useRef } from 'react';
import { onSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Trash2, Loader2, XCircle } from 'lucide-react'; // Import an icon for the delete button
import { toast } from 'sonner';
import { FeedService, FeedPost } from '@/services/feedService';

interface GroupFeedProps {
  groupId: string;
  isOwner: boolean;
  isMember: boolean;
}

const GroupFeed: React.FC<GroupFeedProps> = ({ groupId, isOwner, isMember }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [newPost, setNewPost] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State additions for image handling
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // State for full-screen image modal
  const [selectedImageForView, setSelectedImageForView] = useState<string | null>(null);

  useEffect(() => {
    if (!groupId) return;

    const query = FeedService.getPaginatedPosts(groupId);
    const unsubscribe = onSnapshot(query, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FeedPost[];
      setPosts(postsData);
    });

    return () => unsubscribe();
  }, [groupId]);

  // Add ESC key handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedImageForView(null);
      }
    };

    if (selectedImageForView) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedImageForView]);

  // Handle image selection and preview
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1000000) { // 1MB limit
        toast.error('Image must be smaller than 1MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setSelectedImage(file);
    }
  };

  // Handle post creation
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (!newPost.trim() && !selectedImage)) {
      toast.error('Please add content or select an image to post');
      return;
    }

    setIsSubmitting(true);
    try {
      let imageData = '';

      if (selectedImage) {
        imageData = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(selectedImage);
        });
      }

      const postData = {
        content: newPost.trim(),
        groupId,
        createdBy: {
          userId: user.uid,
          displayName: user.displayName || 'Anonymous',
          photoURL: user.photoURL
        },
        ...(imageData && { imageData })
      };

      await FeedService.createPost(postData);

      setNewPost('');
      setSelectedImage(null);
      setImagePreview(null);
      toast.success('Post created successfully');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add a function to handle post deletion
  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await FeedService.deletePost(postId); // Assuming `deletePost` is a method in FeedService
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
      toast.success('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  if (!isMember) {
    return (
      <div className="text-center py-8 text-gray-500">
        You need to be a member to view posts
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Post Form */}
      <form onSubmit={handleCreatePost} className="space-y-4">
        <div className="flex space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'User'} />
            <AvatarFallback>{user?.displayName?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder="What's on your mind?"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="min-h-[100px] resize-none"
            />

            {/* Image preview */}
            {imagePreview && (
              <div className="mt-2 relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="rounded-lg max-h-48 object-cover w-full"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-2 right-2 bg-white/80 rounded-full p-1 hover:bg-white"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            )}

            <div className="flex justify-between mt-2">
              <div className="flex items-center space-x-2">
                <label className="cursor-pointer text-gray-500 hover:text-gray-700">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </label>
              </div>
              <Button 
                type="submit" 
                disabled={isSubmitting || (!newPost.trim() && !selectedImage)}
                className="rounded-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Posting...
                  </>
                ) : (
                  'Post'
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* Posts List */}
      <div className="space-y-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={post.createdBy.photoURL || ''} alt={post.createdBy.displayName} />
                  <AvatarFallback>{post.createdBy.displayName[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{post.createdBy.displayName}</p>
                  <p className="text-sm text-gray-500">
                    {post.createdAt?.toDate().toLocaleString()}
                  </p>
                </div>
              </div>
              {/* Delete button (visible only to the post creator or group owner) */}
              {(post.createdBy.userId === user?.uid || isOwner) && (
                <button
                  onClick={() => handleDeletePost(post.id)}
                  className="text-red-500 hover:text-red-700"
                  title="Delete Post"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              )}
            </div>

            <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>

            {/* Display post image */}
            {post.imageData && (
              <img
                src={post.imageData}
                alt="Post content"
                className="mt-2 rounded-lg w-full max-h-96 object-cover cursor-pointer"
                onClick={() => setSelectedImageForView(post.imageData!)}
              />
            )}
          </div>
        ))}
      </div>

      {/* Full Screen Image Modal */}
      {selectedImageForView && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={() => setSelectedImageForView(null)}
        >
          <div className="max-w-full max-h-full p-4 relative" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              onClick={() => setSelectedImageForView(null)}
              className="absolute -top-2 -right-2 bg-white rounded-full p-1.5 hover:bg-gray-100 transition-colors shadow-sm z-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-800"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <img
              src={selectedImageForView}
              className="max-w-full max-h-full object-contain"
              alt="Full screen content"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupFeed;