import React from 'react';
import { Project, ProjectStage } from '../types';
import { 
  FolderKanban, 
  MessageSquare, 
  Network, 
  SlidersHorizontal, 
  Lightbulb, 
  FlaskConical, 
  FileText, 
  PlusCircle, 
  Download,
  Building2,
  CheckCircle2
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  activeProject: Project;
  projects: Project[];
  onSelectProject: (projectId: string) => void;
  onNewProject: () => void;
  onExport: () => void;
  isSaved?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  activeProject,
  projects,
  onSelectProject,
  onNewProject,
  onExport,
  isSaved = true
}) => {
  const tabs = [
    { id: 'projects', label: 'Проекты', icon: FolderKanban },
    { id: 'interview', label: 'Анализ проблемы', icon: MessageSquare },
    { id: 'chain', label: 'Логическая цепочка', icon: Network },
    { id: 'prioritization', label: 'Приоритизация', icon: SlidersHorizontal },
    { id: 'solutions', label: 'Варианты решений', icon: Lightbulb },
    { id: 'validation', label: 'План проверки', icon: FlaskConical },
    { id: 'report', label: 'Итоговый отчёт', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center font-bold text-slate-950 text-xl shadow-lg shadow-amber-500/20 ring-1 ring-amber-400/30">
              С
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-wider text-lg text-white">СТРАТЕГ</span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Методология
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Доказательное исследование и обоснование решений</p>
            </div>
          </div>

          {/* Active project quick-switcher */}
          <div className="hidden md:flex items-center gap-2 bg-slate-950/60 py-1 px-3 rounded-lg border border-slate-800 text-xs">
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Проект:</span>
            <select
              value={activeProject.id}
              onChange={(e) => onSelectProject(e.target.value)}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer max-w-[200px] truncate"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-slate-100">
                  {p.companyName || p.clientName || 'Без названия'}
                </option>
              ))}
            </select>
            {isSaved && (
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 ml-2">
                <CheckCircle2 className="w-3 h-3" /> Сохранено
              </span>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onNewProject}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-sm"
              title="Создать карточку новой встречи с предпринимателем"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Новая встреча</span>
            </button>
            <button
              onClick={onExport}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
              title="Экспорт всех проектов (JSON)"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 border-t border-slate-800/60 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
