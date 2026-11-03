import React, { useState } from 'react';
import { Project, SolutionOption } from '../types';
import { generateSolutions } from '../services/api';
import { 
  Lightbulb, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Coins, 
  ShieldAlert, 
  FlaskConical, 
  RefreshCw, 
  ArrowRight, 
  Star, 
  Plus, 
  Trash2, 
  Edit3,
  X,
  Target
} from 'lucide-react';

interface SolutionsViewProps {
  project: Project;
  onUpdateProject: (updated: Project) => void;
  onNavigateToStage: (stage: string) => void;
}

export const SolutionsView: React.FC<SolutionsViewProps> = ({
  project,
  onUpdateProject,
  onNavigateToStage
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingSolution, setEditingSolution] = useState<SolutionOption | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const generated = await generateSolutions(project);
      const recommended = generated.find(s => s.isRecommended) || generated[0];
      onUpdateProject({
        ...project,
        solutions: generated,
        selectedSolutionId: recommended?.id,
        updatedAt: new Date().toISOString()
      });
    } catch (err: any) {
      alert('Ошибка при генерации решений: ' + (err.message || 'Сбой'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectSolution = (id: string) => {
    onUpdateProject({
      ...project,
      selectedSolutionId: id,
      updatedAt: new Date().toISOString()
    });
  };

  const handleSaveSolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSolution) return;

    let updated = project.solutions.map(s => s.id === editingSolution.id ? editingSolution : s);
    if (!project.solutions.some(s => s.id === editingSolution.id)) {
      updated = [...project.solutions, editingSolution];
    }
    onUpdateProject({
      ...project,
      solutions: updated,
      updatedAt: new Date().toISOString()
    });
    setEditingSolution(null);
  };

  const handleDeleteSolution = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Удалить этот вариант решения?')) {
      const remaining = project.solutions.filter(s => s.id !== id);
      const newSelected = project.selectedSolutionId === id ? remaining[0]?.id : project.selectedSolutionId;
      onUpdateProject({
        ...project,
        solutions: remaining,
        selectedSolutionId: newSelected,
        updatedAt: new Date().toISOString()
      });
    }
  };

  const handleAddNewSolution = () => {
    const newSol: SolutionOption = {
      id: 'sol-' + Date.now(),
      name: 'Новый вариант решения',
      impactMechanism: 'Через какую причинно-следственную цепочку это воздействует на проблему?',
      expectedResult: 'Обоснованный измеримый эффект...',
      actions: ['Действие 1', 'Действие 2'],
      costsAndResources: 'Оценка времени и бюджета...',
      risks: 'Потенциальные побочные эффекты...',
      constraints: 'Внутренние и внешние ограничения...',
      kpis: 'Ключевые метрики контроля...',
      verificationMethod: 'Как протестировать на малом масштабе?',
      isRecommended: false
    };
    setEditingSolution(newSol);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
            <Lightbulb className="w-4 h-4" /> Доказательные альтернативы
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            Варианты решений и механизмы воздействия
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Мы не обещаем результатов, которые нельзя обосновать. Каждое решение оценивается по затратам, рискам, ограничениям и способу предварительной проверки.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all"
          >
            {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{project.solutions.length > 0 ? 'Перегенерировать (ИИ)' : 'Сгенерировать варианты (ИИ)'}</span>
          </button>

          <button
            onClick={handleAddNewSolution}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Добавить своё решение</span>
          </button>
        </div>
      </div>

      {/* Solutions Cards */}
      {project.solutions.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-4">
          <Lightbulb className="w-12 h-12 text-slate-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="font-bold text-slate-300">Варианты решений ещё не сформированы</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Нажмите кнопку выше, чтобы ИИ-стратег разработал альтернативные варианты на основе логической цепочки и первопричины.
            </p>
          </div>
          <button
            onClick={handleGenerate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
          >
            <Sparkles className="w-4 h-4" /> Сгенерировать обоснованные решения
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {project.solutions.map((sol, index) => {
              const isSelected = project.selectedSolutionId === sol.id;

              return (
                <div
                  key={sol.id}
                  className={`bg-slate-900 border rounded-2xl p-6 shadow-xl transition-all relative ${
                    isSelected
                      ? 'border-amber-500/80 shadow-amber-500/5 ring-1 ring-amber-500/40'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center font-bold text-xs">
                        #{index + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-white text-base sm:text-lg">
                            {sol.name}
                          </h3>
                          {sol.isRecommended && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> Рекомендуемый выбор
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSelectSolution(sol.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 shadow-sm'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isSelected ? 'Выбрано для пилота' : 'Выбрать это решение'}</span>
                      </button>

                      <button
                        onClick={() => setEditingSolution(sol)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                        title="Редактировать"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => handleDeleteSolution(sol.id, e)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                        title="Удалить"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Recommendation justification if present */}
                  {sol.recommendationReason && (
                    <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                      <strong className="text-amber-400 font-semibold block mb-0.5">Обоснование рекомендации:</strong>
                      {sol.recommendationReason}
                    </div>
                  )}

                  {/* Core Mechanism and Result */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 border-b border-slate-800/80 text-xs sm:text-sm">
                    <div className="space-y-1">
                      <span className="font-bold text-slate-400 flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-cyan-400" /> Предполагаемый механизм воздействия:
                      </span>
                      <p className="text-slate-200 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                        {sol.impactMechanism}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="font-bold text-slate-400 flex items-center gap-1.5">
                        <Target className="w-4 h-4 text-emerald-400" /> Ожидаемый обоснованный результат:
                      </span>
                      <p className="text-slate-200 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                        {sol.expectedResult}
                      </p>
                    </div>
                  </div>

                  {/* Multi-parameter evaluation matrix */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 py-4 text-xs">
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <span className="font-bold text-slate-400 flex items-center gap-1 mb-1">
                        <Coins className="w-3.5 h-3.5 text-amber-400" /> Затраты и ресурсы:
                      </span>
                      <p className="text-slate-300">{sol.costsAndResources}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <span className="font-bold text-slate-400 flex items-center gap-1 mb-1">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Риски и побочные эффекты:
                      </span>
                      <p className="text-slate-300">{sol.risks}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <span className="font-bold text-slate-400 flex items-center gap-1 mb-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-purple-400" /> Ограничения:
                      </span>
                      <p className="text-slate-300">{sol.constraints}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <span className="font-bold text-slate-400 flex items-center gap-1 mb-1">
                        <FlaskConical className="w-3.5 h-3.5 text-cyan-400" /> Способ проверки:
                      </span>
                      <p className="text-slate-300">{sol.verificationMethod}</p>
                    </div>
                  </div>

                  {/* Action Steps */}
                  <div className="pt-2 text-xs">
                    <span className="font-bold text-slate-400 block mb-2">Необходимые действия для внедрения:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {sol.actions.map((act, i) => (
                        <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-slate-950/40 border border-slate-800 text-slate-300">
                          <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span>{act}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action button to proceed */}
          <div className="flex justify-end pt-4">
            <button
              onClick={() => onNavigateToStage('validation')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all"
            >
              <span>Перейти к разработке плана проверки выбранного решения</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Edit Solution Modal */}
      {editingSolution && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Редактирование варианта решения</h3>
              <button onClick={() => setEditingSolution(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSolution} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Название решения</label>
                <input
                  type="text"
                  required
                  value={editingSolution.name}
                  onChange={(e) => setEditingSolution({ ...editingSolution, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Предполагаемый механизм воздействия</label>
                <textarea
                  rows={2}
                  required
                  value={editingSolution.impactMechanism}
                  onChange={(e) => setEditingSolution({ ...editingSolution, impactMechanism: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Ожидаемый результат</label>
                <textarea
                  rows={2}
                  required
                  value={editingSolution.expectedResult}
                  onChange={(e) => setEditingSolution({ ...editingSolution, expectedResult: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Затраты и ресурсы</label>
                  <input
                    type="text"
                    value={editingSolution.costsAndResources}
                    onChange={(e) => setEditingSolution({ ...editingSolution, costsAndResources: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Риски</label>
                  <input
                    type="text"
                    value={editingSolution.risks}
                    onChange={(e) => setEditingSolution({ ...editingSolution, risks: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Ограничения</label>
                  <input
                    type="text"
                    value={editingSolution.constraints}
                    onChange={(e) => setEditingSolution({ ...editingSolution, constraints: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Способ проверки</label>
                  <input
                    type="text"
                    value={editingSolution.verificationMethod}
                    onChange={(e) => setEditingSolution({ ...editingSolution, verificationMethod: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="recCheck"
                  checked={editingSolution.isRecommended}
                  onChange={(e) => setEditingSolution({ ...editingSolution, isRecommended: e.target.checked })}
                  className="accent-amber-500 w-4 h-4"
                />
                <label htmlFor="recCheck" className="text-xs font-semibold text-slate-300 cursor-pointer">
                  Отметить как рекомендуемое решение
                </label>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingSolution(null)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
