/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Menu, PlayCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';
import {
  completeInterview,
  createInterview,
  evaluateQuestionAnswer,
  fetchDashboard,
  fetchInterviewById,
} from './api.ts';
import { AboutView } from './components/AboutView.tsx';
import { AnalyticsView } from './components/AnalyticsView.tsx';
import { ConfigureInterviewView } from './components/ConfigureInterviewView.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { HistoryView } from './components/HistoryView.tsx';
import { InterviewWorkspaceView } from './components/InterviewWorkspaceView.tsx';
import { PerformanceReportView } from './components/PerformanceReportView.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { TipsView } from './components/TipsView.tsx';
import type {
  DashboardData,
  InterviewConfig,
  InterviewQuestion,
  InterviewSession,
  NavSection,
} from './types.ts';

const SECTION_LABELS: Record<NavSection, string> = {
  dashboard: 'Dashboard',
  configure: 'Start Mock Interview',
  workspace: 'Mock Interview Workspace',
  report: 'Performance Report',
  history: 'Interview History',
  analytics: 'Performance Analytics',
  tips: 'Interview Preparation Tips',
  about: 'About INTERVIEWX AI',
};

export default function App() {
  const [activeSection, setActiveSection] = useState<NavSection>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  const [activeSession, setActiveSession] = useState<InterviewSession | null>(null);
  const [reportSession, setReportSession] = useState<InterviewSession | null>(null);

  const [startingInterview, setStartingInterview] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [completingInterview, setCompletingInterview] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const refreshDashboard = useCallback(async () => {
    setDashboardLoading(true);
    setDashboardError(null);
    try {
      const data = await fetchDashboard();
      setDashboardData(data);
    } catch (err) {
      setDashboardError(
        err instanceof Error ? err.message : 'Unable to load dashboard metrics.'
      );
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  const handleStartInterview = async (config: InterviewConfig) => {
    setStartingInterview(true);
    setStartError(null);
    setGlobalError(null);
    try {
      const created = await createInterview(config);
      setActiveSession(created);
      setActiveSection('workspace');
      refreshDashboard();
    } catch (err) {
      setStartError(
        err instanceof Error ? err.message : 'Failed to generate mock interview questions.'
      );
    } finally {
      setStartingInterview(false);
    }
  };

  const handleOpenSession = async (session: InterviewSession) => {
    setGlobalError(null);
    try {
      const full = await fetchInterviewById(session.id);
      if (full.status === 'completed') {
        setReportSession(full);
        setActiveSection('report');
      } else {
        setActiveSession(full);
        setActiveSection('workspace');
      }
    } catch (err) {
      setGlobalError(
        err instanceof Error ? err.message : 'Failed to load interview session.'
      );
    }
  };

  const handleUpdateQuestionLocal = (updatedQ: InterviewQuestion) => {
    setActiveSession((prev) => {
      if (!prev || !prev.questions) return prev;
      return {
        ...prev,
        questions: prev.questions.map((q) => (q.id === updatedQ.id ? updatedQ : q)),
      };
    });
  };

  const handleEvaluateAnswer = async (
    questionId: number,
    answer: string
  ): Promise<InterviewQuestion> => {
    if (!activeSession) {
      throw new Error('No active interview session.');
    }
    const updatedQ = await evaluateQuestionAnswer(activeSession.id, questionId, answer);
    setActiveSession((prev) => {
      if (!prev || !prev.questions) return prev;
      const nextQuestions = prev.questions.map((q) => (q.id === updatedQ.id ? updatedQ : q));
      return {
        ...prev,
        answered_count: nextQuestions.filter((q) => q.score !== null).length,
        questions: nextQuestions,
      };
    });
    refreshDashboard();
    return updatedQ;
  };

  const handleCompleteInterview = async () => {
    if (!activeSession) return;
    setCompletingInterview(true);
    setGlobalError(null);
    try {
      const completed = await completeInterview(activeSession.id);
      setReportSession(completed);
      setActiveSession(null);
      setActiveSection('report');
      refreshDashboard();
    } catch (err) {
      setGlobalError(
        err instanceof Error ? err.message : 'Failed to generate final performance report.'
      );
    } finally {
      setCompletingInterview(false);
    }
  };

  const handleNavigate = (section: NavSection) => {
    setGlobalError(null);
    setStartError(null);
    setActiveSection(section);
    if (section === 'dashboard') {
      refreshDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-[#060A17] text-slate-100 relative overflow-x-clip flex">
      {/* Ambient dark-navy, deep-violet, and electric-blue gradient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden="true">
        <div className="ambient-mesh absolute -top-48 -left-32 h-[540px] w-[540px] rounded-full bg-violet-700/18 blur-[120px]" />
        <div className="ambient-mesh absolute top-1/3 -right-40 h-[520px] w-[520px] rounded-full bg-blue-600/16 blur-[130px]" />
        <div className="absolute -bottom-48 left-1/3 h-[420px] w-[420px] rounded-full bg-sky-500/10 blur-[120px]" />
      </div>

      <Sidebar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        hasActiveSession={activeSession !== null}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="relative z-10 flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 glass-surface border-b border-slate-800/80 px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 text-sm min-w-0">
              <span className="lg:hidden font-display font-bold text-white whitespace-nowrap">
                INTERVIEWX AI
              </span>
              <span className="lg:hidden text-slate-600" aria-hidden="true">
                /
              </span>
              <span className="font-medium text-slate-200 truncate">
                {SECTION_LABELS[activeSection]}
              </span>
            </div>
          </div>

          <div className="shrink-0">
            {activeSection !== 'configure' && activeSection !== 'workspace' && (
              <button
                type="button"
                onClick={() => handleNavigate('configure')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 transition-all whitespace-nowrap shrink-0"
              >
                <PlayCircle className="h-3.5 w-3.5" />
                <span>Start Interview</span>
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8 max-w-7xl w-full mx-auto">
          {globalError && (
            <div className="mb-6 rounded-xl border border-rose-500/35 bg-rose-950/35 px-4 py-3 text-sm text-rose-200">
              {globalError}
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeSection}-${activeSection === 'workspace' ? activeSession?.id : ''}${activeSection === 'report' ? reportSession?.id : ''}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            >
              {activeSection === 'dashboard' && (
                <DashboardView
                  data={dashboardData}
                  loading={dashboardLoading}
                  error={dashboardError}
                  onStartNew={() => handleNavigate('configure')}
                  onOpenSession={handleOpenSession}
                  onViewAllHistory={() => handleNavigate('history')}
                />
              )}

              {activeSection === 'configure' && (
                <ConfigureInterviewView
                  onStartInterview={handleStartInterview}
                  submitting={startingInterview}
                  error={startError}
                />
              )}

              {activeSection === 'workspace' && activeSession && (
                <InterviewWorkspaceView
                  session={activeSession}
                  onEvaluateAnswer={handleEvaluateAnswer}
                  onCompleteInterview={handleCompleteInterview}
                  onUpdateQuestionLocal={handleUpdateQuestionLocal}
                  completing={completingInterview}
                />
              )}

              {activeSection === 'workspace' && !activeSession && (
                <ConfigureInterviewView
                  onStartInterview={handleStartInterview}
                  submitting={startingInterview}
                  error={startError}
                />
              )}

              {activeSection === 'report' && reportSession && (
                <PerformanceReportView
                  session={reportSession}
                  onStartNew={() => handleNavigate('configure')}
                  onBackToHistory={() => handleNavigate('history')}
                />
              )}

              {activeSection === 'history' && (
                <HistoryView
                  onOpenSession={handleOpenSession}
                  onStartNew={() => handleNavigate('configure')}
                  onDataChanged={refreshDashboard}
                />
              )}

              {activeSection === 'analytics' && (
                <AnalyticsView onStartNew={() => handleNavigate('configure')} />
              )}

              {activeSection === 'tips' && <TipsView />}

              {activeSection === 'about' && (
                <AboutView onStartNew={() => handleNavigate('configure')} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
