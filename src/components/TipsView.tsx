import { CheckCircle2, Code2, Compass, Users } from 'lucide-react';
import { useState } from 'react';

const TIP_SECTIONS = [
  {
    id: 'technical',
    title: 'Technical Interviews',
    icon: Code2,
    points: [
      {
        heading: 'Lead with a 1-sentence definition before diving deep',
        detail:
          'Start by summarizing what the concept or architecture is in plain language, then explain how it works internally, edge cases, and practical trade-offs.',
      },
      {
        heading: 'Discuss time, space, and operational trade-offs',
        detail:
          'Strong answers explain why you would choose one approach over another (e.g., indexing vs. write throughput, caching vs. consistency).',
      },
      {
        heading: 'Anchor abstract concepts in a real scenario',
        detail:
          'When explaining databases, concurrency, or APIs, walk through a concrete request lifecycle or failure mode so interviewers see applied understanding.',
      },
    ],
  },
  {
    id: 'hr',
    title: 'HR & Behavioral Rounds',
    icon: Users,
    points: [
      {
        heading: 'Structure stories with STAR (Situation, Task, Action, Result)',
        detail:
          'Spend ~20% on context (Situation + Task), ~60% on the specific decisions and actions you personally took, and ~20% on measurable outcomes or lessons learned.',
      },
      {
        heading: 'Own challenges candidly without blaming teammates',
        detail:
          'When asked about mistakes or disagreements, highlight what you learned, how you communicated constructively, and what process changed afterward.',
      },
      {
        heading: 'Align motivation with the role',
        detail:
          'Connect your core skills and learning trajectory to the engineering or analytical problems the role solves.',
      },
    ],
  },
  {
    id: 'communication',
    title: 'Clarity & Delivery',
    icon: Compass,
    points: [
      {
        heading: 'Signpost multi-part explanations',
        detail:
          'Phrases like "There are three factors here: first..., second..., third..." keep both technical and non-technical interviewers engaged.',
      },
      {
        heading: 'Handle unfamiliar questions honestly',
        detail:
          'Never bluff. State what you know for certain, reason from first principles about what is likely, and mention what you would verify in documentation.',
      },
      {
        heading: 'Keep answers focused (60–120 seconds equivalent)',
        detail:
          'Aim for concise, complete answers rather than rambling paragraphs. Cover the core thesis, mechanism, and one concrete example.',
      },
    ],
  },
];

export function TipsView() {
  const [activeTab, setActiveTab] = useState<'technical' | 'hr' | 'communication'>('technical');
  const [starSituation, setStarSituation] = useState('');
  const [starTask, setStarTask] = useState('');
  const [starAction, setStarAction] = useState('');
  const [starResult, setStarResult] = useState('');

  const activeGuide = TIP_SECTIONS.find((s) => s.id === activeTab) || TIP_SECTIONS[0];
  const combinedStar = [
    starSituation && `Situation: ${starSituation}`,
    starTask && `Task: ${starTask}`,
    starAction && `Action: ${starAction}`,
    starResult && `Result: ${starResult}`,
  ]
    .filter(Boolean)
    .join('\n\n');

  return (
    <div className="max-w-5xl mx-auto space-y-7">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Interview Preparation Tips
        </h1>
        <p className="mt-1.5 text-sm text-slate-400">
          Proven response frameworks to raise both technical precision and behavioral clarity.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 p-1 rounded-xl bg-slate-900/90 border border-slate-800 w-fit">
        {TIP_SECTIONS.map((sec) => {
          const Icon = sec.icon;
          const active = activeTab === sec.id;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => setActiveTab(sec.id as 'technical' | 'hr' | 'communication')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                active
                  ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{sec.title}</span>
            </button>
          );
        })}
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {activeGuide.points.map((pt, idx) => (
          <div key={idx} className="glass-surface rounded-2xl p-6 space-y-2.5">
            <div className="text-xs font-mono text-sky-300 tabular-nums">0{idx + 1}.</div>
            <h2 className="font-display text-base font-semibold text-white">{pt.heading}</h2>
            <p className="text-sm text-slate-300 leading-relaxed">{pt.detail}</p>
          </div>
        ))}
      </section>

      <section className="glass-surface-elevated rounded-2xl p-6 sm:p-7 space-y-5">
        <div>
          <h2 className="font-display text-xl font-semibold text-white">
            Interactive STAR Behavioral Outline Builder
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Draft a behavioral story using the four STAR pillars before practicing in an HR or
            Mixed mock interview.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="star-s" className="block text-xs font-medium text-slate-300">
              Situation (Context & Challenge)
            </label>
            <textarea
              id="star-s"
              rows={2}
              value={starSituation}
              onChange={(e) => setStarSituation(e.target.value)}
              placeholder="Where were you working/studying and what problem emerged?"
              className="mt-1.5 w-full rounded-xl bg-slate-950/75 border border-slate-700/80 p-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div>
            <label htmlFor="star-t" className="block text-xs font-medium text-slate-300">
              Task (Your Responsibility)
            </label>
            <textarea
              id="star-t"
              rows={2}
              value={starTask}
              onChange={(e) => setStarTask(e.target.value)}
              placeholder="What specific goal or constraint were you accountable for?"
              className="mt-1.5 w-full rounded-xl bg-slate-950/75 border border-slate-700/80 p-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div>
            <label htmlFor="star-a" className="block text-xs font-medium text-slate-300">
              Action (Steps You Personally Took)
            </label>
            <textarea
              id="star-a"
              rows={2}
              value={starAction}
              onChange={(e) => setStarAction(e.target.value)}
              placeholder="What technical or communication actions did you take?"
              className="mt-1.5 w-full rounded-xl bg-slate-950/75 border border-slate-700/80 p-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
          <div>
            <label htmlFor="star-r" className="block text-xs font-medium text-slate-300">
              Result (Outcome & Reflection)
            </label>
            <textarea
              id="star-r"
              rows={2}
              value={starResult}
              onChange={(e) => setStarResult(e.target.value)}
              placeholder="What changed as a result, and what did you learn?"
              className="mt-1.5 w-full rounded-xl bg-slate-950/75 border border-slate-700/80 p-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>

        {combinedStar && (
          <div className="rounded-xl border border-emerald-500/25 bg-emerald-950/15 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Combined Behavioral Draft Preview</span>
            </div>
            <p className="text-sm text-slate-200 whitespace-pre-line leading-relaxed">
              {combinedStar}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
