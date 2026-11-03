import { Project } from '../types';
import { DEMO_PROJECT } from '../demoData';

const STORAGE_KEY = 'strateg_projects_v1';
const ACTIVE_PROJECT_KEY = 'strateg_active_project_id_v1';

export function getStoredProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Initialize with demo project so new users immediately have a working benchmark
      saveProjects([DEMO_PROJECT]);
      return [DEMO_PROJECT];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return [DEMO_PROJECT];
  } catch (e) {
    console.error('Failed to parse stored projects:', e);
    return [DEMO_PROJECT];
  }
}

export function saveProjects(projects: Project[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (e) {
    console.error('Failed to save projects to localStorage:', e);
  }
}

export function getActiveProjectId(): string {
  try {
    const stored = localStorage.getItem(ACTIVE_PROJECT_KEY);
    if (stored) return stored;
  } catch (e) {
    // fallback
  }
  return DEMO_PROJECT.id;
}

export function setActiveProjectId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_PROJECT_KEY, id);
  } catch (e) {
    console.error('Failed to set active project id:', e);
  }
}

export function exportProjectsJson(projects: Project[]): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(projects, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `strateg_projects_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function exportSingleProjectMarkdown(project: Project): string {
  return `# СТРАТЕГИЧЕСКИЙ ОТЧЁТ: ДИАГНОСТИКА И ОБОСНОВАНИЕ РЕШЕНИЙ
**Компания:** ${project.companyName || 'Не указана'}
**Предприниматель:** ${project.clientName || 'Не указан'}
**Отрасль:** ${project.industry || 'Не указана'} | **Масштаб:** ${project.scale || 'Не указан'}
**Дата формирования:** ${new Date().toLocaleDateString('ru-RU')}

---

## 1. Проблема и желаемый результат
* **Формулировка проблемы со слов клиента:**
  ${project.initialProblem || 'Не зафиксирована'}
* **Желаемый измеримый результат:**
  ${project.desiredOutcome || 'Не зафиксирован'}

---

## 2. Подтверждённые факты vs Предположения
### Подтверждённые факты:
${project.establishedFacts.length ? project.establishedFacts.map(f => `- [ФАКТ] ${f}`).join('\n') : '- Факты ещё не зафиксированы'}

### Непроверенные предположения:
${project.assumptions.length ? project.assumptions.map(a => `- [ДОПУЩЕНИЕ] ${a}`).join('\n') : '- Допущения не зафиксированы'}

### Недостающие данные (белые пятна):
${project.missingData.length ? project.missingData.map(m => `- [НЕИЗВЕСТНО] ${m}`).join('\n') : '- Недостающие данные не отмечены'}

---

## 3. Логическая цепочка рассуждений
${project.logicalChain.map((node, i) => `### ${i + 1}. [${node.status.toUpperCase()}] ${node.title}
* **Формулировка:** ${node.content}
* **Основания / Фактура:** ${node.evidence || 'Требуется обоснование'}
* **Недостающие данные:** ${node.missingData || 'Нет'}
* **Возможные возражения:** ${node.counterArguments || 'Нет'}
`).join('\n')}

---

## 4. Оценка и приоритизация проблемы
${project.prioritization ? `
* **Масштаб последствий:** ${project.prioritization.scaleNegativeConsequences.score}/10 — ${project.prioritization.scaleNegativeConsequences.justification}
* **Влияние на цели:** ${project.prioritization.impactOnGoals.score}/10 — ${project.prioritization.impactOnGoals.justification}
* **Срочность:** ${project.prioritization.urgency.score}/10 — ${project.prioritization.urgency.justification}
* **Потенциальный эффект:** ${project.prioritization.potentialEffect.score}/10 — ${project.prioritization.potentialEffect.justification}
* **Необходимые ресурсы:** ${project.prioritization.requiredResources.score}/10 — ${project.prioritization.requiredResources.justification}
* **Стоимость бездействия:** ${project.prioritization.costOfInaction.score}/10 — ${project.prioritization.costOfInaction.justification}
* **Степень уверенности в данных:** ${project.prioritization.dataConfidence.score}/10 — ${project.prioritization.dataConfidence.justification}

**Итоговый приоритет:** ${project.prioritization.totalPriorityScore}/10
**Заключение:** ${project.prioritization.totalPrioritySummary}
**Учёт неопределённости:** ${project.prioritization.uncertaintyNotes}
` : 'Приоритизация не рассчитана.'}

---

## 5. Варианты решений
${project.solutions.map((sol, idx) => `### Вариант ${idx + 1}: ${sol.name} ${sol.isRecommended ? '★ [РЕКОМЕНДОВАНО]' : ''}
* **Механизм воздействия:** ${sol.impactMechanism}
* **Ожидаемый результат:** ${sol.expectedResult}
* **Ключевые действия:**
${sol.actions.map(a => `  - ${a}`).join('\n')}
* **Затраты и ресурсы:** ${sol.costsAndResources}
* **Риски и ограничения:** ${sol.risks} (Ограничения: ${sol.constraints})
* **Метрики (KPIs):** ${sol.kpis}
* **Способ проверки:** ${sol.verificationMethod}
${sol.recommendationReason ? `* **Обоснование выбора:** ${sol.recommendationReason}` : ''}
`).join('\n')}

---

## 6. План экспериментальной проверки выбранного решения
${project.validationPlan ? `
* **Ожидаемый результат эксперимента:** ${project.validationPlan.expectedResult}
* **Показатели ДО внедрения (базовые замеры):** ${project.validationPlan.baselineMetrics}
* **Что конкретно меняем (изолированное воздействие):** ${project.validationPlan.exactChange}
* **Срок пилотирования:** ${project.validationPlan.duration}
* **Показатели ПОСЛЕ:** ${project.validationPlan.postMetrics}
* **Учёт сопутствующих факторов (сезонность, рынок):** ${project.validationPlan.confoundingFactors}
* **Критерии решения (GO / NO-GO):** ${project.validationPlan.decisionCriteria}
` : 'План проверки ещё не сформирован.'}

---
*Документ сформирован в приложении «СТРАТЕГ» — доказательная диагностика бизнеса.*
`;
}
