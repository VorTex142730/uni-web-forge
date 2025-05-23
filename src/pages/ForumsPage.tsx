import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  collection,
  getDocs,
  getCountFromServer,
  doc,
  setDoc,
  Timestamp,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  getDoc,
} from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext"; // <-- Add this import if you have a useAuth hook
import { useTheme } from '@/context/ThemeContext';

interface ForumThread {
  id: string;
  title: string;
  author: {
    name: string;
    id: string;
  };
  createdAt: Timestamp | Date;
  category?: string;
  excerpt: string;
  content: string;
}

interface Comment {
  id: string;
  content: string;
  author: {
    name: string;
    id: string;
  };
  createdAt: Timestamp;
}

const ForumPage: React.FC = () => {
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [counts, setCounts] = useState<
    Record<string, { likes: number; replies: number }>
  >({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedThread, setSelectedThread] = useState<ForumThread | null>(
    null
  );
  const [formData, setFormData] = useState<Partial<ForumThread>>({
    title: "",
    category: "",
    excerpt: "",
    content: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [userVotes, setUserVotes] = useState<
    Record<string, "like" | "dislike" | null>
  >({});
  const { user, userDetails } = useAuth(); // <-- Get the current user from your auth context/hook
  const { theme } = useTheme();

  // Fetch threads and their counts
  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const threadsCollection = collection(db, "forumThreads");
        const threadsSnapshot = await getDocs(threadsCollection);
        const threads: ForumThread[] = threadsSnapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as ForumThread)
        );

        const countsObj: Record<string, { likes: number; replies: number }> = {};
        await Promise.all(
          threads.map(async (thread) => {
            const likesSnap = await getCountFromServer(
              collection(db, "forumThreads", thread.id, "likes")
            );
            // Corrected the subcollection name to 'comments'
            const repliesSnap = await getCountFromServer(
              collection(db, "forumThreads", thread.id, "comments")
            );
            countsObj[thread.id] = {
              likes: likesSnap.data().count,
              replies: repliesSnap.data().count,
            };
          })
        );

        setThreads(threads);
        setCounts(countsObj);
      } catch (err) {
        setError("Failed to load forum threads");
        console.error("Error fetching forum threads:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchThreads();
  }, []);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission to create a new thread
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    try {
      // Basic validation
      if (!formData.title || !formData.content) {
        throw new Error("Title and content are required");
      }

      const threadRef = doc(collection(db, "forumThreads"));
      const threadData: ForumThread = {
        id: threadRef.id,
        title: formData.title!,
        author: {
          name: user?.displayName || "User", // Use actual user display name
          id: user?.uid || "unknown", // Use actual user UID
        },
        createdAt: new Date(),
        category: formData.category || undefined,
        excerpt: formData.excerpt || formData.content!.slice(0, 100),
        content: formData.content!,
      };

      // Only include defined fields to avoid undefined values
      const { category, ...rest } = threadData;
      const dataToSave = {
        ...rest,
        ...(category && { category }), // Only include category if defined
      };

      await setDoc(threadRef, dataToSave);

      // Refresh threads list
      setThreads((prev) => [threadData, ...prev]);
      setFormData({ title: "", category: "", excerpt: "", content: "" });
      setShowCreateForm(false);
    } catch (err) {
      setFormError("Failed to create thread");
      console.error("Error creating thread:", err);
    } finally {
      setFormLoading(false);
    }
  };

  // For sidebar: get recent threads (top 5)
  const recentThreads = threads.slice(0, 5);

  useEffect(() => {
    const fetchComments = async () => {
      if (selectedThread) {
        const commentsCollection = collection(
          db,
          "forumThreads",
          selectedThread.id,
          "comments"
        );
        const commentsQuery = query(
          commentsCollection,
          orderBy("createdAt", "desc")
        );
        const commentsSnapshot = await getDocs(commentsQuery);
        const commentsData = commentsSnapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as Comment)
        );
        setComments(commentsData);

        // Update replies count to match actual number of comments
        setCounts((prev) => ({
          ...prev,
          [selectedThread.id]: {
            ...prev[selectedThread.id],
            replies: commentsData.length,
          },
        }));
      }
    };

    const fetchUserVotes = async () => {
      if (selectedThread && user?.uid) {
        const userId = user.uid;
        const likesDoc = doc(
          db,
          "forumThreads",
          selectedThread.id,
          "likes",
          userId
        );
        const dislikesDoc = doc(
          db,
          "forumThreads",
          selectedThread.id,
          "dislikes",
          userId
        );

        const [likeSnap, dislikeSnap] = await Promise.all([
          getDoc(likesDoc),
          getDoc(dislikesDoc),
        ]);

        setUserVotes((prev) => ({
          ...prev,
          [selectedThread.id]: likeSnap.exists()
            ? "like"
            : dislikeSnap.exists()
            ? "dislike"
            : null,
        }));
      }
    };

    if (selectedThread) {
      fetchComments();
      fetchUserVotes();
    }
  }, [selectedThread, user?.uid]);

  const handleVote = async (type: "like" | "dislike") => {
    if (!selectedThread || !user?.uid) return;

    const userId = user.uid;
    const threadId = selectedThread.id;
    const currentVote = userVotes[threadId];

    const likesDoc = doc(db, "forumThreads", threadId, "likes", userId);
    const dislikesDoc = doc(db, "forumThreads", threadId, "dislikes", userId);

    try {
      if (type === "like") {
        if (currentVote === "like") {
          // Remove like
          await deleteDoc(likesDoc);
          setCounts((prev) => ({
            ...prev,
            [threadId]: { ...prev[threadId], likes: prev[threadId].likes - 1 },
          }));
          setUserVotes((prev) => ({ ...prev, [threadId]: null }));
        } else {
          // Add like and remove dislike if exists
          await setDoc(likesDoc, { userId });
          if (currentVote === "dislike") {
            await deleteDoc(dislikesDoc);
            setCounts((prev) => ({
              ...prev,
              [threadId]: {
                ...prev[threadId],
                dislikes: (prev[threadId].dislikes || 1) - 1,
              },
            }));
          }
          setCounts((prev) => ({
            ...prev,
            [threadId]: {
              ...prev[threadId],
              likes: (prev[threadId].likes || 0) + 1,
            },
          }));
          setUserVotes((prev) => ({ ...prev, [threadId]: "like" }));
        }
      } else {
        if (currentVote === "dislike") {
          // Remove dislike
          await deleteDoc(dislikesDoc);
          setCounts((prev) => ({
            ...prev,
            [threadId]: {
              ...prev[threadId],
              dislikes: prev[threadId].dislikes - 1,
            },
          }));
          setUserVotes((prev) => ({ ...prev, [threadId]: null }));
        } else {
          // Add dislike and remove like if exists
          await setDoc(dislikesDoc, { userId });
          if (currentVote === "like") {
            await deleteDoc(likesDoc);
            setCounts((prev) => ({
              ...prev,
              [threadId]: {
                ...prev[threadId],
                likes: (prev[threadId].likes || 1) - 1,
              },
            }));
          }
          setCounts((prev) => ({
            ...prev,
            [threadId]: {
              ...prev[threadId],
              dislikes: (prev[threadId].dislikes || 0) + 1,
            },
          }));
          setUserVotes((prev) => ({ ...prev, [threadId]: "dislike" }));
        }
      }
    } catch (error) {
      console.error("Error handling vote:", error);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedThread || !newComment.trim() || !user?.uid) return;

    try {
      const commentsCollection = collection(
        db,
        "forumThreads",
        selectedThread.id,
        "comments"
      );
      const commentDoc = doc(commentsCollection);

      let commenterName = "User";
      if (userDetails?.nickname) {
        commenterName = userDetails.nickname;
      }

      const commentData = {
        id: commentDoc.id,
        content: newComment.trim(),
        author: {
          name: commenterName,
          id: user.uid,
        },
        createdAt: Timestamp.now(),
      };

      await setDoc(commentDoc, commentData);
      setNewComment("");

      // Re-fetch comments to update both the comments list and replies count
      const commentsQuery = query(
        commentsCollection,
        orderBy("createdAt", "desc")
      );
      const commentsSnapshot = await getDocs(commentsQuery);
      const commentsData = commentsSnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Comment)
      );
      setComments(commentsData);
      setCounts((prev) => ({
        ...prev,
        [selectedThread.id]: {
          ...prev[selectedThread.id],
          replies: commentsData.length,
        },
      }));
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#001F1F]' : 'bg-gray-50'} py-8`}>
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#001F1F]' : 'bg-gray-50'} py-8`}>
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  if (selectedThread) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#001F1F]' : 'bg-[#fdf0eb]'} py-8`}>
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Thread Details Header */}
          <div className="text-center mb-12">
            <Button
              onClick={() => setSelectedThread(null)}
              className="mb-4 bg-gradient-to-r from-[#F53855] to-[#FF8A00] hover:from-[#F53855]/90 hover:to-[#FF8A00]/90 text-white"
            >
              ← Back to Threads
            </Button>
            <h1 className={`text-4xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedThread.title}</h1>
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => handleVote("like")}
                  className={`p-2 rounded-full ${userVotes[selectedThread.id] === "like" ? "text-blue-500" : "text-gray-500"}`}
                >
                  👍 {counts[selectedThread.id]?.likes ?? 0}
                </Button>
              </div>
              <span className={`text-gray-500`}>•</span>
              <span className={`text-gray-500`}>
                💬 {counts[selectedThread.id]?.replies ?? 0} comments
              </span>
            </div>
          </div>

          {/* Main Content */}
          <div className={`rounded-xl shadow p-6 mb-8 ${theme === 'dark' ? 'bg-[#072E2E] text-white' : 'bg-white'}`}>
            <div className="mb-4">
              {selectedThread.category && (
                <span className="text-xs font-semibold text-yellow-500 uppercase tracking-wide">
                  {selectedThread.category}
                </span>
              )}
            </div>
            <div className={`flex items-center gap-2 text-xs mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}> 
              <span className="font-semibold uppercase tracking-wide">
                {selectedThread.author.name}
              </span>
              <span>•</span>
              <span>
                {format(
                  selectedThread.createdAt instanceof Date ? selectedThread.createdAt : selectedThread.createdAt.toDate(),
                  "MMMM d, yyyy"
                )}
              </span>
            </div>
            <p className={`mb-4 text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-600'}`}>{selectedThread.excerpt}</p>
            <div className={`prose prose-sm max-w-none ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedThread.content}</div>
          </div>

          {/* Comments Section */}
          <div className={`rounded-xl shadow p-6 ${theme === 'dark' ? 'bg-[#072E2E] text-white' : 'bg-white'}`}>
            <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : ''}`}>Comments ({comments.length})</h2>

            <form onSubmit={handleCommentSubmit} className="mb-8">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write your comment..."
                className={`mb-4 ${theme === 'dark' ? 'border border-gray-600 focus:ring-0 focus:border-gray-600 text-white placeholder:text-gray-400 bg-[#0E4F52]' : ''}`}
                rows={3}
              />
              <Button
                type="submit"
                className="bg-gradient-to-r from-[#F53855] to-[#FF8A00] hover:from-[#F53855]/90 hover:to-[#FF8A00]/90"
              >
                Post Comment
              </Button>
            </form>

            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="border-b pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`font-semibold text-sm ${theme === 'dark' ? 'text-white' : ''}`}>{comment.author.name}</span>
                    <span className={`text-gray-500 text-xs ${theme === 'dark' ? 'text-gray-300' : ''}`}>{format(comment.createdAt.toDate(), "MMM d, yyyy 'at' h:mm a")}</span>
                  </div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>{comment.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#001F1F]' : 'bg-[#fdf0eb]'} py-8`}>
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className={`text-4xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Community Forum
          </h1>
          <p className="text-md text-gray-500 mb-2">
            Connect, discuss, and share ideas
          </p>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-gradient-to-r from-[#F53855] to-[#FF8A00] hover:from-[#F53855]/90 hover:to-[#FF8A00]/90 text-white"
          >
            {showCreateForm ? "Cancel" : "Create New Thread"}
          </Button>
        </div>

        {/* Create Thread Form */}
        {showCreateForm && (
          <div className="bg-white rounded-xl shadow p-6 max-w-3xl mx-auto mb-12">
            {formError && (
              <div className="text-center text-red-500 mb-4">{formError}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700"
                >
                  Thread Title
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#854f6c] focus:ring-[#854f6c] sm:text-sm"
                  placeholder="Enter thread title"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700"
                >
                  Category (Optional)
                </label>
                <input
                  type="text"
                  name="category"
                  id="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#854f6c] focus:ring-[#854f6c] sm:text-sm"
                  placeholder="e.g., General, Tech, Ideas"
                />
              </div>
              <div>
                <label
                  htmlFor="excerpt"
                  className="block text-sm font-medium text-gray-700"
                >
                  Excerpt (Optional)
                </label>
                <textarea
                  name="excerpt"
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#854f6c] focus:ring-[#854f6c] sm:text-sm"
                  placeholder="Brief summary of the thread (100 characters or less)"
                  rows={3}
                />
              </div>
              <div>
                <label
                  htmlFor="content"
                  className="block text-sm font-medium text-gray-700"
                >
                  Content
                </label>
                <textarea
                  name="content"
                  id="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#854f6c] focus:ring-[#854f6c] sm:text-sm"
                  placeholder="Write your thread content here"
                  rows={8}
                  required
                />
              </div>
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={formLoading}
                  className="bg-gradient-to-r from-[#F53855] to-[#FF8A00] hover:from-[#F53855]/90 hover:to-[#FF8A00]/90 text-white"
                >
                  {formLoading ? "Creating..." : "Create Thread"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Thread List */}
        <div className="space-y-16">
          {threads.map((thread, index) => {
            const isEven = index % 2 === 0;
            return (
              <article
                key={thread.id}
                className={`rounded-xl overflow-hidden shadow group flex flex-col transition-all duration-300 hover:shadow-lg cursor-pointer ${theme === 'dark' ? 'bg-[#072E2E] text-white' : 'bg-white'}`}
                onClick={() => setSelectedThread(thread)}
              >
                <div className="p-6">
                  <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{thread.title}</h2>
                  <div className={`flex items-center gap-2 text-xs mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                    <span className="font-semibold uppercase tracking-wide">{thread.author.name}</span>
                    <span>•</span>
                    <span>{format(thread.createdAt instanceof Date ? thread.createdAt : thread.createdAt.toDate(), 'MMMM d, yyyy')}</span>
                  </div>
                  <p className={`mb-4 line-clamp-2 text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-600'}`}>{thread.excerpt}</p>
                  <div className={`flex items-center space-x-4 text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-400'}`}>
                    <span>👍 {counts[thread.id]?.likes ?? 0}</span>
                    <span>💬 {counts[thread.id]?.replies ?? 0}</span>
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

export default ForumPage;
