import React, { useState } from 'react';
import { Project } from '../types';
import { exportSingleProjectMarkdown, exportProjectsJson } from '../services/storage';
import { 
  FileText, 
  Printer, 
  Copy, 
  Download, 
  Check, 
  Building2, 
  User, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  TrendingUp, 
  ShieldAlert, 
  Star,
  Target,
  FlaskConical,
  Boxes
} from 'lucide-react';

interface ReportViewProps {
  project: Project;
  onUpdateProject: (updated: Project) => void;
}

export const ReportView: React.FC<ReportViewProps> = ({
  project,
  onUpdateProject
}) => {
  const [copied, setCopied] = useState(false);

  const selectedSolution = project.solutions.find(s => s.id === project.selectedSolutionId) || project.solutions.find(s => s.isRecommended) || project.solutions[0];

  const handleCopyMarkdown = () => {
    const md = exportSingleProjectMarkdown(project);
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Action Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-white text-base">Итоговый стратегический отчёт</h2>
            <p className="text-xs text-slate-400">Готов к печати, согласованию с клиентом и экспорту</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopyMarkdown}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Скопировано!' : 'Копировать Markdown'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Печать / Сохранить в PDF</span>
          </button>

          <button
            onClick={() => exportProjectsJson([project])}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition-colors"
            title="Экспорт проекта в JSON"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="border-b border-slate-800 print:border-neutral-300 pb-6 space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="text-[11px] font-extrabold uppercase tracking-widest text-amber-500 print:text-amber-800">
                ДИАГНОСТИЧЕСКОЕ ЗАКЛЮЧЕНИЕ СТРАТЕГА
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white print:text-black tracking-tight">
                {project.companyName || 'Диагностика предприятия'}
              </h1>
            </div>

            <div className="text-right text-xs text-slate-400 print:text-neutral-600">
              <div className="flex items-center gap-1 justify-end font-medium">
                <Calendar className="w-3.5 h-3.5" />
                {new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
              <div>СТРАТЕГ v1.0 • Доказательный анализ</div>
            </div>
          </div>

          {/* Context Meta Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/60 print:bg-neutral-100 border border-slate-800 print:border-neutral-200">
              <span className="text-slate-400 print:text-neutral-500 block text-[10px] uppercase font-semibold">
                Предприниматель
              </span>
              <strong className="text-slate-200 print:text-neutral-900 mt-0.5 block truncate">
                {project.clientName || 'Не указан'}
              </strong>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 print:bg-neutral-100 border border-slate-800 print:border-neutral-200">
              <span className="text-slate-400 print:text-neutral-500 block text-[10px] uppercase font-semibold">
                Отрасль / Сфера
              </span>
              <strong className="text-slate-200 print:text-neutral-900 mt-0.5 block truncate">
                {project.industry || 'Не указана'}
              </strong>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 print:bg-neutral-100 border border-slate-800 print:border-neutral-200">
              <span className="text-slate-400 print:text-neutral-500 block text-[10px] uppercase font-semibold">
                Масштаб бизнеса
              </span>
              <strong className="text-slate-200 print:text-neutral-900 mt-0.5 block truncate">
                {project.scale || 'Не указан'}
              </strong>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 print:bg-neutral-100 border border-slate-800 print:border-neutral-200">
              <span className="text-slate-400 print:text-neutral-500 block text-[10px] uppercase font-semibold">
                Статус проекта
              </span>
              <strong className="text-emerald-400 print:text-emerald-800 mt-0.5 block">
                Диагностика завершена
              </strong>
            </div>
          </div>
        </div>

        {/* 1. Problem Formulation and Desired Result */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white print:text-black flex items-center gap-2 border-l-4 border-amber-500 pl-3">
            1. Проблема и целевой результат
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-slate-950/60 print:bg-neutral-50 border border-slate-800 print:border-neutral-200 space-y-1.5">
              <strong className="text-amber-400 print:text-amber-700 block font-semibold text-xs uppercase tracking-wide">
                Формулировка проблемы со слов предпринимателя:
              </strong>
              <p className="text-slate-300 print:text-neutral-800 leading-relaxed">
                {project.initialProblem || 'Не зафиксирована'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 print:bg-neutral-50 border border-slate-800 print:border-neutral-200 space-y-1.5">
              <strong className="text-emerald-400 print:text-emerald-700 block font-semibold text-xs uppercase tracking-wide">
                Желаемый измеримый результат:
              </strong>
              <p className="text-slate-300 print:text-neutral-800 leading-relaxed">
                {project.desiredOutcome || 'Не зафиксирован'}
              </p>
            </div>
          </div>
        </section>

        {/* 2. Facts vs Assumptions vs Blind Spots */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white print:text-black flex items-center gap-2 border-l-4 border-emerald-500 pl-3">
            2. Подтверждённые факты vs Непроверенные допущения
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Facts */}
            <div className="p-4 rounded-xl bg-slate-950/60 print:bg-neutral-50 border border-slate-800 print:border-neutral-200 space-y-2">
              <span className="font-bold text-emerald-400 print:text-emerald-700 flex items-center gap-1.5 uppercase text-[11px] tracking-wide">
                <CheckCircle2 className="w-4 h-4" /> Подтверждённые факты ({project.establishedFacts.length}):
              </span>
              <ul className="space-y-1.5 text-slate-300 print:text-neutral-800">
                {project.establishedFacts.map((fact, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold shrink-0">•</span>
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Assumptions */}
            <div className="p-4 rounded-xl bg-slate-950/60 print:bg-neutral-50 border border-slate-800 print:border-neutral-200 space-y-2">
              <span className="font-bold text-purple-400 print:text-purple-700 flex items-center gap-1.5 uppercase text-[11px] tracking-wide">
                <AlertTriangle className="w-4 h-4" /> Допущения команды ({project.assumptions.length}):
              </span>
              <ul className="space-y-1.5 text-slate-300 print:text-neutral-800">
                {project.assumptions.map((assump, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-purple-400 font-bold shrink-0">•</span>
                    <span>{assump}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Missing Data */}
            <div className="p-4 rounded-xl bg-slate-950/60 print:bg-neutral-50 border border-slate-800 print:border-neutral-200 space-y-2">
              <span className="font-bold text-amber-400 print:text-amber-700 flex items-center gap-1.5 uppercase text-[11px] tracking-wide">
                <HelpCircle className="w-4 h-4" /> Недостающие данные ({project.missingData.length}):
              </span>
              <ul className="space-y-1.5 text-slate-300 print:text-neutral-800">
                {project.missingData.map((miss, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold shrink-0">•</span>
                    <span>{miss}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 3. Logical Reasoning Chain */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white print:text-black flex items-center gap-2 border-l-4 border-cyan-500 pl-3">
            3. Логическая цепочка рассуждений и доказательств
          </h2>

          <div className="space-y-3">
            {project.logicalChain.map((node, i) => (
              <div
                key={node.id}
                className="p-4 rounded-xl bg-slate-950/60 print:bg-neutral-50 border border-slate-800 print:border-neutral-200 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-slate-800 print:bg-neutral-200 text-slate-300 print:text-neutral-800 flex items-center justify-center font-bold text-[11px]">
                      {i + 1}
                    </span>
                    <strong className="text-white print:text-neutral-900 font-bold text-sm">
                      {node.title}
                    </strong>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded uppercase border border-slate-700 text-slate-300 print:text-neutral-700">
                    {node.status}
                  </span>
                </div>

                <p className="text-slate-300 print:text-neutral-800 font-medium">
                  {node.content}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 print:border-neutral-200 text-[11px] text-slate-400 print:text-neutral-600">
                  <div>
                    <span className="font-semibold text-slate-300 print:text-neutral-800 block">Основания:</span>
                    {node.evidence || '—'}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-300 print:text-neutral-800 block">Недостающие данные:</span>
                    {node.missingData || '—'}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-300 print:text-neutral-800 block">Возражения:</span>
                    {node.counterArguments || '—'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Problem Prioritization Matrix */}
        {project.prioritization && (
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white print:text-black flex items-center gap-2 border-l-4 border-amber-500 pl-3">
              4. Оценка критичности и стоимость бездействия
            </h2>

            <div className="p-4 rounded-xl bg-slate-950/60 print:bg-neutral-50 border border-slate-800 print:border-neutral-200 space-y-3 text-xs sm:text-sm">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 print:border-neutral-200">
                <span className="font-bold text-white print:text-black">
                  Итоговый индекс критичности проблемы:
                </span>
                <span className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 print:text-amber-800 font-extrabold">
                  {project.prioritization.totalPriorityScore} / 10
                </span>
              </div>

              <p className="text-slate-300 print:text-neutral-800 leading-relaxed">
                {project.prioritization.totalPrioritySummary}
              </p>

              <div className="p-3 rounded-lg bg-amber-950/20 print:bg-amber-50 border border-amber-800/30 print:border-amber-200 text-xs text-amber-200 print:text-amber-900">
                <strong className="block mb-0.5">Неопределённость и риски:</strong>
                {project.prioritization.uncertaintyNotes}
              </div>
            </div>
          </section>
        )}

        {/* 5. Recommended Solution & Verification Plan */}
        {selectedSolution && (
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white print:text-black flex items-center gap-2 border-l-4 border-emerald-500 pl-3">
              5. Рекомендуемое решение и план экспериментальной проверки
            </h2>

            <div className="p-5 rounded-2xl bg-slate-950/60 print:bg-neutral-50 border border-slate-800 print:border-neutral-200 space-y-4 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <h3 className="font-bold text-white print:text-black text-base">
                  {selectedSolution.name}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-slate-400 print:text-neutral-600 block">Механизм воздействия:</span>
                  <p className="text-slate-300 print:text-neutral-800 leading-relaxed">
                    {selectedSolution.impactMechanism}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-slate-400 print:text-neutral-600 block">Ожидаемый результат:</span>
                  <p className="text-slate-300 print:text-neutral-800 leading-relaxed">
                    {selectedSolution.expectedResult}
                  </p>
                </div>
              </div>

              {/* Validation Plan Checklist */}
              {project.validationPlan && (
                <div className="pt-4 border-t border-slate-800 print:border-neutral-200 space-y-3">
                  <span className="font-bold text-amber-400 print:text-amber-800 uppercase text-xs tracking-wider block">
                    План пилотной проверки гипотезы:
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-slate-900 print:bg-white border border-slate-800 print:border-neutral-200">
                      <strong className="block text-slate-300 print:text-neutral-800 mb-0.5">Базовые замеры ДО:</strong>
                      <span className="text-slate-400 print:text-neutral-600">{project.validationPlan.baselineMetrics}</span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900 print:bg-white border border-slate-800 print:border-neutral-200">
                      <strong className="block text-slate-300 print:text-neutral-800 mb-0.5">Что конкретно меняем:</strong>
                      <span className="text-slate-400 print:text-neutral-600">{project.validationPlan.exactChange}</span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900 print:bg-white border border-slate-800 print:border-neutral-200">
                      <strong className="block text-slate-300 print:text-neutral-800 mb-0.5">Срок проверки:</strong>
                      <span className="text-slate-400 print:text-neutral-600">{project.validationPlan.duration}</span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-900 print:bg-white border border-slate-800 print:border-neutral-200">
                      <strong className="block text-slate-300 print:text-neutral-800 mb-0.5">Показатели ПОСЛЕ:</strong>
                      <span className="text-slate-400 print:text-neutral-600">{project.validationPlan.postMetrics}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-amber-950/20 print:bg-amber-50 border border-amber-800/40 print:border-amber-200 text-xs">
                    <strong className="block text-amber-300 print:text-amber-900 mb-1">
                      Критерии принятия решения о масштабировании (GO / NO-GO):
                    </strong>
                    <p className="text-amber-200 print:text-amber-800 leading-relaxed">
                      {project.validationPlan.decisionCriteria}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Document Footer Signatures */}
        <div className="pt-8 border-t border-slate-800 print:border-neutral-300 text-xs text-slate-400 print:text-neutral-600 flex justify-between items-end">
          <div>
            <p className="font-semibold text-slate-300 print:text-neutral-800">
              Консультант / Эксперт по стратегической диагностике:
            </p>
            <div className="w-48 h-8 border-b border-slate-700 print:border-neutral-400 mt-2"></div>
          </div>

          <div className="text-right">
            <p className="font-semibold text-slate-300 print:text-neutral-800">
              Руководитель предприятия:
            </p>
            <div className="w-48 h-8 border-b border-slate-700 print:border-neutral-400 mt-2 ml-auto"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
