import GlobalChat from '../components/GlobalChat';
import AssistantTopBar from '../components/AssistantTopBar';

export const dynamic = 'force-dynamic';

export default function AssistantPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <AssistantTopBar />

      <main className="h-[calc(100vh-4rem)] max-w-6xl mx-auto px-4 py-4">
        <div className="h-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
          <GlobalChat forceOpen fullPage />
        </div>
      </main>
    </div>
  );
}
