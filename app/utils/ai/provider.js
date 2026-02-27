const OPENAI_URL = (process.env.OPENAI_API_BASE_URL || 'https://api.openai.com/v1/chat/completions').trim();
const REQUEST_TIMEOUT_MS = Number.parseInt(process.env.AI_REQUEST_TIMEOUT_MS || '15000', 10);

const getProvider = () => (process.env.AI_PROVIDER || 'openai').toLowerCase();
const canUseOpenAI = () => Boolean(process.env.OPENAI_API_KEY);
const canUseCustom = () => Boolean(process.env.CUSTOM_LLM_API_URL);

function toJsonSafely(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function createTimeoutController(timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort('timeout'), Number.isFinite(timeoutMs) ? timeoutMs : 15000);
  return {
    signal: controller.signal,
    clear: () => clearTimeout(timer),
  };
}

function normalizeProviderError(error) {
  const msg = String(error?.message || error || 'UNKNOWN_PROVIDER_ERROR');
  if (msg.includes('timeout') || msg.includes('aborted')) return 'AI_REQUEST_TIMEOUT';
  if (msg.includes('OPENAI_API_KEY_MISSING')) return 'OPENAI_API_KEY_MISSING';
  if (msg.includes('CUSTOM_PROVIDER_NOT_CONFIGURED')) return 'CUSTOM_PROVIDER_NOT_CONFIGURED';
  return 'AI_PROVIDER_ERROR';
}

async function callOpenAI({ messages, temperature = 0.7, jsonMode = false }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY_MISSING');
  }

  const timeout = createTimeoutController();
  let response;
  try {
    response = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages,
        stream: false,
        temperature,
        response_format: jsonMode ? { type: 'json_object' } : undefined,
      }),
      signal: timeout.signal,
    });
  } finally {
    timeout.clear();
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OPENAI_ERROR_${response.status}:${errorText}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content || '';
}

async function callCustomProvider({ messages, temperature = 0.7, jsonMode = false }) {
  const apiUrl = process.env.CUSTOM_LLM_API_URL;
  if (!apiUrl) {
    throw new Error('CUSTOM_LLM_API_URL_MISSING');
  }

  const apiKey = process.env.CUSTOM_LLM_API_KEY;
  const headers = {
    'Content-Type': 'application/json',
  };

  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  const timeout = createTimeoutController();
  let response;
  try {
    response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: process.env.CUSTOM_LLM_MODEL || process.env.OPENAI_MODEL || 'custom-default',
        messages,
        temperature,
        stream: false,
        response_format: jsonMode ? { type: 'json_object' } : undefined,
      }),
      signal: timeout.signal,
    });
  } finally {
    timeout.clear();
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`CUSTOM_LLM_ERROR_${response.status}:${errorText}`);
  }

  const data = await response.json();

  if (typeof data?.result === 'string') return data.result;
  if (typeof data?.text === 'string') return data.text;
  if (typeof data?.output_text === 'string') return data.output_text;
  if (typeof data?.content === 'string') return data.content;
  if (Array.isArray(data?.choices) && data.choices[0]?.message?.content) {
    return data.choices[0].message.content;
  }

  const serialized = JSON.stringify(data);
  return serialized === '{}' ? '' : serialized;
}

export async function generateAssistantText(options) {
  const requestedProvider = getProvider();

  // MVP-safe behavior: if custom is requested but not configured, fallback to OpenAI.
  if (requestedProvider === 'custom') {
    if (canUseCustom()) {
      try {
        return await callCustomProvider(options);
      } catch (customError) {
        if (canUseOpenAI()) {
          try {
            return await callOpenAI(options);
          } catch (openAiError) {
            throw new Error(normalizeProviderError(openAiError));
          }
        }
        throw new Error(normalizeProviderError(customError));
      }
    }

    if (canUseOpenAI()) {
      try {
        return await callOpenAI(options);
      } catch (openAiError) {
        throw new Error(normalizeProviderError(openAiError));
      }
    }

    throw new Error('CUSTOM_PROVIDER_NOT_CONFIGURED');
  }

  if (!canUseOpenAI()) {
    throw new Error('OPENAI_API_KEY_MISSING');
  }

  try {
    return await callOpenAI(options);
  } catch (openAiError) {
    throw new Error(normalizeProviderError(openAiError));
  }
}

export function parseMaybeJson(text) {
  return toJsonSafely(text);
}
