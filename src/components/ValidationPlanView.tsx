import React, { useState } from 'react';
import { Project, ValidationPlan } from '../types';
import { generateValidationPlan } from '../services/api';
import { 
  FlaskConical, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Gauge, 
  AlertTriangle, 
  RefreshCw, 
  ArrowRight, 
  Target, 
  SlidersHorizontal,
  FileText
} from 'lucide-react';

interface ValidationPlanViewProps {
  project: Project;
  onUpdateProject: (updated: Project) => void;
  onNavigateToStage: (stage: string) => void;
}

export const ValidationPlanView: React.FC<ValidationPlanViewProps> = ({
  project,
  onUpdateProject,
  onNavigateToStage
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const selectedSolution = project.solutions.find(s => s.id === project.selectedSolutionId) || project.solutions[0];

  const plan: ValidationPlan = project.validationPlan || {
    expectedResult: selectedSolution?.expectedResult || 'Ожидаемый результат пилота...',
    baselineMetrics: 'Зафиксируйте исходные значения показателей ДО внедрения...',
    exactChange: 'Какую изолированную переменную изменяем в ходе эксперимента...',
    duration: '30-45 календарных дней',
    postMetrics: 'Метрики ПОСЛЕ пилотного периода...',
    confoundingFactors: 'Как изолируем влияние сезонности, действий конкурентов или макро-факторов...',
    decisionCriteria: 'Порог GO (при каких цифрах масштабируем) и NO-GO (при каких сворачиваем)...'
  };

  const handleGenerate = async () => {
    if (!selectedSolution) {
      alert('Сначала выберите или создайте вариант решения во вкладке «Варианты решений».');
      return;
    }
    setIsGenerating(true);
    try {
      const generated = await generateValidationPlan(project, selectedSolution);
      onUpdateProject({
        ...project,
        validationPlan: generated,
        updatedAt: new Date().toISOString()
      });
    } catch (err: any) {
      alert('Ошибка при генерации плана проверки: ' + (err.message || 'Сбой'));
    } finally {
      setIsGenerating(false);
    }
  };

  const updateField = (key: keyof ValidationPlan, value: string) => {
    const updated = {
      ...plan,
      [key]: value
    };
    onUpdateProject({
      ...project,
      validationPlan: updated,
      updatedAt: new Date().toISOString()
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
            <FlaskConical className="w-4 h-4" /> Доказательный менеджмент
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            План экспериментальной проверки решения
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Прежде чем тратить ресурсы на масштабное внедрение, решение тестируется на ограниченном контуре с чёткими критериями Go / No-Go.
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !selectedSolution}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all self-start md:self-auto"
        >
          {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>{project.validationPlan ? 'Пересчитать план (ИИ)' : 'Сформировать план проверки (ИИ)'}</span>
        </button>
      </div>

      {/* Selected Target Solution Pill */}
      {selectedSolution ? (
        <div className="p-4 rounded-xl bg-slate-900 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs text-amber-400 font-semibold block">Тестируемое решение:</span>
            <h3 className="font-bold text-white text-base">{selectedSolution.name}</h3>
            <p className="text-xs text-slate-300 mt-0.5 line-clamp-1">{selectedSolution.impactMechanism}</p>
          </div>
          <button
            onClick={() => onNavigateToStage('solutions')}
            className="text-xs text-slate-400 hover:text-amber-300 transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            Сменить решение →
          </button>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-800/40 text-rose-300 text-xs">
          Внимание: сначала перейдите в раздел «Варианты решений» и выберите решение для проверки.
        </div>
      )}

      {/* 7-Step Verification Plan Form */}
      <div className="space-y-4">
        {/* Step 1: Expected Result */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs">
              1
            </div>
            <label className="font-bold text-white text-sm">Какой результат ожидаем в ходе пилота?</label>
          </div>
          <textarea
            rows={2}
            value={plan.expectedResult}
            onChange={(e) => updateField('expectedResult', e.target.value)}
            placeholder="Конкретный ожидаемый сдвиг метрик..."
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-500 resize-none"
          />
        </div>

        {/* Step 2: Baseline Metrics */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-xs">
              2
            </div>
            <label className="font-bold text-white text-sm">Какие показатели измеряем ДО внедрения (базовые замеры)?</label>
          </div>
          <textarea
            rows={2}
            value={plan.baselineMetrics}
            onChange={(e) => updateField('baselineMetrics', e.target.value)}
            placeholder="Точные стартовые значения: срок дебиторки, конверсия, себестоимость..."
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-500 resize-none"
          />
        </div>

        {/* Step 3: Exact Change */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-xs">
              3
            </div>
            <label className="font-bold text-white text-sm">Что конкретно меняем (изолированная переменная эксперимента)?</label>
          </div>
          <textarea
            rows={2}
            value={plan.exactChange}
            onChange={(e) => updateField('exactChange', e.target.value)}
            placeholder="Изолированное воздействие: например, только на 1 клиенте или в 1 филиале..."
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-500 resize-none"
          />
        </div>

        {/* Step 4: Duration */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
              4
            </div>
            <label className="font-bold text-white text-sm">За какой точный период проверяем (срок пилота)?</label>
          </div>
          <input
            type="text"
            value={plan.duration}
            onChange={(e) => updateField('duration', e.target.value)}
            placeholder="Например: 45 календарных дней с 1 ноября по 15 декабря"
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Step 5: Post Metrics */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs">
              5
            </div>
            <label className="font-bold text-white text-sm">Какие показатели измеряем ПОСЛЕ тестового периода?</label>
          </div>
          <textarea
            rows={2}
            value={plan.postMetrics}
            onChange={(e) => updateField('postMetrics', e.target.value)}
            placeholder="Контрольные замеры и формат подведения итогов..."
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-500 resize-none"
          />
        </div>

        {/* Step 6: Confounding Factors */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold text-xs">
              6
            </div>
            <label className="font-bold text-white text-sm">Как учитываем другие возможные причины изменения (внешний шум, сезонность)?</label>
          </div>
          <textarea
            rows={2}
            value={plan.confoundingFactors}
            onChange={(e) => updateField('confoundingFactors', e.target.value)}
            placeholder="Сезонные колебания спроса, акции конкурентов, контрольная группа..."
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-500 resize-none"
          />
        </div>

        {/* Step 7: Decision Criteria (Go / No-Go) */}
        <div className="bg-slate-900/80 border border-amber-500/40 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/30">
              7
            </div>
            <label className="font-bold text-amber-300 text-sm">Критерии принятия решения о дальнейшем внедрении (GO / NO-GO пороги)</label>
          </div>
          <textarea
            rows={3}
            value={plan.decisionCriteria}
            onChange={(e) => updateField('decisionCriteria', e.target.value)}
            placeholder="GO: при каких значениях масштабируем на всю компанию; NO-GO: при каких останавливаемся и возвращаемся к цепочке..."
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-500 resize-none"
          />
        </div>
      </div>

      {/* Footer navigation */}
      <div className="flex justify-between items-center pt-4">
        <button
          onClick={() => onNavigateToStage('solutions')}
          className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-medium"
        >
          ← Назад к решениям
        </button>

        <button
          onClick={() => onNavigateToStage('report')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all"
        >
          <FileText className="w-4 h-4" />
          <span>Сформировать итоговый отчёт</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
