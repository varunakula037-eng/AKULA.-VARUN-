import { ArrowRight, Award, CheckCircle2, Clock, FileText, PlayCircle, TrendingUp } from 'lucide-react';
import type { DashboardData, InterviewSession } from '../types.ts';

interface DashboardViewProps {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  onStartNew: () => void;
  onOpenSession: (session: InterviewSession) => void;
  onViewAllHistory: () => void;
}

export function DashboardView({
  data,
  loading,
  error,
  onStartNew,
  onOpenSession,
  onViewAllHistory,
}: DashboardViewProps) {
  const stats = data?.stats;
  const recent = data?.recentInterviews ?? [];

  return (
    <div className="space-y-8">
      <section className="glass-surface-elevated rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div
          className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-gradient-to-br from-violet-600/25 to-blue-500/20 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-xs font-medium tracking-wider uppercase text-sky-300">
              AI Mock Interview Readiness Studio
            </p>
            <h1 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight text-white [text-wrap:balance]">
              Prepare with realistic interviews and structured feedback
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              Generate role-tailored technical and behavioral questions, practice structured answers,
              and receive detailed Gemini evaluations with sample stronger responses.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onStartNew}
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 shadow-lg shadow-violet-950/50 transition-all whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              <PlayCircle className="h-4 w-4" />
              <span>Start Interview</span>
            </button>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-rose-500/35 bg-rose-950/35 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      <section aria-label="Interview performance summary">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="glass-surface rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Total Interviews Completed</span>
              <CheckCircle2 className="h-4 w-4 text-violet-400" />
            </div>
            <div className="mt-3 font-display text-3xl font-bold text-white tabular-nums">
              {loading ? '...' : stats?.totalCompleted ?? 0}
            </div>
            <p className="mt-1.5 text-xs text-slate-400">
              {stats && stats.inProgressCount > 0
                ? `${stats.inProgressCount} session${stats.inProgressCount > 1 ? 's' : ''} in progress`
                : 'Completed full sessions'}
            </p>
          </div>

          <div className="glass-surface rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Average Interview Score</span>
              <TrendingUp className="h-4 w-4 text-sky-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="font-display text-3xl font-bold text-white tabular-nums">
                {loading
                  ? '...'
                  : stats?.averageScore !== null && stats?.averageScore !== undefined
                    ? `${Math.round(stats.averageScore)}`
                    : '—'}
              </span>
              {stats?.averageScore !== null && stats?.averageScore !== undefined && (
                <span className="text-sm font-mono text-slate-400">/100</span>
              )}
            </div>
            <p className="mt-1.5 text-xs text-slate-400">
              {stats?.averageScore !== null && stats?.averageScore !== undefined
                ? `${(stats.averageScore / 10).toFixed(1)} / 10 avg per question`
                : 'Complete an interview to see average'}
            </p>
          </div>

          <div className="glass-surface rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Highest Interview Score</span>
              <Award className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="font-display text-3xl font-bold text-white tabular-nums">
                {loading
                  ? '...'
                  : stats?.highestScore !== null && stats?.highestScore !== undefined
                    ? `${Math.round(stats.highestScore)}`
                    : '—'}
              </span>
              {stats?.highestScore !== null && stats?.highestScore !== undefined && (
                <span className="text-sm font-mono text-slate-400">/100</span>
              )}
            </div>
            <p className="mt-1.5 text-xs text-slate-400">
              {stats?.highestScore !== null && stats?.highestScore !== undefined
                ? 'Personal best session score'
                : 'No completed benchmark yet'}
            </p>
          </div>

          <div className="glass-surface rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Questions Answered</span>
              <FileText className="h-4 w-4 text-blue-400" />
            </div>
            <div className="mt-3 font-display text-3xl font-bold text-white tabular-nums">
              {loading ? '...' : stats?.questionsAnswered ?? 0}
            </div>
            <p className="mt-1.5 text-xs text-slate-400">Evaluated by Gemini AI</p>
          </div>
        </div>
      </section>

      <section className="glass-surface rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <h2 className="font-display text-xl font-semibold text-white">
              Recent Interview Activity
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Resume an active session or review completed performance reports
            </p>
          </div>
          {recent.length > 0 && (
            <button
              type="button"
              onClick={onViewAllHistory}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-300 hover:text-sky-200 transition-colors whitespace-nowrap shrink-0"
            >
              <span>View all history</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {loading ? (
          <div className="py-8 space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-14 rounded-xl bg-slate-800/40 animate-pulse" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="py-12 text-center max-w-md mx-auto">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800/80 border border-slate-700/60 text-sky-300">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold text-white">
              No interview history yet
            </h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              Your completed mock interviews, scores, and improvement trends will appear here as soon
              as you start your first practice session.
            </p>
            <button
              type="button"
              onClick={onStartNew}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 transition-all whitespace-nowrap"
            >
              <PlayCircle className="h-4 w-4" />
              <span>Start First Mock Interview</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/70">
            {recent.map((item) => {
              const dateLabel = new Date(item.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });
              const isCompleted = item.status === 'completed';

              return (
                <div
                  key={item.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/20 -mx-3 px-3 rounded-xl transition-colors"
                >
                  <div className="min-w-0">
                    <div className="font-medium text-white truncate">{item.job_role}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span>{item.interview_type}</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.experience_level}</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.difficulty}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">
                        {item.answered_count}/{item.question_count} answered
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{dateLabel}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    {isCompleted && item.overall_score !== null ? (
                      <div className="text-right">
                        <div className="font-mono text-sm font-semibold text-emerald-300 tabular-nums">
                          {Math.round(item.overall_score)}/100
                        </div>
                        <div className="text-[11px] text-slate-400">Completed</div>
                      </div>
                    ) : (
                      <div className="text-right">
                        <div className="text-xs font-medium text-amber-300">In Progress</div>
                        <div className="text-[11px] text-slate-400 tabular-nums">
                          {item.answered_count}/{item.question_count} done
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => onOpenSession(item)}
                      className="px-3.5 py-2 rounded-lg text-xs font-medium text-white bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 transition-colors whitespace-nowrap shrink-0"
                    >
                      {isCompleted ? 'View Report' : 'Resume'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
