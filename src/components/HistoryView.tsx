import { Download, History, PlayCircle, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { deleteInterview, fetchInterviews, getPdfDownloadUrl } from '../api.ts';
import type { InterviewSession } from '../types.ts';

interface HistoryViewProps {
  onOpenSession: (session: InterviewSession) => void;
  onStartNew: () => void;
  onDataChanged: () => void;
}

export function HistoryView({
  onOpenSession,
  onStartNew,
  onDataChanged,
}: HistoryViewProps) {
  const [interviews, setInterviews] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchInterviews({
        search,
        status: statusFilter,
        type: typeFilter,
      });
      setInterviews(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load interview history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadHistory();
    }, 150);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, typeFilter]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteInterview(id);
      setConfirmDeleteId(null);
      setInterviews((prev) => prev.filter((item) => item.id !== id));
      onDataChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete session.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Interview History
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Browse past mock interviews, resume incomplete sessions, or export PDF reports.
          </p>
        </div>

        <button
          type="button"
          onClick={onStartNew}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 transition-all whitespace-nowrap shrink-0"
        >
          <PlayCircle className="h-4 w-4" />
          <span>New Mock Interview</span>
        </button>
      </div>

      <div className="glass-surface rounded-2xl p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by job role, skills, or topics..."
            className="w-full rounded-xl bg-slate-900/90 border border-slate-700/80 pl-10 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter by status"
          className="rounded-xl bg-slate-900/90 border border-slate-700/80 px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          <option value="all">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="in_progress">In Progress</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          aria-label="Filter by interview type"
          className="rounded-xl bg-slate-900/90 border border-slate-700/80 px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          <option value="all">All Types</option>
          <option value="Technical">Technical</option>
          <option value="HR">HR</option>
          <option value="Mixed (Technical + HR)">Mixed (Technical + HR)</option>
        </select>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/35 bg-rose-950/35 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      <div className="glass-surface rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-14 rounded-xl bg-slate-800/40 animate-pulse" />
            ))}
          </div>
        ) : interviews.length === 0 ? (
          <div className="py-14 px-6 text-center max-w-md mx-auto">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800/80 border border-slate-700/60 text-sky-300">
              <History className="h-5 w-5" />
            </div>
            <h2 className="mt-4 font-display text-lg font-semibold text-white">
              No matching interviews found
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              {search || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your search or filter selections.'
                : 'Start a mock interview session to build your practice history.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 text-xs font-medium text-slate-400">
                  <th className="py-3.5 px-5">Role & Configuration</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Progress</th>
                  <th className="py-3.5 px-4 text-right">Score</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-sm">
                {interviews.map((item) => {
                  const isCompleted = item.status === 'completed';
                  const dateStr = new Date(item.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/25 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="font-medium text-white">{item.job_role}</div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {item.experience_level} · {item.difficulty}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                        {item.interview_type}
                      </td>
                      <td className="py-3.5 px-4 tabular-nums">
                        <span className="text-slate-200 font-mono text-xs">
                          {item.answered_count}/{item.question_count}
                        </span>
                        <span className="ml-2 text-xs text-slate-400">
                          {isCompleted ? 'Completed' : 'In Progress'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                        {isCompleted && item.overall_score !== null ? (
                          <span className="font-semibold text-emerald-300">
                            {Math.round(item.overall_score)}/100
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-400 whitespace-nowrap">
                        {dateStr}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => onOpenSession(item)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 border border-slate-700/80 transition-colors whitespace-nowrap"
                          >
                            {isCompleted ? 'View Report' : 'Resume'}
                          </button>

                          {isCompleted && (
                            <a
                              href={getPdfDownloadUrl(item.id)}
                              title="Download PDF Report"
                              aria-label={`Download PDF report for ${item.job_role}`}
                              className="p-1.5 rounded-lg text-slate-300 hover:text-white bg-slate-800/70 hover:bg-slate-700 border border-slate-700/80 transition-colors"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          )}

                          {confirmDeleteId === item.id ? (
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                disabled={deletingId === item.id}
                                onClick={() => handleDelete(item.id)}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 transition-colors whitespace-nowrap"
                              >
                                Confirm
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-2 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(item.id)}
                              title="Delete session"
                              aria-label={`Delete ${item.job_role} session`}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
