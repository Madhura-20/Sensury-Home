import { auth } from './firebase';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await auth.currentUser?.getIdToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function sendAiChatMessage(params: {
  message: string;
  history: Array<{ role: 'user' | 'model'; text: string }>;
  language: 'en' | 'ta' | 'bilingual';
  projectContext: Record<string, unknown> | null;
}): Promise<string> {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/ai/chat', {
    method: 'POST',
    headers,
    body: JSON.stringify(params),
  });
  const data = (await res.json()) as { reply?: string; error?: string };
  if (!res.ok) {
    throw new Error(data.error || 'Unable to reach AI assistant.');
  }
  return data.reply || '';
}

export async function generateAiPlanSummary(
  project: Record<string, unknown>
): Promise<string> {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/ai/plan-summary', {
    method: 'POST',
    headers,
    body: JSON.stringify({ project }),
  });
  const data = (await res.json()) as { summary?: string; error?: string };
  if (!res.ok) {
    throw new Error(data.error || 'Unable to generate planning summary.');
  }
  return data.summary || '';
}

export async function explainMaterialWithAi(params: {
  materialName: string;
  category: string;
  question?: string;
  language: 'en' | 'ta' | 'bilingual';
}): Promise<string> {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/ai/explain-material', {
    method: 'POST',
    headers,
    body: JSON.stringify(params),
  });
  const data = (await res.json()) as { explanation?: string; error?: string };
  if (!res.ok) {
    throw new Error(data.error || 'Unable to generate explanation.');
  }
  return data.explanation || '';
}
