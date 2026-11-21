import {
  AlertTriangle,
  Award,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Compass,
  Download,
  MessageSquareText,
  PlayCircle,
  TrendingDown,
} from 'lucide-react';
import { useState } from 'react';
import { getPdfDownloadUrl } from '../api.ts';
import type { InterviewSession } from '../types.ts';
import { CircularScore } from './CircularScore.tsx';

interface PerformanceReportViewProps {
  session: InterviewSession;
  onStartNew: () => void;
  onBackToHistory: () => void;
}

export function PerformanceReportView({
  session,
  onStartNew,
  onBackToHistory,
}: PerformanceReportViewProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const report = session.report;
  const questions = session.questions ?? [];

  if (!report) {
    return (
      <div className="glass-surface rounded-2xl p-8 text-center space-y-4">
        <p className="text-slate-300">Final performance report is not available for this session.</p>
        <button
          type="button"
          onClick={onBackToHistory}
          className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-slate-800 hover:bg-slate-700"
        >
          Back to History
        </button>
      </div>
    );
  }

  const completedDate = new Date(session.completed_at || session.created_at).toLocaleDateString(
    'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  return (
    <div className="max-w-5xl mx-auto space-y-7">
      <section className="glass-surface-elevated rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="text-sky-300 font-medium">Final Performance Report</span>
              <span aria-hidden="true">·</span>
              <span>{completedDate}</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
              {session.job_role}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
              <span>{session.experience_level}</span>
              <span aria-hidden="true">·</span>
              <span>{session.difficulty} Difficulty</span>
              <span aria-hidden="true">·</span>
              <span>{session.interview_type}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{session.question_count} Questions</span>
            </div>

            <div className="pt-3 flex flex-wrap items-center gap-3">
              <a
                href={getPdfDownloadUrl(session.id)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 shadow-lg shadow-violet-950/50 transition-all whitespace-nowrap"
              >
                <Download className="h-4 w-4" />
                <span>Download PDF Report</span>
              </a>

              <button
                type="button"
                onClick={onStartNew}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-200 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 transition-colors whitespace-nowrap"
              >
                <PlayCircle className="h-4 w-4" />
                <span>Practice Again</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center lg:justify-end gap-6">
            <CircularScore
              score={report.overall_score}
              maxScore={100}
              size={136}
              label="Overall Score"
            />
          </div>
        </div>

        <div className="mt-7 pt-6 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4">
            <div className="text-xs text-slate-400">Average Score</div>
            <div className="mt-1.5 font-display text-2xl font-bold text-white tabular-nums">
              {report.average_score.toFixed(1)}{' '}
              <span className="text-sm font-mono font-normal text-slate-400">/ 10</span>
            </div>
          </div>

          <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4">
            <div className="text-xs text-slate-400">Technical Performance</div>
            <div className="mt-1.5 font-display text-2xl font-bold text-sky-300 tabular-nums">
              {report.technical_avg !== null ? (
                <>
                  {report.technical_avg.toFixed(1)}{' '}
                  <span className="text-sm font-mono font-normal text-slate-400">
                    / 10 ({report.technical_count} Qs)
                  </span>
                </>
              ) : (
                <span className="text-base font-normal text-slate-400">Not included</span>
              )}
            </div>
          </div>

          <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4">
            <div className="text-xs text-slate-400">HR Performance</div>
            <div className="mt-1.5 font-display text-2xl font-bold text-violet-300 tabular-nums">
              {report.hr_avg !== null ? (
                <>
                  {report.hr_avg.toFixed(1)}{' '}
                  <span className="text-sm font-mono font-normal text-slate-400">
                    / 10 ({report.hr_count} Qs)
                  </span>
                </>
              ) : (
                <span className="text-base font-normal text-slate-400">Not included</span>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {report.strongest_question && (
          <div className="glass-surface rounded-2xl p-6 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-emerald-300">
                <Award className="h-4 w-4 shrink-0" />
                <h2 className="font-display text-base font-semibold">Strongest Answer</h2>
              </div>
              <span className="font-mono text-sm font-semibold text-emerald-300 tabular-nums">
                {report.strongest_question.score}/10
              </span>
            </div>
            <div className="text-xs text-slate-400">
              Q{report.strongest_question.question_number} · {report.strongest_question.category} ·{' '}
              {report.strongest_question.topic}
            </div>
            <p className="text-sm font-medium text-white">
              {report.strongest_question.question_text}
            </p>
            <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
              {report.strongest_question.user_answer}
            </p>
          </div>
        )}

        {report.weakest_question && (
          <div className="glass-surface rounded-2xl p-6 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-orange-300">
                <TrendingDown className="h-4 w-4 shrink-0" />
                <h2 className="font-display text-base font-semibold">Weakest Answer</h2>
              </div>
              <span className="font-mono text-sm font-semibold text-orange-300 tabular-nums">
                {report.weakest_question.score}/10
              </span>
            </div>
            <div className="text-xs text-slate-400">
              Q{report.weakest_question.question_number} · {report.weakest_question.category} ·{' '}
              {report.weakest_question.topic}
            </div>
            <p className="text-sm font-medium text-white">
              {report.weakest_question.question_text}
            </p>
            <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
              {report.weakest_question.user_answer}
            </p>
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-6 space-y-3">
          <div className="flex items-center gap-2 text-emerald-300">
            <CheckCircle2 className="h-4 w-4" />
            <h2 className="font-display text-lg font-semibold">Strongest Areas</h2>
          </div>
          <ul className="space-y-2 text-sm text-slate-200 leading-relaxed">
            {report.insights.strongest_areas.map((area, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="text-emerald-400 mt-1 text-xs">•</span>
                <span>{area}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-orange-500/30 bg-orange-950/20 p-6 space-y-3">
          <div className="flex items-center gap-2 text-orange-300">
            <AlertTriangle className="h-4 w-4" />
            <h2 className="font-display text-lg font-semibold">Areas Requiring Improvement</h2>
          </div>
          <ul className="space-y-2 text-sm text-slate-200 leading-relaxed">
            {report.insights.areas_requiring_improvement.map((area, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="text-orange-400 mt-1 text-xs">•</span>
                <span>{area}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-2 glass-surface rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-sky-300">
            <MessageSquareText className="h-4 w-4" />
            <h2 className="font-display text-lg font-semibold text-white">
              Communication Assessment
            </h2>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            {report.insights.communication_assessment}
          </p>
        </div>

        <div className="lg:col-span-3 glass-surface rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-violet-300">
            <Compass className="h-4 w-4" />
            <h2 className="font-display text-lg font-semibold text-white">
              Personalized Preparation Recommendations
            </h2>
          </div>
          <ol className="space-y-2.5 text-sm text-slate-200 leading-relaxed">
            {report.insights.personalized_recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="font-mono text-xs font-semibold text-sky-300 mt-0.5 tabular-nums">
                  0{i + 1}.
                </span>
                <span>{rec}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="glass-surface rounded-2xl p-6 space-y-4">
        <h2 className="font-display text-xl font-semibold text-white">
          Question-by-Question Review
        </h2>
        <div className="divide-y divide-slate-800/80">
          {questions.map((q) => {
            const isOpen = expandedId === q.id;
            return (
              <div key={q.id} className="py-4">
                <button
                  type="button"
                  onClick={() => setExpandedId(isOpen ? null : q.id)}
                  className="w-full flex items-center justify-between gap-4 text-left"
                >
                  <div className="min-w-0">
                    <div className="text-xs text-slate-400">
                      Question {q.question_number} · {q.category} · {q.topic}
                    </div>
                    <div className="mt-1 text-sm font-medium text-white">{q.question_text}</div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-sm font-semibold text-sky-300 tabular-nums">
                      {q.score ?? 0}/10
                    </span>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {isOpen && q.evaluation && (
                  <div className="mt-4 pt-4 border-t border-slate-800/60 space-y-4 text-sm">
                    <div>
                      <div className="text-xs font-medium text-slate-400">Your Answer</div>
                      <p className="mt-1 text-slate-200 whitespace-pre-line leading-relaxed">
                        {q.user_answer}
                      </p>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-sky-300">Sample Better Answer</div>
                      <p className="mt-1 text-slate-300 whitespace-pre-line leading-relaxed">
                        {q.evaluation.sample_better_answer}
                      </p>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-emerald-300">Key Tip</div>
                      <p className="mt-1 text-slate-300">{q.evaluation.improvement_tip}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
