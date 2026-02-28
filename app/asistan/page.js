import GlobalChat from '../components/GlobalChat';
import Link from 'next/link';
import { ArrowLeft, User } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function AssistantPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto h-16 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Ana sayfaya dön"
            >
              <ArrowLeft size={18} />
            </Link>
            <Link href="/" className="text-2xl font-black tracking-tight flex items-center" style={{ fontFamily: 'Inter, sans-serif' }}>
              <span className="text-indigo-600 dark:text-indigo-400">Kıyas</span>
              <span className="bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent">GO</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Asistan</span>
            <Link
              href="/profil"
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Profil"
            >
              <User size={18} />
            </Link>
          </div>
        </div>
      </header>

      <main className="h-[calc(100vh-4rem)] max-w-6xl mx-auto px-4 py-4">
        <div className="h-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
          <GlobalChat forceOpen fullPage />
        </div>
      </main>
    </div>
  );
}
