import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const parseLimit = (value) => {
  const parsed = Number.parseInt(String(value || DEFAULT_LIMIT), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_LIMIT;
  return Math.min(parsed, MAX_LIMIT);
};

const canAccessDebugLogs = (request) => {
  if (process.env.NODE_ENV !== 'production') return true;

  const requiredKey = process.env.ASSISTANT_DEBUG_KEY;
  if (!requiredKey) return false;

  const headerKey = request.headers.get('x-assistant-debug-key') || '';
  const queryKey = new URL(request.url).searchParams.get('debugKey') || '';
  return headerKey === requiredKey || queryKey === requiredKey;
};

export async function GET(request) {
  try {
    if (!canAccessDebugLogs(request)) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseLimit(searchParams.get('limit'));

    const { data, error } = await supabaseAdmin
      .from('agent_decision_logs')
      .select('id, created_at, prompt, status, effective_category, primary_aspect, effective_budget, suggestion_count, top_suggestion, decision_trace')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Decision logs fetch error:', error);
      return NextResponse.json({ error: 'Karar logları alınamadı.' }, { status: 500 });
    }

    return NextResponse.json({ logs: data || [] });
  } catch (error) {
    console.error('Decision logs endpoint error:', error);
    return NextResponse.json({ error: 'Beklenmeyen hata.' }, { status: 500 });
  }
}
