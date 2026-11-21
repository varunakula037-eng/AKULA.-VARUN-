import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  completeInterviewSession,
  createInterviewWithQuestions,
  deleteInterviewSession,
  getAnalyticsData,
  getDashboardData,
  getInterviewById,
  getQuestionById,
  listInterviews,
  saveDraftAnswer,
  saveQuestionEvaluation,
} from './server/db.ts';
import {
  evaluateCandidateAnswer,
  generateFinalReportInsights,
  generateInterviewQuestions,
} from './server/gemini.ts';
import { streamInterviewPdfReport } from './server/pdf.ts';
import type {
  DifficultyLevel,
  ExperienceLevel,
  InterviewConfig,
  InterviewReport,
  InterviewType,
} from './src/types.ts';

const VALID_EXPERIENCE = new Set<ExperienceLevel>(['Fresher', 'Experienced']);
const VALID_DIFFICULTY = new Set<DifficultyLevel>(['Easy', 'Medium', 'Hard']);
const VALID_TYPES = new Set<InterviewType>(['Technical', 'HR', 'Mixed (Technical + HR)']);
const VALID_COUNTS = new Set([5, 10, 15]);

function formatGeminiError(err: unknown): { status: number; message: string } {
  const rawMessage = err instanceof Error ? err.message : 'Unexpected server error.';
  if (rawMessage.includes('GEMINI_API_KEY is not configured')) {
    return { status: 400, message: rawMessage };
  }
  if (rawMessage.includes('API_KEY_INVALID') || rawMessage.includes('PERMISSION_DENIED')) {
    return {
      status: 403,
      message: 'Your Gemini API key appears invalid or lacks permission. Please verify it in Settings > Secrets.',
    };
  }
  if (rawMessage.includes('RESOURCE_EXHAUSTED') || rawMessage.includes('429')) {
    return {
      status: 429,
      message: 'Gemini API rate limit reached. Please wait a moment and try again.',
    };
  }
  return { status: 500, message: rawMessage };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  app.get('/api/dashboard', (_req: Request, res: Response) => {
    try {
      const data = getDashboardData();
      res.json(data);
    } catch (err) {
      res.status(500).json({
        error: err instanceof Error ? err.message : 'Failed to load dashboard data.',
      });
    }
  });

  app.get('/api/analytics', (_req: Request, res: Response) => {
    try {
      const data = getAnalyticsData();
      res.json(data);
    } catch (err) {
      res.status(500).json({
        error: err instanceof Error ? err.message : 'Failed to load analytics.',
      });
    }
  });

  app.get('/api/interviews', (req: Request, res: Response) => {
    try {
      const search = typeof req.query.search === 'string' ? req.query.search : undefined;
      const status = typeof req.query.status === 'string' ? req.query.status : undefined;
      const type = typeof req.query.type === 'string' ? req.query.type : undefined;
      const rows = listInterviews({ search, status, type });
      res.json({ interviews: rows });
    } catch (err) {
      res.status(500).json({
        error: err instanceof Error ? err.message : 'Failed to list interviews.',
      });
    }
  });

  app.post('/api/interviews', async (req: Request, res: Response) => {
    try {
      const body = (req.body || {}) as Partial<InterviewConfig>;
      const jobRole = typeof body.jobRole === 'string' ? body.jobRole.trim().slice(0, 120) : '';
      if (!jobRole) {
        res.status(400).json({ error: 'Please specify a valid job role.' });
        return;
      }

      const experienceLevel: ExperienceLevel = VALID_EXPERIENCE.has(
        body.experienceLevel as ExperienceLevel
      )
        ? (body.experienceLevel as ExperienceLevel)
        : 'Fresher';

      const difficulty: DifficultyLevel = VALID_DIFFICULTY.has(body.difficulty as DifficultyLevel)
        ? (body.difficulty as DifficultyLevel)
        : 'Medium';

      const interviewType: InterviewType = VALID_TYPES.has(body.interviewType as InterviewType)
        ? (body.interviewType as InterviewType)
        : 'Mixed (Technical + HR)';

      const qCountNum = Number(body.questionCount);
      const questionCount = (VALID_COUNTS.has(qCountNum) ? qCountNum : 5) as 5 | 10 | 15;

      const config: InterviewConfig = {
        jobRole,
        experienceLevel,
        difficulty,
        interviewType,
        questionCount,
        skills: typeof body.skills === 'string' ? body.skills.trim().slice(0, 500) : '',
        technologies:
          typeof body.technologies === 'string' ? body.technologies.trim().slice(0, 500) : '',
        yearsExperience:
          typeof body.yearsExperience === 'string' ? body.yearsExperience.trim().slice(0, 60) : '',
        focusTopics:
          typeof body.focusTopics === 'string' ? body.focusTopics.trim().slice(0, 500) : '',
      };

      const generatedQuestions = await generateInterviewQuestions(config);
      const interviewId = crypto.randomUUID();

      const session = createInterviewWithQuestions({
        id: interviewId,
        jobRole: config.jobRole,
        experienceLevel: config.experienceLevel,
        difficulty: config.difficulty,
        interviewType: config.interviewType,
        questionCount: config.questionCount,
        skills: config.skills,
        technologies: config.technologies,
        yearsExperience: config.yearsExperience,
        focusTopics: config.focusTopics,
        questions: generatedQuestions,
      });

      res.status(201).json({ interview: session });
    } catch (err) {
      const formatted = formatGeminiError(err);
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  app.get('/api/interviews/:id', (req: Request, res: Response) => {
    const id = String(req.params.id || '');
    const session = getInterviewById(id);
    if (!session) {
      res.status(404).json({ error: 'Interview session not found.' });
      return;
    }
    res.json({ interview: session });
  });

  app.patch('/api/interviews/:id/draft', (req: Request, res: Response) => {
    const interviewId = String(req.params.id || '');
    const body = (req.body || {}) as { questionId?: number; answer?: string };
    const questionId = Number(body.questionId);
    if (!Number.isInteger(questionId) || questionId <= 0) {
      res.status(400).json({ error: 'Invalid questionId.' });
      return;
    }
    const answer = typeof body.answer === 'string' ? body.answer.slice(0, 12000) : '';
    const updated = saveDraftAnswer(interviewId, questionId, answer);
    if (!updated) {
      res.status(404).json({ error: 'Question not found.' });
      return;
    }
    res.json({ ok: true });
  });

  app.post('/api/interviews/:id/questions/:questionId/evaluate', async (req: Request, res: Response) => {
    try {
      const interviewId = String(req.params.id || '');
      const questionId = Number(req.params.questionId);
      if (!Number.isInteger(questionId) || questionId <= 0) {
        res.status(400).json({ error: 'Invalid question ID.' });
        return;
      }

      const body = (req.body || {}) as { answer?: string };
      const answer = typeof body.answer === 'string' ? body.answer.trim() : '';
      if (!answer) {
        res.status(400).json({ error: 'Please write an answer before submitting for evaluation.' });
        return;
      }

      const session = getInterviewById(interviewId);
      if (!session) {
        res.status(404).json({ error: 'Interview session not found.' });
        return;
      }

      const question = getQuestionById(interviewId, questionId);
      if (!question) {
        res.status(404).json({ error: 'Interview question not found.' });
        return;
      }

      const evaluation = await evaluateCandidateAnswer({
        jobRole: session.job_role,
        experienceLevel: session.experience_level,
        difficulty: session.difficulty,
        question,
        candidateAnswer: answer.slice(0, 12000),
      });

      const updatedQuestion = saveQuestionEvaluation({
        interviewId,
        questionId,
        userAnswer: answer.slice(0, 12000),
        evaluation,
      });

      res.json({ question: updatedQuestion });
    } catch (err) {
      const formatted = formatGeminiError(err);
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  app.post('/api/interviews/:id/complete', async (req: Request, res: Response) => {
    try {
      const interviewId = String(req.params.id || '');
      const session = getInterviewById(interviewId);
      if (!session || !session.questions) {
        res.status(404).json({ error: 'Interview session not found.' });
        return;
      }

      const answeredQuestions = session.questions.filter((q) => q.score !== null);
      if (answeredQuestions.length < session.questions.length) {
        res.status(400).json({
          error: `Please submit and evaluate all ${session.questions.length} questions before generating the final report.`,
        });
        return;
      }

      const totalScore = answeredQuestions.reduce((sum, q) => sum + (q.score ?? 0), 0);
      const averageScore = Number((totalScore / answeredQuestions.length).toFixed(2));
      const overallScore = Math.round(averageScore * 10);

      const techQuestions = answeredQuestions.filter((q) => q.category === 'Technical');
      const hrQuestions = answeredQuestions.filter((q) => q.category === 'HR');

      const technicalAvg =
        techQuestions.length > 0
          ? Number(
              (
                techQuestions.reduce((s, q) => s + (q.score ?? 0), 0) / techQuestions.length
              ).toFixed(2)
            )
          : null;

      const hrAvg =
        hrQuestions.length > 0
          ? Number(
              (hrQuestions.reduce((s, q) => s + (q.score ?? 0), 0) / hrQuestions.length).toFixed(2)
            )
          : null;

      const sortedByScore = [...answeredQuestions].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
      const strongest = sortedByScore[0];
      const weakest = sortedByScore[sortedByScore.length - 1];

      const insights = await generateFinalReportInsights(session, answeredQuestions);

      const report: InterviewReport = {
        overall_score: overallScore,
        average_score: averageScore,
        technical_avg: technicalAvg,
        hr_avg: hrAvg,
        technical_count: techQuestions.length,
        hr_count: hrQuestions.length,
        strongest_question: strongest
          ? {
              question_number: strongest.question_number,
              category: strongest.category,
              topic: strongest.topic,
              question_text: strongest.question_text,
              user_answer: strongest.user_answer || '',
              score: strongest.score ?? 0,
              rating: strongest.rating || '',
            }
          : null,
        weakest_question: weakest
          ? {
              question_number: weakest.question_number,
              category: weakest.category,
              topic: weakest.topic,
              question_text: weakest.question_text,
              user_answer: weakest.user_answer || '',
              score: weakest.score ?? 0,
              rating: weakest.rating || '',
            }
          : null,
        insights,
      };

      const completed = completeInterviewSession({
        interviewId,
        overallScore,
        averageScore,
        technicalAvg,
        hrAvg,
        report,
      });

      res.json({ interview: completed });
    } catch (err) {
      const formatted = formatGeminiError(err);
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  app.get('/api/interviews/:id/pdf', (req: Request, res: Response) => {
    const interviewId = String(req.params.id || '');
    const session = getInterviewById(interviewId);
    if (!session) {
      res.status(404).json({ error: 'Interview session not found.' });
      return;
    }
    streamInterviewPdfReport(session, res);
  });

  app.delete('/api/interviews/:id', (req: Request, res: Response) => {
    const interviewId = String(req.params.id || '');
    const deleted = deleteInterviewSession(interviewId);
    if (!deleted) {
      res.status(404).json({ error: 'Interview session not found.' });
      return;
    }
    res.json({ ok: true });
  });

  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      const indexFile = path.join(distPath, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output not found. Run npm run build first.');
      }
    });
  }

  const port = Number(process.env.PORT || 3000);
  app.listen(port, '0.0.0.0', () => {
    console.log(`INTERVIEWX AI server running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
