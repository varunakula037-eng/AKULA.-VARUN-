import { Cpu, Database, FileText, PlayCircle, ShieldCheck } from 'lucide-react';

interface AboutViewProps {
  onStartNew: () => void;
}

const RUBRIC_ROWS = [
  { band: '9 – 10', rating: 'Excellent', desc: 'Accurate, thorough, clear, and well-structured with concrete reasoning.' },
  { band: '7 – 8', rating: 'Good', desc: 'Strong core answer with only minor missing nuances or examples.' },
  { band: '5 – 6', rating: 'Average', desc: 'Covers basic ideas at a high level but lacks depth or completeness.' },
  { band: '3 – 4', rating: 'Needs Improvement', desc: 'Superficial, unclear, or contains notable conceptual gaps.' },
  { band: '0 – 2', rating: 'Poor', desc: 'Off-topic, overly brief, or fundamentally inaccurate.' },
];

export function AboutView({ onStartNew }: AboutViewProps) {
  return (
    <div className="max-w-5xl mx-auto space-y-7">
      <section className="glass-surface-elevated rounded-2xl p-6 sm:p-8 space-y-4">
        <p className="text-xs font-medium uppercase tracking-wider text-sky-300">
          About INTERVIEWX AI
        </p>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
          Practice Smart. Speak Confidently. Get Hired.
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
          INTERVIEWX AI is built to help students and job seekers bridge the gap between studying
          concepts and articulating clear answers under interview pressure. Every session pairs
          role-specific question generation with constructive, rubric-driven evaluation.
        </p>
        <div className="pt-2">
          <button
            type="button"
            onClick={onStartNew}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 transition-all whitespace-nowrap"
          >
            <PlayCircle className="h-4 w-4" />
            <span>Start a Mock Interview</span>
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="glass-surface rounded-2xl p-6 space-y-2.5">
          <div className="flex items-center gap-2 text-sky-300">
            <Cpu className="h-4 w-4" />
            <h2 className="font-display text-base font-semibold text-white">
              Dynamic Gemini AI Engine
            </h2>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            Questions and evaluations are generated dynamically via Google Gemini with strict JSON
            schemas, calibrated separately for Fresher and Experienced expectations.
          </p>
        </div>

        <div className="glass-surface rounded-2xl p-6 space-y-2.5">
          <div className="flex items-center gap-2 text-violet-300">
            <ShieldCheck className="h-4 w-4" />
            <h2 className="font-display text-base font-semibold text-white">
              Fair & Unbiased Evaluation
            </h2>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            Sample better answers stay hidden until you submit your own response. Multiple valid
            technical approaches are accepted without demanding rote phrasing.
          </p>
        </div>

        <div className="glass-surface rounded-2xl p-6 space-y-2.5">
          <div className="flex items-center gap-2 text-emerald-300">
            <Database className="h-4 w-4" />
            <h2 className="font-display text-base font-semibold text-white">
              Persistent SQLite History
            </h2>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            Draft answers, scores, and completed reports are saved in SQLite so you can navigate
            between questions safely and track long-term growth.
          </p>
        </div>

        <div className="glass-surface rounded-2xl p-6 space-y-2.5">
          <div className="flex items-center gap-2 text-blue-300">
            <FileText className="h-4 w-4" />
            <h2 className="font-display text-base font-semibold text-white">
              Downloadable PDF Reports
            </h2>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            Export any completed interview into a formatted PDF report containing overall scores,
            strongest and weakest responses, and a personalized study plan.
          </p>
        </div>
      </section>

      <section className="glass-surface rounded-2xl p-6 space-y-4">
        <h2 className="font-display text-xl font-semibold text-white">Evaluation Scoring Rubric</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-xs text-slate-400">
                <th className="py-2.5 pr-4">Score Band</th>
                <th className="py-2.5 pr-4">Rating</th>
                <th className="py-2.5">Criteria</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {RUBRIC_ROWS.map((row) => (
                <tr key={row.band}>
                  <td className="py-3 pr-4 font-mono text-sky-300 tabular-nums whitespace-nowrap">
                    {row.band}
                  </td>
                  <td className="py-3 pr-4 font-medium text-white whitespace-nowrap">
                    {row.rating}
                  </td>
                  <td className="py-3 text-slate-300">{row.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
