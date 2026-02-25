'use client';

import { useState, useEffect, useCallback } from 'react';
import { publicApi } from '@/lib/api';
import { Blog } from '@/types';
import FeedCard from '@/components/FeedCard';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function FeedPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadFeed = useCallback(async (pageNum: number) => {
    setIsLoading(true);
    setError('');
    try {
      const data = await publicApi.getFeed(pageNum, 10);
      setBlogs(data.data);
      setTotalPages(data.meta.totalPages);
      setTotal(data.meta.total);
    } catch {
      setError('Failed to load feed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeed(page);
  }, [page, loadFeed]);

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Twitter-style centered column */}
      <div className="max-w-2xl mx-auto border-x border-gray-800 min-h-screen">
        {/* Sticky header */}
        <div className="sticky top-16 z-40 bg-gray-950/85 backdrop-blur-md border-b border-gray-800 px-4 py-3">
          <h1 className="text-xl font-bold text-gray-100">Feed</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">
            {total > 0 ? `${total} ${total === 1 ? 'story' : 'stories'}` : 'Discover stories'}
          </p>
        </div>

        {error && (
          <div className="px-4 py-3 bg-red-500/10 text-red-400 text-sm border-b border-red-500/20 flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <LoadingSpinner />
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-24 px-4">
            <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-100 mb-1">No stories yet</h3>
            <p className="text-gray-500 text-sm">Be the first to publish something!</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-800">
              {blogs.map((blog) => (
                <FeedCard key={blog.id} blog={blog} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-1 py-6 border-t border-gray-800">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-800 rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  ←
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-full text-sm font-semibold transition-colors ${
                      p === page
                        ? 'bg-red-600 text-white'
                        : 'text-gray-500 hover:bg-gray-800 hover:text-gray-300'
                    }`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-800 rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
