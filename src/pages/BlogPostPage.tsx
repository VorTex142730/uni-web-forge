import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  imageUrl: string;
  readTime: string;
}

// Sample blog post data (in a real app, this would come from an API)
const blogPosts: Record<string, BlogPost> = {
  '1': {
    id: '1',
    title: 'Bringing People Together: Steps to Build a Community',
    excerpt: 'Creating a community is about more than just gathering people in one place—it\'s about fostering genuine connections, shared interests, and a sense of belonging.',
    content: `Creating a community is about more than just gathering people in one place—it's about fostering genuine connections, shared interests, and a sense of belonging. Whether you're starting a local group, an online forum, or a social media circle, these steps will help you build a community that thrives.

1. Define Your Purpose

Every strong community has a clear purpose. Are you bringing people together to share a hobby, support a cause, or exchange ideas? A well-defined goal gives your community direction and attracts like-minded individuals. For example, if your focus is photography, your purpose might be to help members improve their skills and share their work.

2. Create a Welcoming Space

The environment you create sets the tone for your community. Whether it's a physical meetup or an online platform, ensure the space is inclusive and easy to navigate. Set clear guidelines for behavior to maintain a positive atmosphere—encourage respect, kindness, and collaboration.

3. Encourage Engagement

A community thrives on interaction. Start conversations by asking questions, hosting events, or sharing content that sparks discussion. For instance, you could organize a photo challenge where members share their best shots based on a theme. Acknowledge contributions by highlighting members' efforts, which makes them feel valued.

4. Foster Connections

Help members connect with each other, not just with you. Introduce people with similar interests, create opportunities for collaboration, and encourage them to support one another. Over time, these relationships will strengthen the community's foundation.

5. Be Consistent and Present

Building a community takes time and effort. Show up regularly—whether it's posting updates, responding to messages, or hosting events. Consistency builds trust, and your active presence signals that the community is a priority.

By focusing on purpose, inclusivity, and engagement, you can create a community where people feel connected and inspired. Start small, stay committed, and watch your community grow into a vibrant space for shared experiences.`,
    date: 'Mar 21, 2023',
    author: 'Admin',
    readTime: '5 min read',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3'
  },
  '2': {
    id: '2',
    title: 'Expand Your Reach: How to Grow Your Following',
    excerpt: 'Building a following on a social media platform takes strategy and consistency. Whether you\'re an individual, a creator, or a brand, these steps will help you attract more followers and keep them engaged.',
    content: `Building a following on a social media platform takes strategy and consistency. Whether you're an individual, a creator, or a brand, these steps will help you attract more followers and keep them engaged.

1. Optimize Your Profile

Your profile is your first impression. Use a clear profile picture, write a concise bio that reflects your personality or brand, and include a link to your website or other platforms. Make it easy for people to understand who you are and what you offer.

2. Post Consistently

Regular posting keeps your audience engaged. Create a content schedule—whether it's daily, every other day, or weekly—and stick to it. Consistency helps you stay visible in your followers' feeds and attracts new users over time.

3. Share Valuable Content

Focus on content that resonates with your audience. Share tips, insights, or entertaining posts that align with their interests. For example, if your niche is travel, post stunning photos, travel itineraries, or packing hacks. High-quality visuals and captions that spark conversation work best.

4. Engage With Your Audience

Social media is a two-way street. Respond to comments, answer messages, and join conversations in your niche. Engaging with your followers builds loyalty, and interacting with others' content can expose you to new audiences.

5. Use Hashtags and Trends

Hashtags make your content discoverable. Research popular hashtags in your niche and use them strategically. Also, keep an eye on trending topics or challenges—participating in them can increase your visibility and attract new followers.

Growing a following takes time, but by staying authentic, consistent, and engaged, you'll build a loyal audience that values your content. Start applying these tips today, and watch your social media presence soar!`,
    date: 'Mar 21, 2023',
    author: 'Admin',
    readTime: '3 min read',
    imageUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-4.0.3'
  },
  '3': {
    id: '3',
    title: 'Building Connections Through Social Media Groups',
    excerpt: 'Groups on social media platforms are hubs for people with shared interests, from hobbyists to professionals. They offer a space to connect, learn, and collaborate.',
    content: `Groups on social media platforms are hubs for people with shared interests, from hobbyists to professionals. They offer a space to connect, learn, and collaborate. Here's how to use groups effectively to build meaningful relationships.

1. Find the Right Groups

Search for groups that align with your interests or goals. If you're a fitness enthusiast, look for groups focused on workouts, nutrition, or running. Check the group's activity level and rules to ensure it's a good fit.

2. Introduce Yourself

When you join a group, make a quick introduction post. Share a bit about yourself and why you're there. For example, "Hi everyone, I'm Alex, and I'm here to learn more about photography techniques!" This helps members get to know you and makes you approachable.

3. Participate Actively

Don't just lurk—engage! Comment on posts, answer questions, and share your own insights. Active participation shows you're invested in the group and helps you build connections with other members.

4. Start Conversations

Create posts that spark discussion. Ask questions, share a helpful resource, or post about a challenge you're facing. For instance, in a cooking group, you might ask, "What's your go-to quick dinner recipe?" Engaging posts encourage others to interact with you.

5. Respect Group Dynamics

Follow the group's rules and culture. Be respectful in your interactions, and avoid self-promotion unless it's allowed. Building trust within the group makes you a valued member and opens the door to deeper connections.

Social media groups are a fantastic way to find your tribe. By being active, respectful, and genuine, you'll form connections that enrich your experience on the platform.`,
    date: 'Mar 21, 2023',
    author: 'Admin',
    readTime: '3 min read',
    imageUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3'
  },
  '4': {
    id: '4',
    title: 'Captivate Your Audience with Social Media Stories',
    excerpt: 'Stories on social media platforms are short, temporary posts that let you share moments in real-time. They\'re a powerful tool to connect with your audience in a casual, authentic way.',
    content: `Stories on social media platforms are short, temporary posts that let you share moments in real-time. They're a powerful tool to connect with your audience in a casual, authentic way. Here's how to make the most of them.

1. Keep It Authentic

Stories are less polished than regular posts, and that's their charm. Share behind-the-scenes moments, like your morning routine, a work-in-progress project, or a quick thought. Authenticity resonates with viewers and makes you relatable.

2. Use Interactive Features

Most platforms offer stickers, polls, and questions for stories. Use them to engage your audience. For example, post a poll asking, "Coffee or tea?" or use a question sticker to invite followers to share their opinions. Interaction keeps viewers coming back.

3. Post Regularly

Since stories disappear after 24 hours, posting frequently keeps you visible. Share small updates throughout the day—maybe a sunrise photo in the morning, a lunch snap, and a sunset shot later. Regular posts keep your audience engaged without overwhelming them.

4. Highlight Your Best Stories

Many platforms let you save stories as highlights on your profile. Use this feature to showcase your best moments, like a travel series, a product launch, or a tutorial. Highlights give new followers a glimpse of what you're about.

5. Add a Call to Action

Encourage viewers to take action. If you're sharing a story about a new post, add a "Swipe up to see more!" prompt. If you're promoting an event, include the date and a "Save the date!" reminder. A clear call to action drives engagement.

Stories are a fun, effective way to connect with your audience. Use them to show your personality, engage followers, and share your journey in a way that feels fresh and immediate.`,
    date: 'Mar 21, 2023',
    author: 'Admin',
    readTime: '3 min read',
    imageUrl: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?ixlib=rb-4.0.3'
  }
};

const BlogPostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const post = id ? blogPosts[id] : null;

  if (!post) {
    return <div className="container mx-auto px-4 py-8">Blog post not found</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6 -ml-2 hover:bg-gray-100"
          onClick={() => navigate('/blog')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blog
        </Button>

        {/* Author and Meta Information */}
        <div className="flex items-center space-x-2 mb-6">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-600 text-sm">{post.author[0]}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>{post.author}</span>
            <span>•</span>
            <span>{post.date}</span>
            <span>•</span>
            <span>{post.readTime}</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-900 mb-8">{post.title}</h1>

        {/* Subtitle/Excerpt */}
        <p className="text-xl text-gray-600 mb-8">
          {post.excerpt}
        </p>

        {/* Featured Image */}
        <div className="mb-8">
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-[400px] object-cover rounded-lg"
          />
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          {post.content.split('\n\n').map((paragraph, index) => (
            <p key={index} className="mb-6 text-gray-700 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      </article>
    </div>
  );
};

export default BlogPostPage; 