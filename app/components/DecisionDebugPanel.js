"use client";

import { useEffect, useMemo, useState } from 'react';

const formatBudget = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return '—';
  return `${Math.round(num).toLocaleString('tr-TR')} ₺`;
};

const formatTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('tr-TR');
};

export default function DecisionDebugPanel() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLogs = async () => {
    try {
      setError('');
      const params = new URLSearchParams();
      params.set('limit', '25');

      if (typeof window !== 'undefined') {
        const current = new URL(window.location.href);
        const debugKey = current.searchParams.get('debugKey');
        if (debugKey) {
          params.set('debugKey', debugKey);
        }
      }

      const response = await fetch(`/api/assistant/decision-logs?${params.toString()}`, {
        method: 'GET',
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error('Karar logları alınamadı');
      }

      const data = await response.json();
      setLogs(Array.isArray(data.logs) ? data.logs : []);
    } catch (err) {
      setError(err?.message || 'Karar logları alınamadı');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const timer = setInterval(fetchLogs, 12000);
    return () => clearInterval(timer);
  }, []);

  const stats = useMemo(() => {
    const total = logs.length;
    const withSuggestions = logs.filter((item) => Number(item.suggestion_count) > 0).length;
    const thermalFirst = logs.filter((item) => item?.primary_aspect === 'thermal').length;
    return { total, withSuggestions, thermalFirst };
  }, [logs]);

  return (
    <aside className="h-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">Decision Debug</h2>
          <button
            type="button"
            onClick={fetchLogs}
            className="text-xs font-semibold px-2.5 py-1 rounded-md border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Yenile
          </button>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2 text-[11px]">
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-2 text-center">
            <div className="font-bold text-slate-800 dark:text-slate-100">{stats.total}</div>
            <div className="text-slate-500">log</div>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-2 text-center">
            <div className="font-bold text-slate-800 dark:text-slate-100">{stats.withSuggestions}</div>
            <div className="text-slate-500">önerili</div>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-2 text-center">
            <div className="font-bold text-slate-800 dark:text-slate-100">{stats.thermalFirst}</div>
            <div className="text-slate-500">ısınma-1</div>
          </div>
        </div>
      </div>

      <div className="h-[calc(100%-112px)] overflow-y-auto p-3 space-y-3">
        {loading && <p className="text-xs text-slate-500">Yükleniyor...</p>}
        {error && <p className="text-xs text-rose-500">{error}</p>}

        {!loading && !error && logs.length === 0 && (
          <p className="text-xs text-slate-500">Henüz decision log yok.</p>
        )}

        {logs.map((log) => {
          const ordered = Array.isArray(log?.decision_trace?.orderedAspects)
            ? log.decision_trace.orderedAspects
            : [];

          return (
            <div key={log.id} className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50/70 dark:bg-slate-800/40">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">#{log.id}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400">{log.status || 'ok'}</span>
              </div>

              <p className="mt-1 text-[11px] text-slate-500">{formatTime(log.created_at)}</p>
              <p className="mt-2 text-xs font-medium text-slate-800 dark:text-slate-200 line-clamp-3">{log.prompt}</p>

              <div className="mt-2 space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                <p>Kategori: <span className="font-semibold">{log.effective_category || '—'}</span></p>
                <p>Öncelik: <span className="font-semibold">{log.primary_aspect || '—'}</span></p>
                <p>Bütçe: <span className="font-semibold">{formatBudget(log.effective_budget)}</span></p>
                <p>Öneri: <span className="font-semibold">{log.suggestion_count || 0}</span></p>
              </div>

              {ordered.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {ordered.slice(0, 4).map((item, idx) => (
                    <span key={`${log.id}-${idx}`} className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/60">
                      {item.id}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
