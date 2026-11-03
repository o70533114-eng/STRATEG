import React, { useState, useRef, useEffect } from 'react';
import { Project, ChatMessage } from '../types';
import { sendChatMessage } from '../services/api';
import { 
  Send, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle, 
  AlertTriangle, 
  ArrowRight, 
  Plus, 
  X, 
  Bot, 
  User, 
  ShieldAlert, 
  BrainCircuit, 
  RefreshCw,
  FileCheck2,
  HelpCircle as QuestionIcon
} from 'lucide-react';

interface InterviewViewProps {
  project: Project;
  onUpdateProject: (updated: Project) => void;
  onNavigateToStage: (stage: string) => void;
}

export const InterviewView: React.FC<InterviewViewProps> = ({
  project,
  onUpdateProject,
  onNavigateToStage
}) => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [newFactInput, setNewFactInput] = useState('');
  const [newMissingInput, setNewMissingInput] = useState('');
  const [newAssumptionInput, setNewAssumptionInput] = useState('');
  const [activeTab, setActiveTab] = useState<'facts' | 'missing' | 'assumptions'>('facts');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [project.chatMessages, isLoading]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...project.chatMessages, userMessage];
    const updatedProject: Project = {
      ...project,
      chatMessages: updatedMessages,
      updatedAt: new Date().toISOString()
    };

    onUpdateProject(updatedProject);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage(updatedMessages, updatedProject);

      const assistantMessage: ChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        role: 'assistant',
        content: response.content,
        timestamp: new Date().toISOString(),
        structuredMeta: response.structuredMeta
      };

      // Merge newly extracted facts, assumptions, and missing data if provided
      const newFacts = response.structuredMeta?.establishedFacts || [];
      const newAssumptions = response.structuredMeta?.assumptions || [];
      const newMissing = response.structuredMeta?.missingData || [];

      const mergedFacts = Array.from(new Set([...project.establishedFacts, ...newFacts]));
      const mergedAssumptions = Array.from(new Set([...project.assumptions, ...newAssumptions]));
      const mergedMissing = Array.from(new Set([...project.missingData, ...newMissing]));

      onUpdateProject({
        ...updatedProject,
        chatMessages: [...updatedMessages, assistantMessage],
        establishedFacts: mergedFacts,
        assumptions: mergedAssumptions,
        missingData: mergedMissing,
        updatedAt: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Interview error:', error);
      const errorMessage: ChatMessage = {
        id: 'msg-err-' + Date.now(),
        role: 'assistant',
        content: 'Произошла ошибка при обращении к аналитическому модулю: ' + (error.message || 'Сбой сети') + '.\nВы можете продолжить диалог или внести данные вручную в боковой панели.',
        timestamp: new Date().toISOString()
      };
      onUpdateProject({
        ...updatedProject,
        chatMessages: [...updatedMessages, errorMessage]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFactInput.trim()) return;
    const updated = Array.from(new Set([...project.establishedFacts, newFactInput.trim()]));
    onUpdateProject({ ...project, establishedFacts: updated });
    setNewFactInput('');
  };

  const handleRemoveFact = (index: number) => {
    const updated = project.establishedFacts.filter((_, i) => i !== index);
    onUpdateProject({ ...project, establishedFacts: updated });
  };

  const handleAddMissing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMissingInput.trim()) return;
    const updated = Array.from(new Set([...project.missingData, newMissingInput.trim()]));
    onUpdateProject({ ...project, missingData: updated });
    setNewMissingInput('');
  };

  const handleRemoveMissing = (index: number) => {
    const updated = project.missingData.filter((_, i) => i !== index);
    onUpdateProject({ ...project, missingData: updated });
  };

  const handleAddAssumption = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssumptionInput.trim()) return;
    const updated = Array.from(new Set([...project.assumptions, newAssumptionInput.trim()]));
    onUpdateProject({ ...project, assumptions: updated });
    setNewAssumptionInput('');
  };

  const handleRemoveAssumption = (index: number) => {
    const updated = project.assumptions.filter((_, i) => i !== index);
    onUpdateProject({ ...project, assumptions: updated });
  };

  const quickResponses = [
    'Точных цифр нет, это примерная оценка отдела продаж',
    'Да, это подтверждено выпиской из управленческого учёта',
    'Нам нужно поднять первичные документы для проверки',
    'В этой части мы ориентируемся на слова клиентов'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-8rem)] flex flex-col">
      {/* Top Protocol Strip */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 mb-4 flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-amber-400">
            <BrainCircuit className="w-4 h-4" /> Принцип расследования:
          </div>
          <span className="text-slate-300">
            Один вопрос за раз • Никаких советов до установления фактов • Проверка логической строгости
          </span>
        </div>

        <button
          onClick={() => onNavigateToStage('chain')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-colors shadow-sm ml-auto"
        >
          <span>Перейти к логической цепочке</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        {/* Left: Chat Session (7 cols) */}
        <div className="lg:col-span-7 flex flex-col bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {/* Messages Feed */}
          <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-5">
            {project.chatMessages.map((msg) => {
              const isAssistant = msg.role === 'assistant';

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 text-xs sm:text-sm ${
                    isAssistant ? 'items-start' : 'items-start justify-end'
                  }`}
                >
                  {isAssistant && (
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 font-bold mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 shadow-sm space-y-3 ${
                      isAssistant
                        ? 'bg-slate-900 border border-slate-800 text-slate-200'
                        : 'bg-amber-500/20 border border-amber-500/30 text-amber-100'
                    }`}
                  >
                    {/* Render message text with paragraphs */}
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {msg.content}
                    </div>

                    {/* Structured breakdown cards if available */}
                    {msg.structuredMeta && (
                      <div className="pt-2 border-t border-slate-800/80 space-y-2 text-xs">
                        {msg.structuredMeta.logicalCritique && (
                          <div className="p-2 rounded bg-rose-950/40 border border-rose-800/50 text-rose-300 flex items-start gap-2">
                            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                            <div>
                              <strong className="block font-semibold">Логический аудит вывода:</strong>
                              {msg.structuredMeta.logicalCritique}
                            </div>
                          </div>
                        )}

                        {msg.structuredMeta.nextQuestion && (
                          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-start gap-2">
                            <QuestionIcon className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <div>
                              <strong className="block font-semibold text-amber-200">Ключевой следующий вопрос:</strong>
                              {msg.structuredMeta.nextQuestion}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="text-[10px] text-slate-500 text-right">
                      {new Date(msg.timestamp).toLocaleTimeString('ru-RU', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>

                  {!isAssistant && (
                    <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center shrink-0 font-bold mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-3 items-center text-xs text-amber-400 p-3 rounded-xl bg-slate-900 border border-slate-800 max-w-xs animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Стратег анализирует логику и готовит следующий вопрос...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick response pills */}
          <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/40 flex gap-2 overflow-x-auto scrollbar-none">
            {quickResponses.map((qr, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setInputText(qr)}
                className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              >
                {qr}
              </button>
            ))}
          </div>

          {/* User Input Form */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Введите ответ предпринимателя или зафиксируйте факт..."
              disabled={isLoading}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-slate-950 font-bold text-xs sm:text-sm transition-all flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right: Analytical Facts / Knowledge Matrix (5 cols) */}
        <div className="lg:col-span-5 flex flex-col bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {/* Header tabs */}
          <div className="p-3 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <span className="font-bold text-xs sm:text-sm text-slate-200 flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-amber-400" /> Фиксация данных сессии
            </span>
            <div className="flex bg-slate-900 rounded-lg p-0.5 border border-slate-800">
              <button
                onClick={() => setActiveTab('facts')}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                  activeTab === 'facts'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Факты ({project.establishedFacts.length})
              </button>
              <button
                onClick={() => setActiveTab('assumptions')}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                  activeTab === 'assumptions'
                    ? 'bg-purple-500/20 text-purple-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Допущения ({project.assumptions.length})
              </button>
              <button
                onClick={() => setActiveTab('missing')}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                  activeTab === 'missing'
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Неизвестно ({project.missingData.length})
              </button>
            </div>
          </div>

          {/* List Content */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {activeTab === 'facts' && (
              <div className="space-y-3">
                <div className="text-[11px] text-slate-400">
                  Доказанные утверждения, подкреплённые отчётами, цифрами или документами:
                </div>
                {project.establishedFacts.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-6 text-center">
                    Факты пока не зафиксированы. Отвечайте на вопросы или добавьте вручную.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {project.establishedFacts.map((fact, idx) => (
                      <li
                        key={idx}
                        className="group flex items-start justify-between gap-2 p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-800/40 text-xs text-emerald-100"
                      >
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{fact}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveFact(idx)}
                          className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-opacity p-0.5"
                          title="Удалить"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <form onSubmit={handleAddFact} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={newFactInput}
                    onChange={(e) => setNewFactInput(e.target.value)}
                    placeholder="Добавить подтверждённый факт..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'assumptions' && (
              <div className="space-y-3">
                <div className="text-[11px] text-slate-400">
                  Мнения, убеждения и предположения, которые пока не доказаны:
                </div>
                {project.assumptions.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-6 text-center">
                    Предположения не зафиксированы.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {project.assumptions.map((assump, idx) => (
                      <li
                        key={idx}
                        className="group flex items-start justify-between gap-2 p-2.5 rounded-lg bg-purple-950/20 border border-purple-800/40 text-xs text-purple-200"
                      >
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                          <span>{assump}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveAssumption(idx)}
                          className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-opacity p-0.5"
                          title="Удалить"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <form onSubmit={handleAddAssumption} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={newAssumptionInput}
                    onChange={(e) => setNewAssumptionInput(e.target.value)}
                    placeholder="Зафиксировать предположение..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="submit"
                    className="px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'missing' && (
              <div className="space-y-3">
                <div className="text-[11px] text-slate-400">
                  Критические пробелы в данных, необходимые для проверки гипотез:
                </div>
                {project.missingData.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-6 text-center">
                    Белых пятен нет.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {project.missingData.map((miss, idx) => (
                      <li
                        key={idx}
                        className="group flex items-start justify-between gap-2 p-2.5 rounded-lg bg-amber-950/20 border border-amber-800/40 text-xs text-amber-200"
                      >
                        <div className="flex items-start gap-2">
                          <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>{miss}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveMissing(idx)}
                          className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-opacity p-0.5"
                          title="Удалить"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <form onSubmit={handleAddMissing} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={newMissingInput}
                    onChange={(e) => setNewMissingInput(e.target.value)}
                    placeholder="Добавить недостающие данные..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    className="px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Quick Context Card */}
          <div className="p-3 border-t border-slate-800 bg-slate-950/80 text-xs space-y-1.5">
            <div className="flex justify-between text-slate-400">
              <span>Предприятие:</span>
              <strong className="text-slate-200">{project.companyName || 'Не указано'}</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Целевой результат:</span>
              <span className="text-amber-300 font-medium truncate max-w-[220px]" title={project.desiredOutcome}>
                {project.desiredOutcome || 'Не сформулирован'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
