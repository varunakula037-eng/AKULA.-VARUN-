import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import type {
  AnswerEvaluation,
  AnalyticsData,
  DashboardData,
  DifficultyLevel,
  ExperienceLevel,
  InterviewQuestion,
  InterviewReport,
  InterviewSession,
  InterviewType,
  QuestionCategory,
} from '../src/types.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'interviewx.db');
const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS interviews (
    id TEXT PRIMARY KEY,
    job_role TEXT NOT NULL,
    experience_level TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    interview_type TEXT NOT NULL,
    question_count INTEGER NOT NULL,
    skills TEXT DEFAULT '',
    technologies TEXT DEFAULT '',
    years_experience TEXT DEFAULT '',
    focus_topics TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'in_progress',
    overall_score REAL,
    average_score REAL,
    technical_avg REAL,
    hr_avg REAL,
    report_json TEXT,
    created_at TEXT NOT NULL,
    completed_at TEXT
  );

  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    interview_id TEXT NOT NULL,
    question_number INTEGER NOT NULL,
    category TEXT NOT NULL,
    question_text TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    topic TEXT NOT NULL,
    user_answer TEXT,
    score INTEGER,
    rating TEXT,
    evaluation_json TEXT,
    answered_at TEXT,
    FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_questions_interview_id ON questions(interview_id);
  CREATE INDEX IF NOT EXISTS idx_interviews_created_at ON interviews(created_at DESC);
