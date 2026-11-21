import { BarChart3, PlayCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { fetchAnalytics } from '../api.ts';
import type { AnalyticsData } from '../types.ts';

interface AnalyticsViewProps {
  onStartNew: () => void;
}

export function AnalyticsView({ onStartNew }: AnalyticsViewProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchAnalytics()
      .then((res) => setData(res))
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Failed to load analytics data.')
      )
      .finally(() => setLoading(false));
  }, []);

  const hasSessions = (data?.scoreProgression.length ?? 0) > 0;
  const hasTopicData = (data?.topicPerformance.length ?? 0) > 0;

  const categoryChartData = data
    ? [
        {
          category: 'Technical',
          average: data.categoryComparison.technicalAverage ?? 0,
          count: data.categoryComparison.technicalCount,
        },
        {
          category: 'HR / Behavioral',
          average: data.categoryComparison.hrAverage ?? 0,
          count: data.categoryComparison.hrCount,
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Performance Analytics
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Track score progression, technical vs. behavioral balance, and topic mastery across your
          saved sessions.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/35 bg-rose-950/35 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="glass-surface rounded-2xl h-80 animate-pulse" />
          ))}
        </div>
      ) : !hasSessions && !hasTopicData ? (
        <div className="glass-surface rounded-2xl py-16 px-6 text-center max-w-lg mx-auto">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800/80 border border-slate-700/60 text-sky-300">
            <BarChart3 className="h-5 w-5" />
          </div>
          <h2 className="mt-4 font-display text-xl font-semibold text-white">
            Analytics unlock after your first interview
          </h2>
          <p className="mt-2 text-sm text-slate-400 leading-relaxed">
            Complete a mock interview session to view real score trends, Technical vs. HR
            comparisons, and topic-level strengths.
          </p>
          <button
            type="button"
            onClick={onStartNew}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 transition-all whitespace-nowrap"
          >
            <PlayCircle className="h-4 w-4" />
            <span>Start Mock Interview</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="glass-surface rounded-2xl p-6 space-y-4">
            <div>
              <h2 className="font-display text-lg font-semibold text-white">
                Overall Score Progression
              </h2>
              <p className="text-xs text-slate-400">
                Completed session scores out of 100 over time
              </p>
            </div>
            {data && data.scoreProgression.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.scoreProgression}>
                    <defs>
                      <linearGradient id="scoreAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.45} />
                        <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                    <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} />
                    <YAxis domain={[0, 100]} stroke="#94A3B8" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        border: '1px solid rgba(148,163,184,0.25)',
                        borderRadius: '12px',
                        color: '#F8FAFC',
                        fontSize: '12px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="overallScore"
                      name="Overall Score (/100)"
                      stroke="#38BDF8"
                      strokeWidth={2.5}
                      fill="url(#scoreAreaGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-sm text-slate-400">
                Complete a full interview session to plot overall score progression.
              </div>
            )}
          </section>

          <section className="glass-surface rounded-2xl p-6 space-y-4">
            <div>
              <h2 className="font-display text-lg font-semibold text-white">
                Technical vs. HR Performance
              </h2>
              <p className="text-xs text-slate-400">
                Average question score out of 10 by interview category
              </p>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                  <XAxis dataKey="category" stroke="#94A3B8" fontSize={12} />
                  <YAxis domain={[0, 10]} stroke="#94A3B8" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      border: '1px solid rgba(148,163,184,0.25)',
                      borderRadius: '12px',
                      color: '#F8FAFC',
                      fontSize: '12px',
                    }}
                  />
                  <Bar
                    dataKey="average"
                    name="Average Score (/10)"
                    fill="#7C3AED"
                    radius={[8, 8, 0, 0]}
                    barSize={56}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="glass-surface rounded-2xl p-6 space-y-4">
            <div>
              <h2 className="font-display text-lg font-semibold text-white">
                Performance by Topic
              </h2>
              <p className="text-xs text-slate-400">
                Top evaluated topics ranked by average score (out of 10)
              </p>
            </div>
            {data && data.topicPerformance.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.topicPerformance} layout="vertical" margin={{ left: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                    <XAxis type="number" domain={[0, 10]} stroke="#94A3B8" fontSize={12} />
                    <YAxis
                      type="category"
                      dataKey="topic"
                      stroke="#CBD5E1"
                      fontSize={11}
                      width={120}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        border: '1px solid rgba(148,163,184,0.25)',
                        borderRadius: '12px',
                        color: '#F8FAFC',
                        fontSize: '12px',
                      }}
                    />
                    <Bar
                      dataKey="averageScore"
                      name="Avg Score (/10)"
                      fill="#2563EB"
                      radius={[0, 8, 8, 0]}
                      barSize={18}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-sm text-slate-400">
                No topic scores recorded yet.
              </div>
            )}
          </section>

          <section className="glass-surface rounded-2xl p-6 space-y-4">
            <div>
              <h2 className="font-display text-lg font-semibold text-white">
                Question Score Distribution
              </h2>
              <p className="text-xs text-slate-400">
                Number of evaluated answers across scoring tiers
              </p>
            </div>
            {data ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.scoreDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                    <XAxis dataKey="band" stroke="#94A3B8" fontSize={11} />
                    <YAxis allowDecimals={false} stroke="#94A3B8" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        border: '1px solid rgba(148,163,184,0.25)',
                        borderRadius: '12px',
                        color: '#F8FAFC',
                        fontSize: '12px',
                      }}
                    />
                    <Bar
                      dataKey="count"
                      name="Answers"
                      fill="#38BDF8"
                      radius={[8, 8, 0, 0]}
                      barSize={38}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : null}
          </section>
        </div>
      )}
    </div>
  );
}
