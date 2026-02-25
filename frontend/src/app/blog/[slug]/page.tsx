'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { publicApi } from '@/lib/api';
import { Blog } from '@/types';
import LikeButton from '@/components/LikeButton';
import ShareButton from '@/components/ShareButton';
import CommentSection from '@/components/CommentSection';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [blog, setBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadBlog() {
      try {
        const data = await publicApi.getBlogBySlug(slug);
        setBlog(data);
      } catch {
        setError('Blog not found');
      } finally {
        setIsLoading(false);
      }
    }
    loadBlog();
  }, [slug]);

  if (isLoading) return <LoadingSpinner />;

  if (error || !blog) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-100 mb-4">Blog not found</h1>
        <p className="text-gray-400 mb-8">The blog you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <Link href="/feed" className="text-red-500 hover:text-red-400 font-medium">
          &larr; Back to Feed
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(blog.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/feed" className="text-red-500 hover:text-red-400 text-sm font-medium mb-6 inline-block">
        &larr; Back to Feed
      </Link>

      <article className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-100 mb-4">{blog.title}</h1>

          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-8 pb-6 border-b border-gray-800">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                {blog.user?.name?.charAt(0).toUpperCase() || '?'}
              </div>
              <span className="font-medium text-gray-300">{blog.user?.name || 'Anonymous'}</span>
            </div>
            <span>&middot;</span>
            <time dateTime={blog.createdAt}>{formattedDate}</time>
          </div>

          {blog.summary && (
            <div className="bg-gray-800 border-l-4 border-red-500 p-4 mb-8 rounded-r-lg">
              <p className="text-gray-400 text-sm italic">{blog.summary}</p>
            </div>
          )}

          <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed whitespace-pre-wrap">
            {blog.content}
          </div>
        </div>

        <div className="px-8 py-4 border-t border-gray-800 bg-gray-950 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <LikeButton
              blogId={blog.id}
              initialLikeCount={blog._count?.likes ?? 0}
              initialIsLiked={blog.isLikedByUser ?? false}
            />
            <span className="text-sm text-gray-500">
              {blog._count?.comments ?? 0} comment{(blog._count?.comments ?? 0) !== 1 ? 's' : ''}
            </span>
          </div>
          <ShareButton slug={blog.slug} title={blog.title} size="md" />
        </div>
      </article>

      <div className="mt-8">
        <CommentSection blogId={blog.id} />
      </div>
    </div>
  );
}
