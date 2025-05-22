import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ForumService, ForumThread } from "@/services/forumService";
import { db } from "@/config/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

const ForumCreate: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<ForumThread>>({
    title: "",
    category: "",
    excerpt: "",
    content: "",
    imageUrl: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Basic validation
      if (!formData.title || !formData.content) {
        throw new Error("Title and content are required");
      }

      const threadData: ForumThread = {
        id: "", // Will be set by Firestore
        title: formData.title!,
        author: {
          name: "Current User", // Replace with actual user data from auth context
          id: "user-id-placeholder", // Replace with actual user ID
        },
        createdAt: new Date(),
        category: formData.category || undefined,
        excerpt: formData.excerpt || formData.content!.slice(0, 100),
        imageUrl: formData.imageUrl || undefined,
        content: formData.content!,
      };

      await ForumService.createThread(threadData);
      navigate("/forum");
    } catch (err) {
      setError("Failed to create thread");
      console.error("Error creating thread:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdf0eb] py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Create New Thread
          </h1>
          <p className="text-md text-gray-500 mb-2">
            Share your ideas with the community
          </p>
        </div>
        {/* Form */}
        <div className="bg-white rounded-xl shadow p-6 max-w-3xl mx-auto">
          {error && (
            <div className="text-center text-red-500 mb-4">{error}</div>
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
            <div>
              <label
                htmlFor="imageUrl"
                className="block text-sm font-medium text-gray-700"
              >
                Image URL (Optional)
              </label>
              <input
                type="url"
                name="imageUrl"
                id="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#854f6c] focus:ring-[#854f6c] sm:text-sm"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="ghost"
                className="text-gray-500 hover:text-gray-700"
                onClick={() => navigate("/forum")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-[#F53855] to-[#FF8A00] hover:from-[#F53855]/90 hover:to-[#FF8A00]/90 text-white"
              >
                {loading ? "Creating..." : "Create Thread"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForumCreate;
