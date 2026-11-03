import React, { useState } from 'react';
import { Project, ProblemPrioritization, MetricRating } from '../types';
import { calculatePrioritization } from '../services/api';
import { 
  SlidersHorizontal, 
  Sparkles, 
  ShieldAlert, 
  TrendingUp, 
  Clock, 
  Coins, 
  AlertOctagon, 
  Gauge, 
  RefreshCw, 
  ArrowRight,
  Info
} from 'lucide-react';

interface PrioritizationViewProps {
  project: Project;
  onUpdateProject: (updated: Project) => void;
  onNavigateToStage: (stage: string) => void;
}

export const PrioritizationView: React.FC<PrioritizationViewProps> = ({
  project,
  onUpdateProject,
  onNavigateToStage
}) => {
  const [isCalculating, setIsCalculating] = useState(false);

  // Fallback default if not yet calculated
  const prio: ProblemPrioritization = project.prioritization || {
    scaleNegativeConsequences: { score: 7, justification: 'Требуется расчёт оснований' },
    impactOnGoals: { score: 7, justification: 'Требуется расчёт оснований' },
    urgency: { score: 6, justification: 'Требуется расчёт оснований' },
    potentialEffect: { score: 8, justification: 'Требуется расчёт оснований' },
    requiredResources: { score: 5, justification: 'Требуется расчёт оснований' },
    costOfInaction: { score: 8, justification: 'Требуется расчёт оснований' },
    dataConfidence: { score: 6, justification: 'Требуется расчёт оснований' },
    totalPriorityScore: 7.2,
    totalPrioritySummary: 'Оценка ещё не рассчитана аналитическим модулем. Нажмите «Рассчитать приоритизацию с помощью ИИ».',
    uncertaintyNotes: 'Степень неопределённости не оценена.'
  };

  const handleCalculate = async () => {
    setIsCalculating(true);
    try {
      const result = await calculatePrioritization(project);
      onUpdateProject({
        ...project,
        prioritization: result,
        updatedAt: new Date().toISOString()
      });
    } catch (err: any) {
      alert('Ошибка при расчёте приоритетов: ' + (err.message || 'Сбой связи'));
    } finally {
      setIsCalculating(false);
    }
  };

  const updateMetric = (key: keyof ProblemPrioritization, score: number, justification: string) => {
    const updated = {
      ...prio,
      [key]: { score, justification }
    };
    onUpdateProject({
      ...project,
      prioritization: updated,
      updatedAt: new Date().toISOString()
    });
  };

  const criteriaList: Array<{
    key: keyof ProblemPrioritization;
    title: string;
    icon: any;
    description: string;
    lowLabel: string;
    highLabel: string;
  }> = [
    {
      key: 'scaleNegativeConsequences',
      title: '1. Масштаб негативных последствий',
      icon: AlertOctagon,
      description: 'Насколько сильный ущерб наносит проблема операционной деятельности и финансам.',
      lowLabel: 'Локальные сбои',
      highLabel: 'Угроза выживанию бизнеса'
    },
    {
      key: 'impactOnGoals',
      title: '2. Влияние на цели предприятия',
      icon: TrendingUp,
      description: 'Степень блокировки ключевых стратегических ориентиров и планов развития.',
      lowLabel: 'Слабое влияние',
      highLabel: 'Полностью блокирует стратегию'
    },
    {
      key: 'urgency',
      title: '3. Срочность решения',
      icon: Clock,
      description: 'Время, оставшееся до перехода ситуации в необратимую или критическую фазу.',
      lowLabel: 'Терпит несколько месяцев',
      highLabel: 'Требует действий немедленно'
    },
    {
      key: 'potentialEffect',
      title: '4. Потенциальный эффект от решения',
      icon: Sparkles,
      description: 'Какой прирост прибыли, маржинальности или устойчивости принесёт устранение проблемы.',
      lowLabel: 'Незначительный',
      highLabel: 'Прорывной финансовый эффект'
    },
    {
      key: 'requiredResources',
      title: '5. Необходимые ресурсы',
      icon: Coins,
      description: 'Затраты времени, капитала и команды (обратный фактор: чем меньше затрат, тем выгоднее).',
      lowLabel: 'Минимум ресурсов (1)',
      highLabel: 'Колоссальные инвестиции (10)'
    },
    {
      key: 'costOfInaction',
      title: '6. Стоимость бездействия',
      icon: ShieldAlert,
      description: 'Что потеряет компания через 3, 6 и 12 месяцев, если оставить всё как есть.',
      lowLabel: 'Потери стабильны',
      highLabel: 'Катастрофический рост убытков'
    },
    {
      key: 'dataConfidence',
      title: '7. Степень уверенности в исходных данных',
      icon: Gauge,
      description: 'Насколько цифры подтверждены реальными выписками и учётом vs догадки.',
      lowLabel: 'Одни предположения',
      highLabel: '100% подтверждено аудитом'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
            <SlidersHorizontal className="w-4 h-4" /> Доказательная приоритизация
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            Матрица оценки проблемы и стоимости бездействия
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Мы не сводим решение к произвольным баллам. Каждый показатель требует текстового обоснования и фиксации неопределённости.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCalculate}
            disabled={isCalculating}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all"
          >
            {isCalculating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{project.prioritization ? 'Пересчитать через ИИ' : 'Рассчитать приоритизацию (ИИ)'}</span>
          </button>
        </div>
      </div>

      {/* Summary Score Card */}
      {project.prioritization && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-700/80">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-amber-400">
                Сводный показатель обоснованного приоритета
              </span>
              <h2 className="text-xl font-bold text-white mt-0.5">
                Индекс критичности проблемы: {prio.totalPriorityScore} / 10
              </h2>
            </div>
            <button
              onClick={() => onNavigateToStage('solutions')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors self-start sm:self-auto"
            >
              <span>К вариантам решений</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <strong className="text-xs font-semibold text-slate-300 block mb-1">
                Обоснование общего приоритета:
              </strong>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                {prio.totalPrioritySummary}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/40">
              <strong className="text-xs font-semibold text-amber-300 flex items-center gap-1.5 mb-1">
                <Info className="w-4 h-4 text-amber-400" /> Учёт неопределённости и слепых зон:
              </strong>
              <p className="text-xs text-amber-200/90 leading-relaxed">
                {prio.uncertaintyNotes}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Criteria Breakdown Cards */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-200">
          Детализация по 7 критериям с обоснованием:
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {criteriaList.map((crit) => {
            const Icon = crit.icon;
            const metricData = (prio[crit.key] as MetricRating) || { score: 5, justification: '' };

            return (
              <div
                key={crit.key}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm sm:text-base">{crit.title}</h4>
                      <p className="text-xs text-slate-400">{crit.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">Балл:</span>
                    <span className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center font-extrabold text-sm">
                      {metricData.score}
                    </span>
                  </div>
                </div>

                {/* Slider */}
                <div className="space-y-1">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={metricData.score}
                    onChange={(e) => updateMetric(crit.key, parseInt(e.target.value), metricData.justification)}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>1 — {crit.lowLabel}</span>
                    <span>10 — {crit.highLabel}</span>
                  </div>
                </div>

                {/* Justification Text Area */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Основания и аргументация оценки (почему именно такой балл):
                  </label>
                  <textarea
                    rows={2}
                    value={metricData.justification}
                    onChange={(e) => updateMetric(crit.key, metricData.score, e.target.value)}
                    placeholder="Приведите факты, цифры или логические основания..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
