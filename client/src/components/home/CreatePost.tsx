import React, { useState, useRef } from 'react';
import { Camera, Video, Smile, MapPin, Tag, Image, X, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { createPost } from '@/services/postService';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const CreatePost: React.FC = () => {
  const [postContent, setPostContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  
  // Generate initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to create a post');
      return;
    }

    if (!postContent.trim() && !selectedImage) {
      toast.error('Please add some content to your post');
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = '';
      if (selectedImage) {
        const storage = getStorage();
        const imageRef = ref(storage, `posts/${user.uid}/${Date.now()}_${selectedImage.name}`);
        await uploadBytes(imageRef, selectedImage);
        imageUrl = await getDownloadURL(imageRef);
      }

      await createPost({
        content: postContent,
        authorId: user.uid,
        image: imageUrl || undefined
      });

      setPostContent('');
      setSelectedImage(null);
      setImagePreview(null);
      setIsExpanded(false);
      toast.success('Post created successfully');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setIsExpanded(true);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleTextareaFocus = () => {
    setIsExpanded(true);
  };

  return (
    <Card className="w-full mb-6 bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'User'} />
            <AvatarFallback>{user?.displayName ? getInitials(user.displayName) : 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">{user?.displayName || 'Anonymous'}</h3>
            <p className="text-xs text-gray-500">Share with your community</p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <Textarea
            placeholder={`What's on your mind, ${user?.displayName?.split(' ')[0] || 'there'}?`}
            className={cn(
              "w-full border-none focus:ring-0 resize-none transition-all duration-200 bg-gray-50/50 rounded-xl",
              isExpanded ? "min-h-[120px]" : "min-h-[60px]"
            )}
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            onFocus={handleTextareaFocus}
          />

          {imagePreview && (
            <div className="relative rounded-xl overflow-hidden">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="w-full max-h-[300px] object-cover rounded-xl"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 rounded-full w-8 h-8"
                onClick={removeImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col space-y-4 pt-0">
        {isExpanded && (
          <div className="w-full h-px bg-gray-100" />
        )}
        
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                className="hidden"
              />
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-gray-600 hover:bg-gray-100 rounded-full"
                    onClick={handleImageClick}
                  >
                    <Image className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Add photo</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-gray-600 hover:bg-gray-100 rounded-full"
                  >
                    <Video className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Add video</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-gray-600 hover:bg-gray-100 rounded-full"
                  >
                    <Smile className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Add feeling</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-gray-600 hover:bg-gray-100 rounded-full"
                  >
                    <MapPin className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Add location</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <Button 
            className={cn(
              "px-6 rounded-full",
              (!postContent.trim() && !selectedImage) && "opacity-50"
            )}
            onClick={handlePostSubmit}
            disabled={(!postContent.trim() && !selectedImage) || isSubmitting}
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
      </CardFooter>
    </Card>
  );
};

export default CreatePost;
