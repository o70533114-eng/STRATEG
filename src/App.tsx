import React, { useState, useEffect } from 'react';
import { Project } from './types';
import { 
  getStoredProjects, 
  saveProjects, 
  getActiveProjectId, 
  setActiveProjectId, 
  exportProjectsJson 
} from './services/storage';
import { DEMO_PROJECT, INITIAL_EMPTY_PROJECT } from './demoData';
import { Navbar } from './components/Navbar';
import { ProjectsManager } from './components/ProjectsManager';
import { InterviewView } from './components/InterviewView';
import { LogicalChainView } from './components/LogicalChainView';
import { PrioritizationView } from './components/PrioritizationView';
import { SolutionsView } from './components/SolutionsView';
import { ValidationPlanView } from './components/ValidationPlanView';
import { ReportView } from './components/ReportView';

export default function App() {
  const [projects, setProjects] = useState<Project[]>(() => getStoredProjects());
  const [activeProjectId, setActiveId] = useState<string>(() => {
    const storedId = getActiveProjectId();
    const existing = getStoredProjects();
    const found = existing.find(p => p.id === storedId);
    return found ? found.id : existing[0]?.id || DEMO_PROJECT.id;
  });
  const [currentTab, setCurrentTab] = useState<string>('projects');
  const [isSaved, setIsSaved] = useState<boolean>(true);

  // Sync active project
  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0] || DEMO_PROJECT;

  const handleUpdateProjects = (updatedProjects: Project[]) => {
    setProjects(updatedProjects);
    saveProjects(updatedProjects);
    setIsSaved(true);
  };

  const handleUpdateActiveProject = (updated: Project) => {
    const updatedProjects = projects.map(p => p.id === updated.id ? updated : p);
    handleUpdateProjects(updatedProjects);
  };

  const handleSelectProject = (id: string) => {
    setActiveId(id);
    setActiveProjectId(id);
  };

  const handleNewProject = () => {
    const newProj: Project = {
      ...INITIAL_EMPTY_PROJECT,
      id: 'proj-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      clientName: 'Новый предприниматель',
      companyName: 'Новое предприятие',
      chatMessages: [
        {
          id: 'msg-start',
          role: 'assistant',
          content: 'Здравствуйте! Я готов выступить в роли вашего исследовательского партнёра. Давайте детально исследуем проблему компании без спешки и готовых шаблонов.\n\nВ чём выражается проблема своими словами?',
          timestamp: new Date().toISOString()
        }
      ]
    };
    const updated = [newProj, ...projects];
    handleUpdateProjects(updated);
    handleSelectProject(newProj.id);
    setCurrentTab('interview');
  };

  const handleExportAll = () => {
    exportProjectsJson(projects);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        activeProject={activeProject}
        projects={projects}
        onSelectProject={handleSelectProject}
        onNewProject={handleNewProject}
        onExport={handleExportAll}
        isSaved={isSaved}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentTab === 'projects' && (
          <ProjectsManager
            projects={projects}
            activeProjectId={activeProjectId}
            onSelectProject={handleSelectProject}
            onSaveProjects={handleUpdateProjects}
            onNavigateToStage={setCurrentTab}
          />
        )}

        {currentTab === 'interview' && (
          <InterviewView
            project={activeProject}
            onUpdateProject={handleUpdateActiveProject}
            onNavigateToStage={setCurrentTab}
          />
        )}

        {currentTab === 'chain' && (
          <LogicalChainView
            project={activeProject}
            onUpdateProject={handleUpdateActiveProject}
            onNavigateToStage={setCurrentTab}
          />
        )}

        {currentTab === 'prioritization' && (
          <PrioritizationView
            project={activeProject}
            onUpdateProject={handleUpdateActiveProject}
            onNavigateToStage={setCurrentTab}
          />
        )}

        {currentTab === 'solutions' && (
          <SolutionsView
            project={activeProject}
            onUpdateProject={handleUpdateActiveProject}
            onNavigateToStage={setCurrentTab}
          />
        )}

        {currentTab === 'validation' && (
          <ValidationPlanView
            project={activeProject}
            onUpdateProject={handleUpdateActiveProject}
            onNavigateToStage={setCurrentTab}
          />
        )}

        {currentTab === 'report' && (
          <ReportView
            project={activeProject}
            onUpdateProject={handleUpdateActiveProject}
          />
        )}
      </main>
    </div>
  );
}
