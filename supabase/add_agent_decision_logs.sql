-- Agent decision observability table
-- Tracks deterministic assistant decisions for ABSA-lite ranking behavior.

CREATE TABLE IF NOT EXISTS public.agent_decision_logs (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    request_type TEXT NOT NULL DEFAULT 'assistant',
    prompt TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ok',
    effective_category TEXT,
    primary_aspect TEXT,
    effective_budget NUMERIC,
    brand_prefs JSONB NOT NULL DEFAULT '[]'::jsonb,
    ordered_aspects JSONB NOT NULL DEFAULT '[]'::jsonb,
    decision_trace JSONB NOT NULL DEFAULT '{}'::jsonb,
    suggestion_count INTEGER NOT NULL DEFAULT 0,
    top_suggestion TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_agent_decision_logs_created_at
    ON public.agent_decision_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_agent_decision_logs_status
    ON public.agent_decision_logs(status);

CREATE INDEX IF NOT EXISTS idx_agent_decision_logs_effective_category
    ON public.agent_decision_logs(effective_category);

CREATE INDEX IF NOT EXISTS idx_agent_decision_logs_primary_aspect
    ON public.agent_decision_logs(primary_aspect);

ALTER TABLE public.agent_decision_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service insert decision logs" ON public.agent_decision_logs;
CREATE POLICY "Service insert decision logs"
ON public.agent_decision_logs
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service read decision logs" ON public.agent_decision_logs;
CREATE POLICY "Service read decision logs"
ON public.agent_decision_logs
FOR SELECT
USING (auth.role() = 'service_role');
