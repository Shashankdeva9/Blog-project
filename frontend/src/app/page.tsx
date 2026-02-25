import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-24">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Image
            src="/logo.jpeg"
            alt="Whispr"
            width={48}
            height={48}
            className="rounded-xl"
          />
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-100 mb-6 tracking-tight">
          Welcome to{' '}
          <span className="text-red-500">
            Whispr
          </span>
        </h1>
        <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
          A modern, secure blog platform. Share your thoughts, engage with the community,
          and build your audience.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/feed"
            className="bg-red-600 text-white px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-red-500 transition-colors"
          >
            Browse Feed
          </Link>
          <Link
            href="/register"
            className="bg-gray-900 text-red-500 border-2 border-gray-700 px-8 py-3.5 rounded-xl font-semibold text-lg hover:border-red-600 hover:bg-red-500/10 transition-all"
          >
            Get Started
          </Link>
        </div>
      </div>

      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center p-8 bg-gray-900 rounded-2xl border border-gray-800 hover:border-gray-700 transition-all">
          <div className="w-14 h-14 bg-red-500/10 rounded-xl flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-100 mb-2">Secure</h3>
          <p className="text-sm text-gray-500 leading-relaxed">JWT authentication, bcrypt hashing, and input validation</p>
        </div>
        <div className="text-center p-8 bg-gray-900 rounded-2xl border border-gray-800 hover:border-gray-700 transition-all">
          <div className="w-14 h-14 bg-red-500/10 rounded-xl flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-100 mb-2">Social</h3>
          <p className="text-sm text-gray-500 leading-relaxed">Like posts, leave comments, and engage with the community</p>
        </div>
        <div className="text-center p-8 bg-gray-900 rounded-2xl border border-gray-800 hover:border-gray-700 transition-all">
          <div className="w-14 h-14 bg-red-500/10 rounded-xl flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-100 mb-2">Fast</h3>
          <p className="text-sm text-gray-500 leading-relaxed">Built with Next.js 15, optimized queries, and rate limiting</p>
        </div>
      </div>
    </div>
  );
}