`);

interface RawInterviewRow {
  id: string;
  job_role: string;
  experience_level: string;
  difficulty: string;
  interview_type: string;
  question_count: number;
  skills: string;
  technologies: string;
  years_experience: string;
  focus_topics: string;
  status: string;
  overall_score: number | null;
  average_score: number | null;
  technical_avg: number | null;
  hr_avg: number | null;
  report_json: string | null;
  created_at: string;
  completed_at: string | null;
  answered_count?: number;
}

interface RawQuestionRow {
  id: number;
  interview_id: string;
  question_number: number;
  category: string;
  question_text: string;
  difficulty: string;
  topic: string;
  user_answer: string | null;
  score: number | null;
  rating: string | null;
  evaluation_json: string | null;
  answered_at: string | null;
}

function mapQuestionRow(row: RawQuestionRow): InterviewQuestion {
  let evaluation: AnswerEvaluation | null = null;
  if (row.evaluation_json) {
    try {
      evaluation = JSON.parse(row.evaluation_json) as AnswerEvaluation;
    } catch {
      evaluation = null;
    }
  }
  return {
    id: row.id,
    interview_id: row.interview_id,
    question_number: row.question_number,
    category: row.category as QuestionCategory,
    question_text: row.question_text,
    difficulty: row.difficulty as DifficultyLevel,
    topic: row.topic,
    user_answer: row.user_answer,
    score: row.score,
    rating: row.rating,
    evaluation,
    answered_at: row.answered_at,
  };
}

function mapInterviewRow(row: RawInterviewRow): InterviewSession {
  let report: InterviewReport | null = null;
  if (row.report_json) {
    try {
      report = JSON.parse(row.report_json) as InterviewReport;
    } catch {
      report = null;
    }
  }
  return {
    id: row.id,
    job_role: row.job_role,
    experience_level: row.experience_level as ExperienceLevel,
    difficulty: row.difficulty as DifficultyLevel,
    interview_type: row.interview_type as InterviewType,
    question_count: row.question_count,
    skills: row.skills || '',
    technologies: row.technologies || '',
    years_experience: row.years_experience || '',
    focus_topics: row.focus_topics || '',
    status: row.status as 'in_progress' | 'completed',
    overall_score: row.overall_score,
    average_score: row.average_score,
    technical_avg: row.technical_avg,
    hr_avg: row.hr_avg,
    answered_count: row.answered_count ?? 0,
    created_at: row.created_at,
    completed_at: row.completed_at,
    report,
  };
}

export function createInterviewWithQuestions(params: {
  id: string;
  jobRole: string;
  experienceLevel: ExperienceLevel;
  difficulty: DifficultyLevel;
  interviewType: InterviewType;
  questionCount: number;
  skills: string;
  technologies: string;
  yearsExperience: string;
  focusTopics: string;
  questions: Array<{
    question_id: number;
    category: QuestionCategory;
    question: string;
    difficulty: DifficultyLevel;
    topic: string;
  }>;
}): InterviewSession {
  const now = new Date().toISOString();

  const insertInterview = db.prepare(`
    INSERT INTO interviews (
      id, job_role, experience_level, difficulty, interview_type,
      question_count, skills, technologies, years_experience, focus_topics,
      status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'in_progress', ?)
  `);

  const insertQuestion = db.prepare(`
    INSERT INTO questions (
      interview_id, question_number, category, question_text, difficulty, topic
    ) VALUES (?, ?, ?, ?, ?, ?)
  `);

  const transaction = db.transaction(() => {
    insertInterview.run(
      params.id,
      params.jobRole,
      params.experienceLevel,
      params.difficulty,
      params.interviewType,
      params.questionCount,
      params.skills,
      params.technologies,
      params.yearsExperience,
      params.focusTopics,
      now
    );

    params.questions.forEach((q, idx) => {
      insertQuestion.run(
        params.id,
        idx + 1,
        q.category,
        q.question,
        q.difficulty,
        q.topic
      );
    });
  });

  transaction();
  return getInterviewById(params.id)!;
}

export function getInterviewById(id: string): InterviewSession | null {
  const row = db
    .prepare(
      `
      SELECT i.*,
        (SELECT COUNT(*) FROM questions q WHERE q.interview_id = i.id AND q.score IS NOT NULL) AS answered_count
      FROM interviews i
      WHERE i.id = ?
      `
    )
    .get(id) as RawInterviewRow | undefined;

  if (!row) return null;

  const questionRows = db
    .prepare(
      `
      SELECT * FROM questions
      WHERE interview_id = ?
      ORDER BY question_number ASC
      `
    )
    .all(id) as RawQuestionRow[];

  const session = mapInterviewRow(row);
  session.questions = questionRows.map(mapQuestionRow);
  return session;
}

export function listInterviews(filters?: {
  search?: string;
  status?: string;
  type?: string;
}): InterviewSession[] {
  const conditions: string[] = [];
  const bindings: unknown[] = [];

  if (filters?.status && filters.status !== 'all') {
    conditions.push('i.status = ?');
    bindings.push(filters.status);
  }
  if (filters?.type && filters.type !== 'all') {
    conditions.push('i.interview_type = ?');
    bindings.push(filters.type);
  }
  if (filters?.search && filters.search.trim().length > 0) {
    const term = `%${filters.search.trim()}%`;
    conditions.push('(i.job_role LIKE ? OR i.focus_topics LIKE ? OR i.skills LIKE ?)');
    bindings.push(term, term, term);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = db
    .prepare(
      `
      SELECT i.*,
        (SELECT COUNT(*) FROM questions q WHERE q.interview_id = i.id AND q.score IS NOT NULL) AS answered_count
      FROM interviews i
      ${whereClause}
      ORDER BY i.created_at DESC
      `
    )
    .all(...bindings) as RawInterviewRow[];

  return rows.map(mapInterviewRow);
}

export function saveDraftAnswer(interviewId: string, questionId: number, draftAnswer: string): boolean {
  const result = db
    .prepare(
      `
      UPDATE questions
      SET user_answer = ?
      WHERE id = ? AND interview_id = ?
      `
    )
    .run(draftAnswer, questionId, interviewId);
  return result.changes > 0;
}

export function getQuestionById(interviewId: string, questionId: number): InterviewQuestion | null {
  const row = db
    .prepare(
      `
      SELECT * FROM questions
      WHERE id = ? AND interview_id = ?
      `
    )
    .get(questionId, interviewId) as RawQuestionRow | undefined;
  return row ? mapQuestionRow(row) : null;
}

export function saveQuestionEvaluation(params: {
  interviewId: string;
  questionId: number;
  userAnswer: string;
  evaluation: AnswerEvaluation;
}): InterviewQuestion | null {
  const now = new Date().toISOString();
  db.prepare(
    `
    UPDATE questions
    SET user_answer = ?,
        score = ?,
        rating = ?,
        evaluation_json = ?,
        answered_at = ?
    WHERE id = ? AND interview_id = ?
    `
  ).run(
    params.userAnswer,
    params.evaluation.score,
    params.evaluation.rating,
    JSON.stringify(params.evaluation),
    now,
    params.questionId,
    params.interviewId
  );

  return getQuestionById(params.interviewId, params.questionId);
}

export function completeInterviewSession(params: {
  interviewId: string;
  overallScore: number;
  averageScore: number;
  technicalAvg: number | null;
  hrAvg: number | null;
  report: InterviewReport;
}): InterviewSession | null {
  const now = new Date().toISOString();
  db.prepare(
    `
    UPDATE interviews
    SET status = 'completed',
        overall_score = ?,
        average_score = ?,
        technical_avg = ?,
        hr_avg = ?,
        report_json = ?,
        completed_at = ?
    WHERE id = ?
    `
  ).run(
    params.overallScore,
    params.averageScore,
    params.technicalAvg,
    params.hrAvg,
    JSON.stringify(params.report),
    now,
    params.interviewId
  );

  return getInterviewById(params.interviewId);
}

export function deleteInterviewSession(id: string): boolean {
  const result = db.prepare('DELETE FROM interviews WHERE id = ?').run(id);
  return result.changes > 0;
}

export function getDashboardData(): DashboardData {
  const completedStats = db
    .prepare(
      `
      SELECT
        COUNT(*) AS total_completed,
        AVG(overall_score) AS avg_overall,
        MAX(overall_score) AS max_overall
      FROM interviews
      WHERE status = 'completed'
      `
    )
    .get() as { total_completed: number; avg_overall: number | null; max_overall: number | null };

  const questionsStats = db
    .prepare(
      `
      SELECT COUNT(*) AS answered_count
      FROM questions
      WHERE score IS NOT NULL
      `
    )
    .get() as { answered_count: number };

  const inProgressStats = db
    .prepare(
      `
      SELECT COUNT(*) AS in_progress_count
      FROM interviews
      WHERE status = 'in_progress'
      `
    )
    .get() as { in_progress_count: number };

  const recentRows = db
    .prepare(
      `
      SELECT i.*,
        (SELECT COUNT(*) FROM questions q WHERE q.interview_id = i.id AND q.score IS NOT NULL) AS answered_count
      FROM interviews i
      ORDER BY i.created_at DESC
      LIMIT 6
      `
    )
    .all() as RawInterviewRow[];

  return {
    stats: {
      totalCompleted: completedStats.total_completed ?? 0,
      averageScore:
        completedStats.avg_overall !== null ? Number(completedStats.avg_overall.toFixed(1)) : null,
      highestScore:
        completedStats.max_overall !== null ? Number(completedStats.max_overall.toFixed(1)) : null,
      questionsAnswered: questionsStats.answered_count ?? 0,
      inProgressCount: inProgressStats.in_progress_count ?? 0,
    },
    recentInterviews: recentRows.map(mapInterviewRow),
  };
}

export function getAnalyticsData(): AnalyticsData {
  const completedRows = db
    .prepare(
      `
      SELECT id, job_role, overall_score, average_score, technical_avg, hr_avg, completed_at, created_at
      FROM interviews
      WHERE status = 'completed' AND overall_score IS NOT NULL
      ORDER BY COALESCE(completed_at, created_at) ASC
      `
    )
    .all() as Array<{
    id: string;
    job_role: string;
    overall_score: number;
    average_score: number;
    technical_avg: number | null;
    hr_avg: number | null;
    completed_at: string | null;
    created_at: string;
  }>;

  const scoreProgression = completedRows.map((row, idx) => {
    const dt = new Date(row.completed_at || row.created_at);
    return {
      id: row.id,
      label: `#${idx + 1}`,
      date: dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      role: row.job_role,
      overallScore: Math.round(row.overall_score),
      averageScore: Number(row.average_score.toFixed(1)),
      technicalAvg: row.technical_avg !== null ? Number(row.technical_avg.toFixed(1)) : null,
      hrAvg: row.hr_avg !== null ? Number(row.hr_avg.toFixed(1)) : null,
    };
  });

  const catRows = db
    .prepare(
      `
      SELECT category, AVG(score) AS avg_score, COUNT(*) AS cnt
      FROM questions
      WHERE score IS NOT NULL
      GROUP BY category
      `
    )
    .all() as Array<{ category: string; avg_score: number; cnt: number }>;

  const techCat = catRows.find((r) => r.category === 'Technical');
  const hrCat = catRows.find((r) => r.category === 'HR');

  const topicRows = db
    .prepare(
      `
      SELECT topic, AVG(score) AS avg_score, COUNT(*) AS cnt
      FROM questions
      WHERE score IS NOT NULL AND TRIM(topic) != ''
      GROUP BY topic
      ORDER BY avg_score DESC, cnt DESC
      LIMIT 10
      `
    )
    .all() as Array<{ topic: string; avg_score: number; cnt: number }>;

  const allScores = db
    .prepare(`SELECT score FROM questions WHERE score IS NOT NULL`)
    .all() as Array<{ score: number }>;

  const bands = [
    { band: '0-2 (Poor)', min: 0, max: 2, count: 0 },
    { band: '3-4 (Needs Work)', min: 3, max: 4, count: 0 },
    { band: '5-6 (Average)', min: 5, max: 6, count: 0 },
    { band: '7-8 (Good)', min: 7, max: 8, count: 0 },
    { band: '9-10 (Excellent)', min: 9, max: 10, count: 0 },
  ];
  for (const row of allScores) {
    const target = bands.find((b) => row.score >= b.min && row.score <= b.max);
    if (target) target.count += 1;
  }

  const roleRows = db
    .prepare(
      `
      SELECT job_role, COUNT(*) AS sessions, AVG(overall_score) AS avg_score
      FROM interviews
      WHERE status = 'completed' AND overall_score IS NOT NULL
      GROUP BY job_role
      ORDER BY sessions DESC, avg_score DESC
      LIMIT 8
      `
    )
    .all() as Array<{ job_role: string; sessions: number; avg_score: number }>;

  return {
    scoreProgression,
    categoryComparison: {
      technicalAverage: techCat ? Number(techCat.avg_score.toFixed(1)) : null,
      technicalCount: techCat ? techCat.cnt : 0,
      hrAverage: hrCat ? Number(hrCat.avg_score.toFixed(1)) : null,
      hrCount: hrCat ? hrCat.cnt : 0,
    },
    topicPerformance: topicRows.map((r) => ({
      topic: r.topic,
      averageScore: Number(r.avg_score.toFixed(1)),
      count: r.cnt,
    })),
    scoreDistribution: bands.map(({ band, count }) => ({ band, count })),
    roleBreakdown: roleRows.map((r) => ({
      role: r.job_role,
      sessions: r.sessions,
      averageScore: Number(r.avg_score.toFixed(1)),
    })),
  };
}
