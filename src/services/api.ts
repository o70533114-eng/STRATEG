import { Project, LogicalChainItem, ProblemPrioritization, SolutionOption, ValidationPlan } from '../types';

export interface ChatResponse {
  content: string;
  structuredMeta?: {
    summaryOfLastAnswer?: string;
    establishedFacts?: string[];
    missingData?: string[];
    assumptions?: string[];
    logicalCritique?: string;
    nextQuestion?: string;
  };
}

export async function sendChatMessage(messages: any[], projectContext: Partial<Project>): Promise<ChatResponse> {
  const res = await fetch('/api/strategist/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, projectContext }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Сетевая ошибка' }));
    throw new Error(err.error || 'Ошибка запроса к серверу');
  }
  return res.json();
}

export async function generateLogicalChain(projectContext: Project): Promise<LogicalChainItem[]> {
  const res = await fetch('/api/strategist/build-chain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectContext }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Сетевая ошибка' }));
    throw new Error(err.error || 'Не удалось сформировать логическую цепочку');
  }
  const data = await res.json();
  return data.chain;
}

export async function calculatePrioritization(projectContext: Project): Promise<ProblemPrioritization> {
  const res = await fetch('/api/strategist/prioritize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectContext }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Сетевая ошибка' }));
    throw new Error(err.error || 'Не удалось рассчитать приоритеты');
  }
  const data = await res.json();
  return data.prioritization;
}

export async function generateSolutions(projectContext: Project): Promise<SolutionOption[]> {
  const res = await fetch('/api/strategist/generate-solutions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectContext }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Сетевая ошибка' }));
    throw new Error(err.error || 'Не удалось сгенерировать варианты решений');
  }
  const data = await res.json();
  return data.solutions;
}

export async function generateValidationPlan(projectContext: Project, solution: SolutionOption): Promise<ValidationPlan> {
  const res = await fetch('/api/strategist/generate-validation-plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectContext, solution }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Сетевая ошибка' }));
    throw new Error(err.error || 'Не удалось сгенерировать план проверки');
  }
  const data = await res.json();
  return data.validationPlan;
}

export async function auditLogicalChain(chain: LogicalChainItem[]): Promise<{
  auditScore: number;
  auditSummary: string;
  issues: Array<{ nodeId: string; severity: string; issue: string; recommendation: string }>;
}> {
  const res = await fetch('/api/strategist/audit-chain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chain }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Сетевая ошибка' }));
    throw new Error(err.error || 'Не удалось провести аудит логики');
  }
  return res.json();
}
