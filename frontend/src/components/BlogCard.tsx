'use client';

import Link from 'next/link';
import { Blog } from '@/types';
import LikeButton from './LikeButton';
import ShareButton from './ShareButton';

interface BlogCardProps {
  blog: Blog;
  showActions?: boolean;
  onDelete?: (id: string) => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function BlogCard({ blog, showActions, onDelete }: BlogCardProps) {
  return (
    <article className="bg-gray-900 rounded-xl border border-gray-800 p-6 hover:border-gray-700 transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            {blog.isPublished ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/50 text-green-400">
                Published
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900/50 text-yellow-400">
                Draft
              </span>
            )}
            <span className="text-xs text-gray-500">{formatDate(blog.createdAt)}</span>
          </div>

          <Link
            href={blog.isPublished ? `/blog/${blog.slug}` : showActions ? `/dashboard/edit/${blog.id}` : '#'}
            className="block"
          >
            <h2 className="text-lg font-semibold text-gray-100 hover:text-red-500 transition-colors truncate">
              {blog.title}
            </h2>
          </Link>

          {blog.summary && (
            <p className="mt-2 text-sm text-gray-400 line-clamp-2">{blog.summary}</p>
          )}

          {blog.user && (
            <p className="mt-2 text-xs text-gray-500">
              by <span className="font-medium text-gray-300">{blog.user.name || 'Anonymous'}</span>
            </p>
          )}

          <div className="mt-3 flex items-center space-x-4">
            <LikeButton
              blogId={blog.id}
              initialLikeCount={blog._count?.likes || 0}
              initialIsLiked={blog.isLikedByUser || false}
            />
            <span className="flex items-center text-sm text-gray-500">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {blog._count?.comments || 0}
            </span>
            {blog.isPublished && blog.slug && (
              <ShareButton slug={blog.slug} title={blog.title} size="sm" />
            )}
          </div>
        </div>

        {showActions && (
          <div className="flex items-center space-x-2 ml-4">
            <Link
              href={`/dashboard/edit/${blog.id}`}
              className="p-2 text-gray-500 hover:text-red-500 transition-colors"
              title="Edit"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </Link>
            <button
              onClick={() => onDelete?.(blog.id)}
              className="p-2 text-gray-500 hover:text-red-500 transition-colors"
              title="Delete"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
