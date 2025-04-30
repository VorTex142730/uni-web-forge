import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Heart, MessageCircle, ThumbsUp } from 'lucide-react';
import { BlogService, BlogPost, BlogComment } from '@/services/blogService';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';

const MAX_CLAPS = 50;

const BlogPostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Comments state
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  // Likes state
  const [totalLikes, setTotalLikes] = useState(0);
  const [userLiked, setUserLiked] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchPost = async () => {
      try {
        const blogPost = await BlogService.getPost(id);
        if (!blogPost) {
          setError('Blog post not found');
          return;
        }
        setPost(blogPost);
      } catch (err) {
        setError('Failed to load blog post');
        console.error('Error fetching blog post:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  // Listen for comments
  useEffect(() => {
    if (!id) return;
    const unsub = BlogService.listenComments(id, setComments);
    return () => unsub();
  }, [id]);

  // Listen for likes
  useEffect(() => {
    if (!id || !user) return;
    const unsub = BlogService.listenLikes(id, (total, liked) => {
      setTotalLikes(total);
      setUserLiked(liked);
    }, user.uid);
    return () => unsub();
  }, [id, user]);

  // Like logic
  const handleLike = async () => {
    if (!id || !user) return;
    await BlogService.like(id, user.uid, !userLiked);
  };

  // Comments logic
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !user || !commentText.trim()) return;
    await BlogService.addComment(id, {
      text: commentText,
      userId: user.uid,
      userName: user.displayName || 'Anonymous',
      userAvatar: user.photoURL || '',
    });
    setCommentText('');
  };

  const handleEditComment = async (commentId: string) => {
    if (!id || !editingText.trim()) return;
    await BlogService.editComment(id, commentId, editingText);
    setEditingCommentId(null);
    setEditingText('');
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!id) return;
    await BlogService.deleteComment(id, commentId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-500">{error || 'Blog post not found'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <article className="max-w-4xl mx-auto px-6 py-12">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-4 -ml-2"
          onClick={() => navigate('/blog')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Author and Meta Information */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center border overflow-hidden">
            {post.author.avatar && post.author.avatar.startsWith('data:image/') ? (
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-full h-full rounded-full object-cover"
                onError={e => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <span className="text-base font-bold text-gray-500">
                {post.author.name?.[0]?.toUpperCase() || '?'}
              </span>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-800 text-sm">{post.author.name}</span>
            <span className="text-xs text-gray-400">
              {format(post.createdAt?.toDate ? post.createdAt.toDate() : new Date(), 'MMM d, yyyy')} • {post.readTime}
            </span>
          </div>
        </div>
        <hr className="mb-6 border-gray-100" />

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">
          {post.title}
        </h1>

        {/* Subtitle/Excerpt */}
        <p className="text-lg text-gray-500 mb-6 italic">
          {post.excerpt}
        </p>

        {/* Featured Image */}
        {post.imageUrl && (
          <div className="mb-8 flex justify-center">
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full max-w-xl h-64 object-cover rounded-lg border border-gray-100"
            />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-base max-w-none text-gray-800 mb-8">
          {post.content.split('\n\n').map((paragraph, index) => (
            <p key={index} className={index === 0 ? 'mb-6 first-letter:text-3xl first-letter:font-bold first-letter:text-blue-600 first-letter:float-left first-letter:mr-2' : 'mb-6'}>
              {paragraph}
            </p>
          ))}
        </div>

        {/* Like Section */}
        <div className="flex items-center space-x-2 mb-10">
          <button
            onClick={handleLike}
            disabled={!user}
            className={`flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 bg-white hover:bg-gray-100 transition ${userLiked ? 'text-blue-600' : 'text-gray-400'}`}
            title={userLiked ? 'Unlike' : 'Like'}
          >
            <ThumbsUp className="h-6 w-6" fill={userLiked ? '#2563eb' : 'none'} />
          </button>
          <span className="text-gray-700 text-base font-medium">{totalLikes}</span>
          <span className="text-gray-400 text-sm">Likes</span>
        </div>

        {/* Comments Section */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">Comments</h2>
          {user && (
            <form onSubmit={handleAddComment} className="flex items-start space-x-2 mb-6">
              <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center border overflow-hidden">
                {user.photoURL && user.photoURL.startsWith('data:image/') ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-full h-full rounded-full object-cover"
                    onError={e => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  <span className="text-sm font-bold text-gray-500">
                    {user.displayName?.[0]?.toUpperCase() || '?'}
                  </span>
                )}
              </div>
              <textarea
                className="flex-1 border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-blue-100 resize-none min-h-[40px] text-sm"
                placeholder="Add a comment..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                maxLength={500}
                required
              />
              <Button type="submit" className="h-9 px-3 text-sm">Post</Button>
            </form>
          )}
          <div className="space-y-4">
            {comments.length === 0 && <div className="text-gray-400 text-sm">No comments yet.</div>}
            {comments.map(comment => (
              <div key={comment.id} className="flex items-start space-x-2 bg-gray-50 rounded-md p-3 border border-gray-100">
                <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center border overflow-hidden">
                  {comment.userAvatar && comment.userAvatar.startsWith('data:image/') ? (
                    <img
                      src={comment.userAvatar}
                      alt={comment.userName}
                      className="w-full h-full rounded-full object-cover"
                      onError={e => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; }}
                    />
                  ) : (
                    <span className="text-sm font-bold text-gray-500">
                      {comment.userName?.[0]?.toUpperCase() || '?'}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-0.5">
                    <span className="font-semibold text-gray-800 text-sm">{comment.userName}</span>
                    <span className="text-xs text-gray-400">{comment.createdAt?.toDate ? format(comment.createdAt.toDate(), 'MMM d, yyyy, h:mm a') : ''}</span>
                  </div>
                  {editingCommentId === comment.id ? (
                    <div className="flex items-center space-x-2 mt-1">
                      <input
                        className="flex-1 border border-gray-200 rounded p-1 text-sm"
                        value={editingText}
                        onChange={e => setEditingText(e.target.value)}
                        maxLength={500}
                      />
                      <Button size="sm" onClick={() => handleEditComment(comment.id)}>Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingCommentId(null)}>Cancel</Button>
                    </div>
                  ) : (
                    <p className="text-gray-700 text-sm mb-0.5">{comment.text}</p>
                  )}
                  {user && user.uid === comment.userId && editingCommentId !== comment.id && (
                    <div className="flex space-x-2 mt-1">
                      <Button size="sm" variant="ghost" onClick={() => { setEditingCommentId(comment.id); setEditingText(comment.text); }}>Edit</Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteComment(comment.id)}>Delete</Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
};

export default BlogPostPage; 