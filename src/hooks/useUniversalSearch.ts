import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, limit, or } from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';

export type UniversalSearchType = 'user' | 'group' | 'forum' | 'post' | 'blog' | 'photo' | 'video';

export interface UniversalSearchResult {
  id: string;
  type: UniversalSearchType;
  title: string;
  description?: string;
  imageUrl?: string;
  createdAt?: string;
  extra?: any;
}

export function useUniversalSearch(searchTerm: string, maxPerType: number = 3) {
  const [results, setResults] = useState<UniversalSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const doSearch = async () => {
      const lower = searchTerm.toLowerCase();
      const allResults: UniversalSearchResult[] = [];

      // USERS
      try {
        const usersQuery = query(
          collection(db, 'users'),
          where('role', '==', 'Member'),
          or(
            where('firstName', '>=', lower),
            where('lastName', '>=', lower),
            where('nickname', '>=', lower)
          ),
          limit(maxPerType)
        );
        const usersSnap = await getDocs(usersQuery);
        usersSnap.forEach(doc => {
          const d = doc.data();
          if (
            d.firstName?.toLowerCase().includes(lower) ||
            d.lastName?.toLowerCase().includes(lower) ||
            d.nickname?.toLowerCase().includes(lower)
          ) {
            allResults.push({
              id: doc.id,
              type: 'user',
              title: `${d.firstName || ''} ${d.lastName || ''}`.trim(),
              description: d.role,
              imageUrl: d.photoURL,
              createdAt: d.createdAt,
              extra: d
            });
          }
        });
      } catch (e) { /* ignore */ }

      // GROUPS
      try {
        const groupsQuery = query(
          collection(db, 'groups'),
          where('name', '>=', lower),
          limit(maxPerType)
        );
        const groupsSnap = await getDocs(groupsQuery);
        groupsSnap.forEach(doc => {
          const d = doc.data();
          if (d.name?.toLowerCase().includes(lower)) {
            allResults.push({
              id: doc.id,
              type: 'group',
              title: d.name,
              description: d.description,
              imageUrl: d.photoURL,
              createdAt: d.createdAt,
              extra: d
            });
          }
        });
      } catch (e) { /* ignore */ }

      // FORUMS
      try {
        const forumsQuery = query(
          collection(db, 'forums'),
          where('title', '>=', lower),
          limit(maxPerType)
        );
        const forumsSnap = await getDocs(forumsQuery);
        forumsSnap.forEach(doc => {
          const d = doc.data();
          if (d.title?.toLowerCase().includes(lower)) {
            allResults.push({
              id: doc.id,
              type: 'forum',
              title: d.title,
              description: d.description,
              createdAt: d.createdAt,
              extra: d
            });
          }
        });
      } catch (e) { /* ignore */ }

      // POSTS
      try {
        const postsQuery = query(
          collection(db, 'posts'),
          where('content', '>=', lower),
          limit(maxPerType)
        );
        const postsSnap = await getDocs(postsQuery);
        postsSnap.forEach(doc => {
          const d = doc.data();
          if (d.content?.toLowerCase().includes(lower)) {
            allResults.push({
              id: doc.id,
              type: 'post',
              title: d.content.slice(0, 40) + (d.content.length > 40 ? '...' : ''),
              description: d.content,
              imageUrl: d.image,
              createdAt: d.createdAt,
              extra: d
            });
          }
        });
      } catch (e) { /* ignore */ }

      // BLOG POSTS
      try {
        const blogQuery = query(
          collection(db, 'blogPosts'),
          where('title', '>=', lower),
          limit(maxPerType)
        );
        const blogSnap = await getDocs(blogQuery);
        blogSnap.forEach(doc => {
          const d = doc.data();
          if (d.title?.toLowerCase().includes(lower)) {
            allResults.push({
              id: doc.id,
              type: 'blog',
              title: d.title,
              description: d.excerpt,
              imageUrl: d.imageUrl,
              createdAt: d.createdAt,
              extra: d
            });
          }
        });
      } catch (e) { /* ignore */ }

      // PHOTOS (from posts with image)
      try {
        const postsQuery = query(
          collection(db, 'posts'),
          where('image', '>=', ''),
          limit(maxPerType)
        );
        const postsSnap = await getDocs(postsQuery);
        postsSnap.forEach(doc => {
          const d = doc.data();
          if (d.image && d.image.toLowerCase().includes(lower)) {
            allResults.push({
              id: doc.id,
              type: 'photo',
              title: d.content?.slice(0, 40) || 'Photo',
              imageUrl: d.image,
              createdAt: d.createdAt,
              extra: d
            });
          }
        });
      } catch (e) { /* ignore */ }

      // VIDEOS (if you have a video field in posts, otherwise skip)
      // Example: if (d.video && d.video.toLowerCase().includes(lower))
      // You can add a similar block for videos if you have a dedicated collection or field

      setResults(allResults);
      setLoading(false);
    };

    doSearch().catch(e => {
      setError('Search failed');
      setLoading(false);
    });
  }, [searchTerm, maxPerType]);

  return { results, loading, error };
} 