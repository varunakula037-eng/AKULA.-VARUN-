import { Loader2, PlayCircle, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import type {
  DifficultyLevel,
  ExperienceLevel,
  InterviewConfig,
  InterviewType,
} from '../types.ts';

const JOB_ROLES = [
  'Python Developer',
  'Java Developer',
  'C Developer',
  'Web Developer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Analyst',
  'Data Scientist',
  'AI/ML Engineer',
  'Software Engineer',
  'Cloud Engineer',
  'Cybersecurity Analyst',
  'DevOps Engineer',
  'Custom Job Role',
];

const EXPERIENCE_LEVELS: ExperienceLevel[] = ['Fresher', 'Experienced'];
const DIFFICULTY_LEVELS: DifficultyLevel[] = ['Easy', 'Medium', 'Hard'];
const INTERVIEW_TYPES: InterviewType[] = ['Technical', 'HR', 'Mixed (Technical + HR)'];
const QUESTION_COUNTS: Array<5 | 10 | 15> = [5, 10, 15];

interface ConfigureInterviewViewProps {
  onStartInterview: (config: InterviewConfig) => Promise<void>;
  submitting: boolean;
  error: string | null;
}

export function ConfigureInterviewView({
  onStartInterview,
  submitting,
  error,
}: ConfigureInterviewViewProps) {
  const [selectedRole, setSelectedRole] = useState<string>('Full Stack Developer');
  const [customRole, setCustomRole] = useState<string>('');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('Fresher');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Medium');
  const [interviewType, setInterviewType] = useState<InterviewType>('Mixed (Technical + HR)');
  const [questionCount, setQuestionCount] = useState<5 | 10 | 15>(5);
  const [skills, setSkills] = useState<string>('');
  const [technologies, setTechnologies] = useState<string>('');
  const [yearsExperience, setYearsExperience] = useState<string>('');
  const [focusTopics, setFocusTopics] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const isCustomRole = selectedRole === 'Custom Job Role';
  const effectiveRole = isCustomRole ? customRole.trim() : selectedRole;

  const techCount =
    interviewType === 'Technical'
      ? questionCount
      : interviewType === 'HR'
        ? 0
        : Math.round(questionCount * 0.6);
  const hrCount = questionCount - techCount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveRole) {
      setValidationError('Please enter your custom job role before starting.');
      return;
    }
    setValidationError(null);
    await onStartInterview({
      jobRole: effectiveRole,
      experienceLevel,
      difficulty,
      interviewType,
      questionCount,
      skills,
      technologies,
      yearsExperience,
      focusTopics,
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Configure Your Mock Interview
        </h1>
        <p className="mt-1.5 text-sm text-slate-400">
          Customize the role, difficulty, question mix, and optional skills context. Gemini AI will
          generate a structured interview tailored to your profile.
        </p>
      </div>

      {(validationError || error) && (
        <div className="rounded-xl border border-rose-500/35 bg-rose-950/35 px-4 py-3 text-sm text-rose-200">
          {validationError || error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 glass-surface rounded-2xl p-6 space-y-6">
          <div>
            <label htmlFor="job-role" className="block text-sm font-medium text-slate-200">
              A. Job Role
            </label>
            <select
              id="job-role"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              disabled={submitting}
              className="mt-2 w-full rounded-xl bg-slate-900/90 border border-slate-700/80 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              {JOB_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>

            {isCustomRole && (
              <div className="mt-3">
                <label htmlFor="custom-role" className="block text-xs font-medium text-slate-400">
                  Enter Custom Job Role
                </label>
                <input
                  id="custom-role"
                  type="text"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  placeholder="e.g., Embedded Systems Engineer, Product Analyst, QA Lead"
                  disabled={submitting}
                  className="mt-1.5 w-full rounded-xl bg-slate-900/90 border border-slate-700/80 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <span className="block text-sm font-medium text-slate-200">B. Experience Level</span>
              <div className="mt-2 grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-800">
                {EXPERIENCE_LEVELS.map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    disabled={submitting}
                    onClick={() => setExperienceLevel(lvl)}
                    className={`py-2 px-3 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                      experienceLevel === lvl
                        ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-sm'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="block text-sm font-medium text-slate-200">
                C. Interview Difficulty
              </span>
              <div className="mt-2 grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-800">
                {DIFFICULTY_LEVELS.map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    disabled={submitting}
                    onClick={() => setDifficulty(diff)}
                    className={`py-2 px-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                      difficulty === diff
                        ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-sm'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <span className="block text-sm font-medium text-slate-200">D. Interview Type</span>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-800">
              {INTERVIEW_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  disabled={submitting}
                  onClick={() => setInterviewType(type)}
                  className={`py-2.5 px-3 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    interviewType === type
                      ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="block text-sm font-medium text-slate-200">
              E. Number of Questions
            </span>
            <div className="mt-2 grid grid-cols-3 gap-2 p-1 rounded-xl bg-slate-900/90 border border-slate-800 max-w-sm">
              {QUESTION_COUNTS.map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  disabled={submitting}
                  onClick={() => setQuestionCount(cnt)}
                  className={`py-2 px-3 rounded-lg text-xs font-medium tabular-nums transition-colors whitespace-nowrap ${
                    questionCount === cnt
                      ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {cnt} Questions
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 space-y-4">
            <div>
              <h2 className="text-sm font-medium text-slate-200">F. Optional Context</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Provide additional background so questions align closely with your preparation goals.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="skills" className="block text-xs font-medium text-slate-300">
                  Skills You Know
                </label>
                <input
                  id="skills"
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  disabled={submitting}
                  placeholder="e.g., REST APIs, OOP, SQL Optimization"
                  className="mt-1.5 w-full rounded-xl bg-slate-900/90 border border-slate-700/80 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label htmlFor="technologies" className="block text-xs font-medium text-slate-300">
                  Technologies / Stack
                </label>
                <input
                  id="technologies"
                  type="text"
                  value={technologies}
                  onChange={(e) => setTechnologies(e.target.value)}
                  disabled={submitting}
                  placeholder="e.g., React, Node.js, PostgreSQL, Docker"
                  className="mt-1.5 w-full rounded-xl bg-slate-900/90 border border-slate-700/80 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label htmlFor="years-exp" className="block text-xs font-medium text-slate-300">
                  Years of Experience
                </label>
                <input
                  id="years-exp"
                  type="text"
                  value={yearsExperience}
                  onChange={(e) => setYearsExperience(e.target.value)}
                  disabled={submitting}
                  placeholder="e.g., 0 (Recent Grad) or 3 years"
                  className="mt-1.5 w-full rounded-xl bg-slate-900/90 border border-slate-700/80 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label htmlFor="focus-topics" className="block text-xs font-medium text-slate-300">
                  Specific Topics to Practice
                </label>
                <input
                  id="focus-topics"
                  type="text"
                  value={focusTopics}
                  onChange={(e) => setFocusTopics(e.target.value)}
                  disabled={submitting}
                  placeholder="e.g., Concurrency, System Design, Conflict Resolution"
                  className="mt-1.5 w-full rounded-xl bg-slate-900/90 border border-slate-700/80 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>
          </div>
        </div>

        <aside className="glass-surface-elevated rounded-2xl p-6 space-y-5 lg:sticky lg:top-6">
          <div className="flex items-center gap-2.5 text-sky-300">
            <SlidersHorizontal className="h-4 w-4" />
            <h2 className="font-display text-base font-semibold text-white">Session Blueprint</h2>
          </div>

          <dl className="space-y-3 text-sm border-t border-b border-slate-800/80 py-4">
            <div className="flex justify-between gap-3">
              <dt className="text-slate-400">Role</dt>
              <dd className="text-white font-medium text-right truncate max-w-[180px]">
                {effectiveRole || 'Custom role'}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-400">Level</dt>
              <dd className="text-white font-medium">{experienceLevel}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-400">Difficulty</dt>
              <dd className="text-white font-medium">{difficulty}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-400">Question Mix</dt>
              <dd className="text-white font-medium text-right tabular-nums">
                {techCount > 0 && hrCount > 0
                  ? `${techCount} Technical · ${hrCount} HR`
                  : techCount > 0
                    ? `${techCount} Technical`
                    : `${hrCount} HR`}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-400">Total Questions</dt>
              <dd className="text-sky-300 font-mono font-semibold tabular-nums">{questionCount}</dd>
            </div>
          </dl>

          <p className="text-xs text-slate-400 leading-relaxed">
            Sample answers remain hidden until you submit your own response. Progress is
            automatically saved as you move between questions.
          </p>

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-violet-950/50 transition-all whitespace-nowrap"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating Questions...</span>
              </>
            ) : (
              <>
                <PlayCircle className="h-4 w-4" />
                <span>Start Interview</span>
              </>
            )}
          </button>
        </aside>
      </form>
    </div>
  );
}
