'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Blog } from '@/types';
import ShareButton from './ShareButton';

interface FeedCardProps {
  blog: Blog;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function extractFirstImage(content: string): string | null {
  const mdMatch = content.match(/!\[.*?\]\((.*?)\)/);
  if (mdMatch) return mdMatch[1];
  const htmlMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (htmlMatch) return htmlMatch[1];
  return null;
}

function getExcerpt(content: string, maxLen = 200): string {
  const plain = content
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/[#*_~`>|\\-]/g, '')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return plain.length > maxLen ? plain.slice(0, maxLen).trimEnd() + '…' : plain;
}

function getInitials(name: string | null): string {
  if (!name) return '?';
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

function getReadingTime(content: string): string {
  const words = content.split(/\s+/).length;
  const mins = Math.max(1, Math.ceil(words / 200));
  return `${mins} min read`;
}

export default function FeedCard({ blog }: FeedCardProps) {
  const imageUrl = blog.content ? extractFirstImage(blog.content) : null;
  const excerpt = blog.content ? getExcerpt(blog.content) : blog.summary || '';
  const readTime = blog.content ? getReadingTime(blog.content) : '';

  return (
    <Link href={`/blog/${blog.slug}`} className="group block">
      <article className="px-4 py-4 hover:bg-gray-800/50 transition-colors duration-150 flex gap-3">
        {/* Avatar column */}
        <div className="flex-shrink-0 pt-0.5">
          <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-bold">
            {blog.user ? getInitials(blog.user.name) : '?'}
          </div>
        </div>

        {/* Content column */}
        <div className="flex-1 min-w-0">
          {/* Name + handle-style date */}
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[15px] font-bold text-gray-100 truncate">
              {blog.user?.name || 'Anonymous'}
            </span>
            <span className="text-gray-600">·</span>
            <time className="text-sm text-gray-500 flex-shrink-0">{formatDate(blog.createdAt)}</time>
          </div>

          {/* Title */}
          <h2 className="text-[15px] font-extrabold text-gray-100 leading-snug mb-1 line-clamp-2 group-hover:text-red-500 transition-colors">
            {blog.title}
          </h2>

          {/* Excerpt */}
          {excerpt && (
            <p className="text-[14px] text-gray-400 leading-relaxed line-clamp-2 mb-3">
              {excerpt}
            </p>
          )}

          {/* Embedded image */}
          {imageUrl && (
            <div className="relative w-full h-48 sm:h-64 rounded-2xl overflow-hidden border border-gray-700 mb-3">
              <Image
                src={imageUrl}
                alt={blog.title}
                fill
                className="object-cover"
                sizes="(max-width: 672px) 100vw, 600px"
                unoptimized
              />
            </div>
          )}

          {/* Action row */}
          <div className="flex items-center gap-6 -ml-2">
            {/* Comments */}
            <button className="flex items-center gap-2 text-gray-500 hover:text-sky-400 transition-colors group/action px-2 py-1 rounded-full hover:bg-sky-400/10">
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
              </svg>
              <span className="text-[13px] font-medium">{blog._count?.comments || 0}</span>
            </button>

            {/* Likes */}
            <button className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors group/action px-2 py-1 rounded-full hover:bg-red-500/10">
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              <span className="text-[13px] font-medium">{blog._count?.likes || 0}</span>
            </button>

            {/* Read time */}
            {readTime && (
              <span className="text-[13px] text-gray-600 font-medium">
                {readTime}
              </span>
            )}

            {/* Share */}
            <ShareButton slug={blog.slug} title={blog.title} size="sm" />

            {/* Bookmark — pushed right */}
            <button title="Bookmark" className="ml-auto text-gray-600 hover:text-red-500 transition-colors px-2 py-1 rounded-full hover:bg-red-500/10">
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
              </svg>
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
}
