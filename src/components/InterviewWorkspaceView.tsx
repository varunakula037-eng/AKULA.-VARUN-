import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eraser,
  FileCheck2,
  Lightbulb,
  Loader2,
  MessageSquareText,
  Send,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { saveDraft } from '../api.ts';
import type { InterviewQuestion, InterviewSession } from '../types.ts';
import { CircularScore } from './CircularScore.tsx';

interface InterviewWorkspaceViewProps {
  session: InterviewSession;
  onEvaluateAnswer: (questionId: number, answer: string) => Promise<InterviewQuestion>;
  onCompleteInterview: () => Promise<void>;
  onUpdateQuestionLocal: (question: InterviewQuestion) => void;
  completing: boolean;
}

export function InterviewWorkspaceView({
  session,
  onEvaluateAnswer,
  onCompleteInterview,
  onUpdateQuestionLocal,
  completing,
}: InterviewWorkspaceViewProps) {
  const questions = session.questions ?? [];
  const firstUnansweredIdx = questions.findIndex((q) => q.score === null);
  const [currentIndex, setCurrentIndex] = useState<number>(
    firstUnansweredIdx >= 0 ? firstUnansweredIdx : 0
  );
  const [drafts, setDrafts] = useState<Record<number, string>>(() => {
    const initial: Record<number, string> = {};
    for (const q of questions) {
      initial[q.id] = q.user_answer || '';
    }
    return initial;
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const draftTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setDrafts((prev) => {
      const next = { ...prev };
      for (const q of questions) {
        if (next[q.id] === undefined) {
          next[q.id] = q.user_answer || '';
        }
      }
      return next;
    });
  }, [questions]);

  const currentQuestion = questions[currentIndex];
  const answeredCount = questions.filter((q) => q.score !== null).length;
  const allAnswered = questions.length > 0 && answeredCount === questions.length;
  const progressPct = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  if (!currentQuestion) {
    return (
      <div className="glass-surface rounded-2xl p-8 text-center">
        <p className="text-slate-300">No questions found for this interview session.</p>
      </div>
    );
  }

  const currentText = drafts[currentQuestion.id] ?? '';
  const wordCount = currentText.trim() ? currentText.trim().split(/\s+/).length : 0;

  const persistDraft = (questionId: number, value: string) => {
    if (draftTimerRef.current) {
      window.clearTimeout(draftTimerRef.current);
    }
    draftTimerRef.current = window.setTimeout(() => {
      saveDraft(session.id, questionId, value).catch(() => {
        // Silent background draft sync
      });
    }, 500);
  };

  const handleAnswerChange = (value: string) => {
    setError(null);
    setDrafts((prev) => ({ ...prev, [currentQuestion.id]: value }));
    onUpdateQuestionLocal({ ...currentQuestion, user_answer: value });
    persistDraft(currentQuestion.id, value);
  };

  const handleClearAnswer = () => {
    setError(null);
    setDrafts((prev) => ({ ...prev, [currentQuestion.id]: '' }));
    onUpdateQuestionLocal({ ...currentQuestion, user_answer: '' });
    saveDraft(session.id, currentQuestion.id, '').catch(() => {});
  };

  const handleSubmit = async () => {
    const trimmed = currentText.trim();
    if (!trimmed) {
      setError('Please enter your answer before submitting for evaluation.');
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const updated = await onEvaluateAnswer(currentQuestion.id, trimmed);
      setDrafts((prev) => ({ ...prev, [updated.id]: updated.user_answer || trimmed }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to evaluate answer.');
    } finally {
      setSubmitting(false);
    }
  };

  const goToIndex = (nextIdx: number) => {
    if (nextIdx < 0 || nextIdx >= questions.length) return;
    setError(null);
    setCurrentIndex(nextIdx);
  };

  const evalData = currentQuestion.evaluation;
  const isEvaluated = currentQuestion.score !== null && evalData !== null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <section className="glass-surface rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="font-medium text-sky-300">{session.job_role}</span>
              <span aria-hidden="true">·</span>
              <span>{session.experience_level}</span>
              <span aria-hidden="true">·</span>
              <span>{session.interview_type}</span>
            </div>
            <h1 className="mt-1 font-display text-xl sm:text-2xl font-bold text-white tabular-nums">
              Question {currentQuestion.question_number} of {questions.length}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-slate-400">Session Progress</div>
              <div className="font-mono text-sm font-semibold text-white tabular-nums">
                {answeredCount}/{questions.length} evaluated ({progressPct}%)
              </div>
            </div>
          </div>
        </div>

        <div className="w-full h-2 rounded-full bg-slate-800/90 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-sky-400 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          {questions.map((q, idx) => {
            const active = idx === currentIndex;
            const done = q.score !== null;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => goToIndex(idx)}
                className={`h-8 min-w-8 px-2.5 rounded-lg text-xs font-mono font-medium tabular-nums transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-sm'
                    : done
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25'
                      : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'
                }`}
              >
                {q.question_number}
              </button>
            );
          })}
        </div>
      </section>

      <section className="glass-surface-elevated rounded-2xl p-6 sm:p-7 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span
              className={`font-semibold ${
                currentQuestion.category === 'Technical' ? 'text-sky-300' : 'text-violet-300'
              }`}
            >
              {currentQuestion.category} Question
            </span>
            <span className="text-slate-600" aria-hidden="true">
              ·
            </span>
            <span className="text-slate-300">{currentQuestion.difficulty} Difficulty</span>
            <span className="text-slate-600" aria-hidden="true">
              ·
            </span>
            <span className="text-slate-400">{currentQuestion.topic}</span>
          </div>

          {isEvaluated && (
            <span className="text-xs font-medium text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Evaluated ({currentQuestion.score}/10)</span>
            </span>
          )}
        </div>

        <h2 className="font-display text-lg sm:text-xl font-semibold text-white leading-relaxed">
          {currentQuestion.question_text}
        </h2>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="answer-textarea" className="text-xs font-medium text-slate-300">
              Your Answer
            </label>
            <span className="text-xs font-mono text-slate-400 tabular-nums">
              {wordCount} {wordCount === 1 ? 'word' : 'words'} · {currentText.length} chars
            </span>
          </div>

          <textarea
            id="answer-textarea"
            value={currentText}
            onChange={(e) => handleAnswerChange(e.target.value)}
            disabled={submitting}
            rows={7}
            placeholder="Write a clear, structured response. For technical prompts, explain how it works, edge cases, and trade-offs. For HR prompts, use Situation, Task, Action, and Result..."
            className="w-full rounded-xl bg-slate-950/75 border border-slate-700/80 p-4 text-sm sm:text-base text-slate-100 placeholder:text-slate-500 leading-relaxed focus:outline-none focus:ring-2 focus:ring-violet-500 resize-y min-h-[190px]"
          />
        </div>

        {error && (
          <div className="rounded-xl border border-rose-500/35 bg-rose-950/35 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-2.5">
            {currentIndex > 0 && (
              <button
                type="button"
                onClick={() => goToIndex(currentIndex - 1)}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium text-slate-200 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 transition-colors whitespace-nowrap"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous Question</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleClearAnswer}
              disabled={submitting || !currentText}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium text-slate-300 bg-slate-900/70 hover:bg-slate-800 border border-slate-800 disabled:opacity-45 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
            >
              <Eraser className="h-3.5 w-3.5" />
              <span>Clear Answer</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || !currentText.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-violet-950/50 transition-all whitespace-nowrap"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Evaluating Answer...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>{isEvaluated ? 'Re-Evaluate Answer' : 'Submit Answer'}</span>
                </>
              )}
            </button>

            {currentIndex < questions.length - 1 && (
              <button
                type="button"
                onClick={() => goToIndex(currentIndex + 1)}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium text-slate-200 bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 transition-colors whitespace-nowrap"
              >
                <span>Next Question</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            )}

            {allAnswered && (
              <button
                type="button"
                onClick={onCompleteInterview}
                disabled={completing || submitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-60 transition-colors whitespace-nowrap"
              >
                {completing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Generating Report...</span>
                  </>
                ) : (
                  <>
                    <FileCheck2 className="h-4 w-4" />
                    <span>View Final Report</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </section>

      {!isEvaluated && (
        <div className="glass-surface rounded-2xl px-6 py-4 text-xs text-slate-400 flex items-center gap-3">
          <Sparkles className="h-4 w-4 text-violet-400 shrink-0" />
          <span>
            Submit your own answer to unlock Gemini AI scoring, missing concept analysis, and a
            stronger sample answer.
          </span>
        </div>
      )}

      {isEvaluated && evalData && (
        <section
          aria-label="Answer Feedback Dashboard"
          className="glass-surface rounded-2xl p-6 sm:p-7 space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wider text-sky-300">
                Answer Evaluation
              </p>
              <h3 className="font-display text-2xl font-bold text-white">
                Detailed Feedback Dashboard
              </h3>
              <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
                Evaluated on technical correctness, relevance, completeness, clarity, and
                communication quality for {session.experience_level} level.
              </p>
            </div>

            <div className="flex items-center justify-center sm:justify-end">
              <CircularScore
                score={evalData.score}
                maxScore={10}
                size={112}
                label={evalData.rating}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/25 p-5 space-y-3">
              <div className="flex items-center gap-2 text-emerald-300">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <h4 className="font-display text-base font-semibold">What You Did Well</h4>
              </div>
              <ul className="space-y-2 text-sm text-emerald-100/90 leading-relaxed">
                {evalData.what_was_good.map((point, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="text-emerald-400 mt-1 text-xs">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-orange-500/30 bg-orange-950/25 p-5 space-y-3">
              <div className="flex items-center gap-2 text-orange-300">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <h4 className="font-display text-base font-semibold">What Was Missing</h4>
              </div>
              <ul className="space-y-2 text-sm text-orange-100/90 leading-relaxed">
                {evalData.what_was_missing.map((point, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="text-orange-400 mt-1 text-xs">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-2">
              <div className="flex items-center gap-2 text-sky-300">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <h4 className="font-display text-base font-semibold text-white">
                  Technical Accuracy
                </h4>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {evalData.technical_accuracy}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-2">
              <div className="flex items-center gap-2 text-violet-300">
                <MessageSquareText className="h-4 w-4 shrink-0" />
                <h4 className="font-display text-base font-semibold text-white">
                  Communication Feedback
                </h4>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {evalData.communication_feedback}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-violet-500/30 bg-violet-950/20 p-5 space-y-2.5">
            <h4 className="font-display text-base font-semibold text-white">
              Sample Better Answer
            </h4>
            <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
              {evalData.sample_better_answer}
            </p>
          </div>

          <div className="rounded-2xl border border-sky-500/30 bg-sky-950/20 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-sky-300 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-white">Improvement Tip for Next Answer</h4>
                <p className="mt-1 text-sm text-slate-300 leading-relaxed">
                  {evalData.improvement_tip}
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              {currentIndex < questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => goToIndex(currentIndex + 1)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 transition-all whitespace-nowrap"
                >
                  <span>Next Question</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : allAnswered ? (
                <button
                  type="button"
                  onClick={onCompleteInterview}
                  disabled={completing}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-60 transition-colors whitespace-nowrap"
                >
                  {completing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Generating Report...</span>
                    </>
                  ) : (
                    <>
                      <FileCheck2 className="h-4 w-4" />
                      <span>Generate Final Report</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const nextOpen = questions.findIndex((q) => q.score === null);
                    if (nextOpen >= 0) goToIndex(nextOpen);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors whitespace-nowrap"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Jump to Unanswered</span>
                </button>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
