import React, { useState } from 'react';
import { Project, LogicalChainItem, NodeStatus, ChainNodeType } from '../types';
import { generateLogicalChain, auditLogicalChain } from '../services/api';
import { 
  Network, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  HelpCircle, 
  AlertTriangle, 
  Edit3, 
  Plus, 
  Trash2, 
  ArrowDown, 
  RefreshCw, 
  CheckCheck,
  TrendingUp,
  X,
  FileQuestion,
  Info
} from 'lucide-react';

interface LogicalChainViewProps {
  project: Project;
  onUpdateProject: (updated: Project) => void;
  onNavigateToStage: (stage: string) => void;
}

export const LogicalChainView: React.FC<LogicalChainViewProps> = ({
  project,
  onUpdateProject,
  onNavigateToStage
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<{
    auditScore: number;
    auditSummary: string;
    issues: Array<{ nodeId: string; severity: string; issue: string; recommendation: string }>;
  } | null>(null);

  const [editingNode, setEditingNode] = useState<LogicalChainItem | null>(null);

  const statusLabels: Record<NodeStatus, { label: string; color: string; border: string; bg: string }> = {
    fact: {
      label: 'Подтверждённый факт',
      color: 'text-emerald-300',
      border: 'border-emerald-500/40',
      bg: 'bg-emerald-950/20'
    },
    assumption: {
      label: 'Предположение',
      color: 'text-amber-300',
      border: 'border-amber-500/40',
      bg: 'bg-amber-950/20'
    },
    hypothesis: {
      label: 'Гипотеза',
      color: 'text-purple-300',
      border: 'border-purple-500/40',
      bg: 'bg-purple-950/20'
    },
    conclusion: {
      label: 'Обоснованный вывод',
      color: 'text-cyan-300',
      border: 'border-cyan-500/40',
      bg: 'bg-cyan-950/20'
    }
  };

  const nodeTypeLabels: Record<ChainNodeType, string> = {
    problem: '1. Проблема',
    fact: '2. Факты и обстоятельства',
    cause: '3. Возможная причина',
    cause_check: '4. Проверка причин',
    conclusion: '5. Промежуточный вывод',
    solution: '6. Вариант решения',
    validation: '7. Проверка результата'
  };

  const handleGenerateChain = async () => {
    setIsGenerating(true);
    setAuditResult(null);
    try {
      const chain = await generateLogicalChain(project);
      onUpdateProject({
        ...project,
        logicalChain: chain,
        updatedAt: new Date().toISOString()
      });
    } catch (err: any) {
      alert('Ошибка при генерации логической цепочки: ' + (err.message || 'Сбой связи'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAuditChain = async () => {
    if (project.logicalChain.length === 0) return;
    setIsAuditing(true);
    try {
      const result = await auditLogicalChain(project.logicalChain);
      setAuditResult(result);
    } catch (err: any) {
      alert('Ошибка при проведении аудита: ' + (err.message || 'Сбой'));
    } finally {
      setIsAuditing(false);
    }
  };

  const handleSaveNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNode) return;

    const updated = project.logicalChain.map(n => n.id === editingNode.id ? editingNode : n);
    onUpdateProject({
      ...project,
      logicalChain: updated,
      updatedAt: new Date().toISOString()
    });
    setEditingNode(null);
  };

  const handleAddNewNode = () => {
    const newNode: LogicalChainItem = {
      id: 'node-' + Date.now(),
      type: 'conclusion',
      title: 'Новый элемент рассуждения',
      content: 'Сформулируйте тезис...',
      evidence: 'Укажите основания (факты, расчёты, документы)...',
      status: 'hypothesis',
      parentId: project.logicalChain[project.logicalChain.length - 1]?.id || null,
      missingData: 'Какие данные ещё нужны?',
      counterArguments: 'Какие есть возражения?'
    };
    const updated = [...project.logicalChain, newNode];
    onUpdateProject({ ...project, logicalChain: updated });
    setEditingNode(newNode);
  };

  const handleDeleteNode = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Удалить этот блок из логической цепочки?')) {
      const updated = project.logicalChain.filter(n => n.id !== id);
      onUpdateProject({ ...project, logicalChain: updated });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Control Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
            <Network className="w-4 h-4" /> Доказательная цепочка рассуждений
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            Логическая схема: от проблемы к верификации
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Каждое утверждение должно иметь основания. Переход считается доказанным только при логической обоснованности.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleGenerateChain}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-xs shadow-md transition-all"
          >
            {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>Синтезировать цепочку (ИИ)</span>
          </button>

          <button
            onClick={handleAuditChain}
            disabled={isAuditing || project.logicalChain.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 border border-slate-700 font-semibold text-xs transition-all"
            title="Проверить логическую строгость на отсутствие логических ошибок (Non sequitur)"
          >
            {isAuditing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />}
            <span>Аудит логики</span>
          </button>

          <button
            onClick={handleAddNewNode}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Добавить блок</span>
          </button>
        </div>
      </div>

      {/* Audit Report Banner if ran */}
      {auditResult && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-3 shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white text-sm sm:text-base">Результаты независимого логического аудита</h3>
            </div>
            <div className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
              Логическая строгость: {auditResult.auditScore} / 10
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {auditResult.auditSummary}
          </p>

          {auditResult.issues && auditResult.issues.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-xs font-semibold text-rose-300">Выявленные уязвимости в рассуждениях:</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {auditResult.issues.map((iss, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-800/40 text-slate-300">
                    <strong className="text-rose-400 block mb-0.5">⚠️ {iss.issue}</strong>
                    <span className="text-slate-400">Рекомендация: {iss.recommendation}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Visual Flow Chart: Vertical Connected Graph */}
      {project.logicalChain.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-4">
          <FileQuestion className="w-12 h-12 text-slate-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="font-bold text-slate-300">Цепочка ещё не построена</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Завершите первичное интервью и нажмите кнопку «Синтезировать цепочку (ИИ)» или добавьте блоки вручную.
            </p>
          </div>
          <button
            onClick={handleGenerateChain}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
          >
            <Sparkles className="w-4 h-4" /> Построить на основе фактов интервью
          </button>
        </div>
      ) : (
        <div className="relative space-y-6">
          {project.logicalChain.map((node, index) => {
            const statusConfig = statusLabels[node.status] || statusLabels.hypothesis;
            const isLast = index === project.logicalChain.length - 1;

            return (
              <div key={node.id} className="relative flex flex-col items-center">
                {/* Node Box */}
                <div
                  onClick={() => setEditingNode(node)}
                  className={`w-full bg-slate-900 border rounded-2xl p-5 sm:p-6 shadow-xl transition-all cursor-pointer hover:border-amber-500/60 hover:shadow-amber-500/5 group ${statusConfig.border}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs border border-slate-700">
                        {index + 1}
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        {nodeTypeLabels[node.type] || node.type}
                      </span>
                      <h3 className="font-bold text-white text-base group-hover:text-amber-300 transition-colors">
                        {node.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                        {statusConfig.label}
                      </span>
                      <button
                        onClick={(e) => handleDeleteNode(node.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
                        title="Удалить блок"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="py-3 text-sm text-slate-200 leading-relaxed">
                    {node.content}
                  </div>

                  {/* Rigorous Evidence & Audit Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-800/80 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                      <span className="font-bold text-slate-400 flex items-center gap-1 mb-1">
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> Основания и фактура:
                      </span>
                      <p className="text-slate-300">{node.evidence || '—'}</p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                      <span className="font-bold text-slate-400 flex items-center gap-1 mb-1">
                        <HelpCircle className="w-3.5 h-3.5 text-amber-400" /> Недостающие данные:
                      </span>
                      <p className="text-slate-300">{node.missingData || '—'}</p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                      <span className="font-bold text-slate-400 flex items-center gap-1 mb-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Возможные возражения:
                      </span>
                      <p className="text-slate-300">{node.counterArguments || '—'}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex justify-end">
                    <span className="text-[11px] text-slate-500 group-hover:text-amber-400 transition-colors flex items-center gap-1">
                      <Edit3 className="w-3 h-3" /> Нажмите для редактирования
                    </span>
                  </div>
                </div>

                {/* Connecting Arrow */}
                {!isLast && (
                  <div className="flex flex-col items-center my-2 text-amber-400/80">
                    <div className="w-0.5 h-6 bg-gradient-to-b from-amber-500/80 to-amber-500/40"></div>
                    <ArrowDown className="w-5 h-5 -mt-1" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {editingNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Редактирование элемента логической цепочки</h3>
              <button
                onClick={() => setEditingNode(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNode} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Заголовок шага</label>
                  <input
                    type="text"
                    value={editingNode.title}
                    onChange={(e) => setEditingNode({ ...editingNode, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Статус обоснованности</label>
                  <select
                    value={editingNode.status}
                    onChange={(e) => setEditingNode({ ...editingNode, status: e.target.value as NodeStatus })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="fact">Подтверждённый факт</option>
                    <option value="assumption">Предположение</option>
                    <option value="hypothesis">Гипотеза</option>
                    <option value="conclusion">Обоснованный вывод</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Формулировка тезиса</label>
                <textarea
                  rows={3}
                  value={editingNode.content}
                  onChange={(e) => setEditingNode({ ...editingNode, content: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Основания (на чём держится тезис?)</label>
                <textarea
                  rows={2}
                  value={editingNode.evidence}
                  onChange={(e) => setEditingNode({ ...editingNode, evidence: e.target.value })}
                  placeholder="Документы, расчёты, подтверждённые цифры..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Недостающие данные</label>
                  <input
                    type="text"
                    value={editingNode.missingData}
                    onChange={(e) => setEditingNode({ ...editingNode, missingData: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Возможные возражения</label>
                  <input
                    type="text"
                    value={editingNode.counterArguments}
                    onChange={(e) => setEditingNode({ ...editingNode, counterArguments: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingNode(null)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-slate-200"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Сохранить изменения
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
