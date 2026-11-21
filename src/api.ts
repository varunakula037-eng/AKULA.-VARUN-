import type {
  AnalyticsData,
  DashboardData,
  InterviewConfig,
  InterviewQuestion,
  InterviewSession,
} from './types.ts';

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });

  const data = (await res.json().catch(() => ({}))) as { error?: string } & T;
  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data;
}

export function fetchDashboard(): Promise<DashboardData> {
  return requestJson<DashboardData>('/api/dashboard');
}

export function fetchAnalytics(): Promise<AnalyticsData> {
  return requestJson<AnalyticsData>('/api/analytics');
}

export async function fetchInterviews(params?: {
  search?: string;
  status?: string;
  type?: string;
}): Promise<InterviewSession[]> {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.status && params.status !== 'all') query.set('status', params.status);
  if (params?.type && params.type !== 'all') query.set('type', params.type);
  const qs = query.toString();
  const res = await requestJson<{ interviews: InterviewSession[] }>(
    `/api/interviews${qs ? `?${qs}` : ''}`
  );
  return res.interviews;
}

export async function createInterview(config: InterviewConfig): Promise<InterviewSession> {
  const res = await requestJson<{ interview: InterviewSession }>('/api/interviews', {
    method: 'POST',
    body: JSON.stringify(config),
  });
  return res.interview;
}

export async function fetchInterviewById(id: string): Promise<InterviewSession> {
  const res = await requestJson<{ interview: InterviewSession }>(`/api/interviews/${encodeURIComponent(id)}`);
  return res.interview;
}

export async function saveDraft(
  interviewId: string,
  questionId: number,
  answer: string
): Promise<void> {
  await requestJson<{ ok: boolean }>(`/api/interviews/${encodeURIComponent(interviewId)}/draft`, {
    method: 'PATCH',
    body: JSON.stringify({ questionId, answer }),
  });
}

export async function evaluateQuestionAnswer(
  interviewId: string,
  questionId: number,
  answer: string
): Promise<InterviewQuestion> {
  const res = await requestJson<{ question: InterviewQuestion }>(
    `/api/interviews/${encodeURIComponent(interviewId)}/questions/${questionId}/evaluate`,
    {
      method: 'POST',
      body: JSON.stringify({ answer }),
    }
  );
  return res.question;
}

export async function completeInterview(interviewId: string): Promise<InterviewSession> {
  const res = await requestJson<{ interview: InterviewSession }>(
    `/api/interviews/${encodeURIComponent(interviewId)}/complete`,
    {
      method: 'POST',
    }
  );
  return res.interview;
}

export async function deleteInterview(interviewId: string): Promise<void> {
  await requestJson<{ ok: boolean }>(`/api/interviews/${encodeURIComponent(interviewId)}`, {
    method: 'DELETE',
  });
}

export function getPdfDownloadUrl(interviewId: string): string {
  return `/api/interviews/${encodeURIComponent(interviewId)}/pdf`;
}
