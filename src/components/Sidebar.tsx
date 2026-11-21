import {
  BarChart3,
  BookOpen,
  History,
  Info,
  LayoutDashboard,
  PlayCircle,
  Sparkles,
  X,
} from 'lucide-react';
import type { NavSection } from '../types.ts';

interface SidebarProps {
  activeSection: NavSection;
  onNavigate: (section: NavSection) => void;
  hasActiveSession: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const NAV_ITEMS: Array<{
  id: NavSection;
  label: string;
  icon: typeof LayoutDashboard;
}> = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'configure', label: 'Start Mock Interview', icon: PlayCircle },
  { id: 'history', label: 'Interview History', icon: History },
  { id: 'analytics', label: 'Performance Analytics', icon: BarChart3 },
  { id: 'tips', label: 'Interview Preparation Tips', icon: BookOpen },
  { id: 'about', label: 'About INTERVIEWX AI', icon: Info },
];

export function Sidebar({
  activeSection,
  onNavigate,
  hasActiveSession,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const isNavItemActive = (id: NavSection) => {
    if (id === 'configure' && (activeSection === 'configure' || activeSection === 'workspace')) {
      return true;
    }
    if (id === 'history' && activeSection === 'report') {
      return true;
    }
    return activeSection === id;
  };

  const navContent = (
    <div className="flex h-full flex-col justify-between p-5">
      <div>
        <div className="flex items-start justify-between gap-2 pb-6 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 shadow-lg shadow-violet-900/30">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-display text-lg font-bold tracking-tight text-white whitespace-nowrap">
                INTERVIEWX AI
              </span>
            </div>
            <p className="mt-2.5 text-xs leading-relaxed text-slate-400">
              Practice Smart. Speak Confidently. Get Hired.
            </p>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close navigation menu"
            className="lg:hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-6 space-y-1.5" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isNavItemActive(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onNavigate(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                  active
                    ? 'bg-gradient-to-r from-violet-600/25 to-blue-600/20 text-white border border-violet-500/35'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    active ? 'text-sky-300' : 'text-slate-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="pt-5 border-t border-slate-800/80 space-y-3">
        {hasActiveSession && activeSection !== 'workspace' && (
          <button
            type="button"
            onClick={() => {
              onNavigate('workspace');
              onCloseMobile();
            }}
            className="w-full py-2.5 px-3.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 transition-all shadow-md shadow-violet-950/50 whitespace-nowrap"
          >
            Return to Active Interview
          </button>
        )}
        <div className="text-xs text-slate-400 leading-relaxed">
          Responses are saved locally in SQLite so your interview progress is preserved across sessions.
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex lg:w-68 lg:shrink-0 lg:flex-col glass-surface border-r border-slate-800/80 min-h-screen sticky top-0 h-screen">
        {navContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative w-72 max-w-[85vw] h-full glass-surface-elevated border-r border-slate-800 z-10">
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
}
