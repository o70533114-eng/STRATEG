import React, { useState, useRef } from 'react';
import { Project } from '../types';
import { DEMO_PROJECT, INITIAL_EMPTY_PROJECT } from '../demoData';
import { 
  Building2, 
  User, 
  Calendar, 
  ArrowRight, 
  Plus, 
  Trash2, 
  FileCode, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Boxes
} from 'lucide-react';

interface ProjectsManagerProps {
  projects: Project[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  onSaveProjects: (projects: Project[]) => void;
  onNavigateToStage: (stage: string) => void;
}

export const ProjectsManager: React.FC<ProjectsManagerProps> = ({
  projects,
  activeProjectId,
  onSelectProject,
  onSaveProjects,
  onNavigateToStage
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newForm, setNewForm] = useState({
    clientName: '',
    companyName: '',
    industry: '',
    scale: '',
    initialProblem: '',
    desiredOutcome: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.companyName.trim() && !newForm.clientName.trim()) return;

    const newProject: Project = {
      ...INITIAL_EMPTY_PROJECT,
      id: 'proj-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      clientName: newForm.clientName.trim() || 'Предприниматель',
      companyName: newForm.companyName.trim() || 'Новое предприятие',
      industry: newForm.industry.trim() || 'Не указана',
      scale: newForm.scale.trim() || 'Не указан',
      initialProblem: newForm.initialProblem.trim(),
      desiredOutcome: newForm.desiredOutcome.trim(),
      chatMessages: [
        {
          id: 'msg-welcome',
          role: 'assistant',
          content: `Здравствуйте, ${newForm.clientName || 'коллега'}! Я выступаю в роли вашего методического партнёра по исследованию проблемы компании «${newForm.companyName || 'Предприятие'}».\n\nМы будем двигаться строго по фактам и задавать по одному вопросу за раз, чтобы найти первопричину, а не поверхностные симптомы.\n\nДавайте начнём: опишите, пожалуйста, первичную формулировку проблемы своими словами и какими наблюдаемыми проявлениями она выражается?`,
          timestamp: new Date().toISOString()
        }
      ]
    };

    const updated = [newProject, ...projects];
    onSaveProjects(updated);
    onSelectProject(newProject.id);
    setIsModalOpen(false);
    setNewForm({
      clientName: '',
      companyName: '',
      industry: '',
      scale: '',
      initialProblem: '',
      desiredOutcome: ''
    });
    onNavigateToStage('interview');
  };

  const handleLoadDemo = () => {
    // Check if demo already exists
    const exists = projects.find(p => p.id === DEMO_PROJECT.id);
    if (exists) {
      onSelectProject(DEMO_PROJECT.id);
      return;
    }
    const updated = [DEMO_PROJECT, ...projects];
    onSaveProjects(updated);
    onSelectProject(DEMO_PROJECT.id);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Вы уверены, что хотите удалить эту карточку проекта?')) {
      const remaining = projects.filter(p => p.id !== id);
      if (remaining.length === 0) {
        remaining.push({
          ...INITIAL_EMPTY_PROJECT,
          id: 'proj-' + Date.now(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          clientName: 'Новый клиент',
          companyName: 'Новая компания'
        });
      }
      onSaveProjects(remaining);
      if (activeProjectId === id) {
        onSelectProject(remaining[0].id);
      }
    }
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0) {
          onSaveProjects(parsed);
          onSelectProject(parsed[0].id);
          alert(`Успешно импортировано проектов: ${parsed.length}`);
        } else if (parsed && parsed.id) {
          const updated = [parsed, ...projects.filter(p => p.id !== parsed.id)];
          onSaveProjects(updated);
          onSelectProject(parsed.id);
          alert('Проект успешно импортирован');
        }
      } catch (err) {
        alert('Ошибка при чтении JSON-файла: некорректный формат');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/60 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles className="w-3.5 h-3.5" /> Доказательный инструмент стратегической диагностики
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Рабочее место консультанта-стратега
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Выясняйте проблемы предпринимателей, выявляйте первопричины, выстраивайте непротиворечивые логические цепочки
              и рассчитывайте верифицируемые решения. Приложение не выдаёт поспешных советов, а ведёт строгое исследование.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" /> Новая встреча
            </button>
            <button
              onClick={handleLoadDemo}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600/80 font-medium text-sm transition-all"
            >
              <FileCode className="w-4 h-4 text-amber-400" /> Загрузить эталонный кейс
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 font-medium text-sm transition-all"
              title="Импортировать проекты из JSON"
            >
              <Upload className="w-4 h-4" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportJson}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <Boxes className="w-5 h-5 text-amber-400" /> Карточки предприятий ({projects.length})
          </h2>
          <span className="text-xs text-slate-400">Все изменения сохраняются автоматически</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((proj) => {
            const isActive = proj.id === activeProjectId;
            const factsCount = proj.establishedFacts?.length || 0;
            const chainNodesCount = proj.logicalChain?.length || 0;
            const solutionsCount = proj.solutions?.length || 0;

            return (
              <div
                key={proj.id}
                onClick={() => {
                  onSelectProject(proj.id);
                  onNavigateToStage('interview');
                }}
                className={`relative group flex flex-col justify-between p-5 rounded-xl border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900/90 border-amber-500/50 shadow-md shadow-amber-500/5 ring-1 ring-amber-500/30'
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/70'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-slate-100 group-hover:text-amber-300 transition-colors text-base line-clamp-1">
                        {proj.companyName || 'Без названия'}
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        {proj.clientName || 'Контакт не указан'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      {isActive && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Текущий
                        </span>
                      )}
                      <button
                        onClick={(e) => handleDelete(proj.id, e)}
                        className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                        title="Удалить карточку"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {proj.industry && (
                    <div className="text-xs text-slate-400 line-clamp-1">
                      <span className="text-slate-500">Сфера:</span> {proj.industry}
                    </div>
                  )}

                  {proj.initialProblem ? (
                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300">
                      <span className="font-semibold text-amber-400/90 block mb-1">Проблема:</span>
                      <p className="line-clamp-2">{proj.initialProblem}</p>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-lg bg-slate-950/30 border border-slate-800/40 text-xs text-slate-500 italic">
                      Проблема ещё не сформулирована
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-3">
                    <span title="Подтверждённые факты" className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {factsCount}
                    </span>
                    <span title="Узлы логической цепочки" className="flex items-center gap-1 text-cyan-400">
                      <TrendingUp className="w-3.5 h-3.5" /> {chainNodesCount}
                    </span>
                    <span title="Варианты решений" className="flex items-center gap-1 text-amber-400">
                      <Sparkles className="w-3.5 h-3.5" /> {solutionsCount}
                    </span>
                  </div>

                  <span className="text-slate-500 group-hover:text-amber-400 flex items-center gap-1 font-medium transition-colors">
                    Открыть <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: New Meeting / Project */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white">Новая диагностическая встреча</h3>
                <p className="text-xs text-slate-400">Заполните первичные данные о предпринимателе и предприятии</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Компания / Предприятие *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Например: ООО «СеверТрейд»"
                    value={newForm.companyName}
                    onChange={(e) => setNewForm({ ...newForm, companyName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Предприниматель / Должность
                  </label>
                  <input
                    type="text"
                    placeholder="Имя, должность"
                    value={newForm.clientName}
                    onChange={(e) => setNewForm({ ...newForm, clientName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Сфера деятельности / Отрасль
                  </label>
                  <input
                    type="text"
                    placeholder="Оптовая торговля, производство, IT..."
                    value={newForm.industry}
                    onChange={(e) => setNewForm({ ...newForm, industry: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Масштаб (выручка, штат)
                  </label>
                  <input
                    type="text"
                    placeholder="150 млн руб./год, 30 сотрудников"
                    value={newForm.scale}
                    onChange={(e) => setNewForm({ ...newForm, scale: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Проблема со слов предпринимателя
                </label>
                <textarea
                  rows={3}
                  placeholder="Как клиент формулирует проблему на первой встрече своими словами..."
                  value={newForm.initialProblem}
                  onChange={(e) => setNewForm({ ...newForm, initialProblem: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Желаемый результат (цель)
                </label>
                <input
                  type="text"
                  placeholder="Конкретная цель с метриками и сроками..."
                  value={newForm.desiredOutcome}
                  onChange={(e) => setNewForm({ ...newForm, desiredOutcome: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs font-medium"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-colors"
                >
                  Начать диагностику
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
