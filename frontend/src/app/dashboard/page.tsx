'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Blog } from '@/types';
import { blogApi, ApiError } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import BlogCard from '@/components/BlogCard';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

type Tab = 'published' | 'drafts';

function DashboardContent() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('published');

  const loadBlogs = useCallback(async () => {
    try {
      const data = await blogApi.getMyBlogs();
      setBlogs(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to load blogs');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBlogs();
  }, [loadBlogs]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog?')) return;

    setDeleteId(id);
    try {
      await blogApi.deleteBlog(id);
      setBlogs((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      }
    } finally {
      setDeleteId(null);
    }
  };

  const publishedBlogs = useMemo(() => blogs.filter((b) => b.isPublished), [blogs]);
  const draftBlogs = useMemo(() => blogs.filter((b) => !b.isPublished), [blogs]);
  const displayedBlogs = activeTab === 'published' ? publishedBlogs : draftBlogs;

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'published', label: 'Published', count: publishedBlogs.length },
    { key: 'drafts', label: 'Drafts', count: draftBlogs.length },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">My Blogs</h1>
          <p className="text-gray-400 mt-1">Manage your blog posts</p>
        </div>
        <Link
          href="/dashboard/new"
          className="bg-red-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Blog</span>
        </Link>
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-400 text-sm p-3 rounded-lg mb-6">{error}</div>
      )}

      {isLoading ? (
        <LoadingSpinner />
      ) : blogs.length === 0 ? (
        <div className="text-center py-16">
          <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-100 mb-1">No blogs yet</h3>
          <p className="text-gray-500 mb-4">Create your first blog post to get started</p>
          <Link
            href="/dashboard/new"
            className="inline-flex items-center bg-red-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Create Blog
          </Link>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-gray-900 rounded-xl mb-6 border border-gray-800">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? 'bg-gray-800 text-gray-100 shadow-sm'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab.label}
                <span
                  className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs ${
                    activeTab === tab.key
                      ? tab.key === 'drafts'
                        ? 'bg-yellow-900/50 text-yellow-400'
                        : 'bg-green-900/50 text-green-400'
                      : 'bg-gray-800 text-gray-500'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Blog list */}
          {displayedBlogs.length === 0 ? (
            <div className="text-center py-12 bg-gray-900 rounded-xl border border-gray-800">
              <p className="text-gray-500">
                {activeTab === 'published'
                  ? 'No published blogs yet. Publish a draft to see it here.'
                  : 'No drafts. All your posts are published!'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayedBlogs.map((blog) => (
                <div key={blog.id} className={deleteId === blog.id ? 'opacity-50' : ''}>
                  <BlogCard blog={blog} showActions onDelete={handleDelete} />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
