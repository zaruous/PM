
import React, { useState } from 'react';
import { PMOProvider } from './context/PMOContext';
import { ProjectManagement } from './components/ProjectManagement';
import { ResourceAllocation } from './components/ResourceAllocation';
import { MMAnalysis } from './components/MMAnalysis';
import { YearlyStatus } from './components/YearlyStatus';
import { UserManagement } from './components/UserManagement';
import { LayoutDashboard, Users, PieChart, Layers, CalendarRange, UserCog } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'projects' | 'users' | 'allocation' | 'analysis' | 'yearly'>('projects');

  const renderContent = () => {
    switch (activeTab) {
      case 'projects': return <ProjectManagement />;
      case 'users': return <UserManagement />;
      case 'allocation': return <ResourceAllocation />;
      case 'analysis': return <MMAnalysis />;
      case 'yearly': return <YearlyStatus />;
      default: return <ProjectManagement />;
    }
  };

  return (
      <PMOProvider>
        <div className="min-h-screen bg-slate-100 flex">
          {/* Sidebar */}
          <aside className="w-64 bg-slate-900 text-slate-300 flex-shrink-0 flex flex-col">
            <div className="h-16 flex items-center px-6 font-bold text-white text-xl tracking-tight border-b border-slate-800">
              <Layers className="mr-2 text-indigo-500" /> PMO Suite
            </div>
            <nav className="flex-1 px-3 py-6 space-y-1">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2 mt-2">Manage</div>
              <button
                  onClick={() => setActiveTab('projects')}
                  className={`w-full flex items-center px-3 py-2.5 rounded-md transition-colors ${activeTab === 'projects' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}
              >
                <LayoutDashboard size={20} className="mr-3" />
                Projects
              </button>
              <button
                  onClick={() => setActiveTab('users')}
                  className={`w-full flex items-center px-3 py-2.5 rounded-md transition-colors ${activeTab === 'users' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}
              >
                <UserCog size={20} className="mr-3" />
                Users
              </button>

              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2 mt-6">Planning</div>
              <button
                  onClick={() => setActiveTab('allocation')}
                  className={`w-full flex items-center px-3 py-2.5 rounded-md transition-colors ${activeTab === 'allocation' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}
              >
                <Users size={20} className="mr-3" />
                Allocation
              </button>

              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2 mt-6">Analysis</div>
              <button
                  onClick={() => setActiveTab('analysis')}
                  className={`w-full flex items-center px-3 py-2.5 rounded-md transition-colors ${activeTab === 'analysis' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}
              >
                <PieChart size={20} className="mr-3" />
                MM Analysis
              </button>
              <button
                  onClick={() => setActiveTab('yearly')}
                  className={`w-full flex items-center px-3 py-2.5 rounded-md transition-colors ${activeTab === 'yearly' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}
              >
                <CalendarRange size={20} className="mr-3" />
                Yearly Status
              </button>
            </nav>
            <div className="p-4 border-t border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs text-white font-bold">PM</div>
                <div className="text-sm">
                  <div className="text-white">Admin User</div>
                  <div className="text-xs text-slate-500">PMO Manager</div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-20">
              <h1 className="text-lg font-semibold text-slate-800 capitalize flex items-center gap-2">
                {activeTab === 'users' && <UserCog className="text-indigo-600"/>}
                {activeTab === 'analysis' ? 'MM Analysis' : activeTab === 'yearly' ? 'Yearly Status' : activeTab === 'allocation' ? 'Resource Allocation' : activeTab === 'projects' ? 'Project Management' : 'User Management'}
              </h1>
              <div className="flex items-center gap-4">
                <span className="text-xs font-medium px-2 py-1 bg-indigo-50 text-indigo-700 rounded border border-indigo-100">
                    System v1.2
                </span>
              </div>
            </header>
            <div className="p-8 max-w-7xl mx-auto">
              {renderContent()}
            </div>
          </main>
        </div>
      </PMOProvider>
  );
};

export default App;
