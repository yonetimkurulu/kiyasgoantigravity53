import GlobalChat from '../components/GlobalChat';
import AssistantTopBar from '../components/AssistantTopBar';
import DecisionDebugPanel from '../components/DecisionDebugPanel';

export const dynamic = 'force-dynamic';

export default function AssistantPage({ searchParams }) {
  const debugMode = searchParams?.debug === '1';
  const debugKey = searchParams?.debugKey || '';
  const requiredDebugKey = process.env.ASSISTANT_DEBUG_KEY || '';

  const canUseProdDebug =
    process.env.NODE_ENV === 'production'
      ? (debugMode && requiredDebugKey && debugKey === requiredDebugKey)
      : debugMode;

  const showDecisionDebug = process.env.NODE_ENV !== 'production' || canUseProdDebug;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <AssistantTopBar />

      <main className="h-[calc(100vh-4rem)] max-w-7xl mx-auto px-4 py-4">
        <div className={`h-full grid gap-4 ${showDecisionDebug ? 'grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px]' : 'grid-cols-1'}`}>
          <div className="h-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
            <GlobalChat forceOpen fullPage />
          </div>

          {showDecisionDebug && (
            <div className="hidden lg:block h-full">
              <DecisionDebugPanel />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
