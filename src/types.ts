export type NavSection =
  | 'dashboard'
  | 'configure'
  | 'workspace'
  | 'report'
  | 'history'
  | 'analytics'
  | 'tips'
  | 'about';

export type ExperienceLevel = 'Fresher' | 'Experienced';
export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';
export type InterviewType = 'Technical' | 'HR' | 'Mixed (Technical + HR)';
export type QuestionCategory = 'Technical' | 'HR';

export interface InterviewConfig {
  jobRole: string;
  experienceLevel: ExperienceLevel;
  difficulty: DifficultyLevel;
  interviewType: InterviewType;
  questionCount: 5 | 10 | 15;
  skills: string;
  technologies: string;
  yearsExperience: string;
  focusTopics: string;
}

export interface AnswerEvaluation {
  score: number;
  rating: 'Excellent' | 'Good' | 'Average' | 'Needs Improvement' | 'Poor';
  what_was_good: string[];
  what_was_missing: string[];
  technical_accuracy: string;
  communication_feedback: string;
  sample_better_answer: string;
  improvement_tip: string;
}

export interface InterviewQuestion {
  id: number;
  interview_id: string;
  question_number: number;
  category: QuestionCategory;
  question_text: string;
  difficulty: DifficultyLevel;
  topic: string;
  user_answer: string | null;
  score: number | null;
  rating: string | null;
  evaluation: AnswerEvaluation | null;
  answered_at: string | null;
}

export interface ReportInsights {
  strongest_areas: string[];
  areas_requiring_improvement: string[];
  communication_assessment: string;
  personalized_recommendations: string[];
}

export interface InterviewReport {
  overall_score: number;
  average_score: number;
  technical_avg: number | null;
  hr_avg: number | null;
  technical_count: number;
  hr_count: number;
  strongest_question: {
    question_number: number;
    category: QuestionCategory;
    topic: string;
    question_text: string;
    user_answer: string;
    score: number;
    rating: string;
  } | null;
  weakest_question: {
    question_number: number;
    category: QuestionCategory;
    topic: string;
    question_text: string;
    user_answer: string;
    score: number;
    rating: string;
  } | null;
  insights: ReportInsights;
}

export interface InterviewSession {
  id: string;
  job_role: string;
  experience_level: ExperienceLevel;
  difficulty: DifficultyLevel;
  interview_type: InterviewType;
  question_count: number;
  skills: string;
  technologies: string;
  years_experience: string;
  focus_topics: string;
  status: 'in_progress' | 'completed';
  overall_score: number | null;
  average_score: number | null;
  technical_avg: number | null;
  hr_avg: number | null;
  answered_count: number;
  created_at: string;
  completed_at: string | null;
  questions?: InterviewQuestion[];
  report?: InterviewReport | null;
}

export interface DashboardData {
  stats: {
    totalCompleted: number;
    averageScore: number | null;
    highestScore: number | null;
    questionsAnswered: number;
    inProgressCount: number;
  };
  recentInterviews: InterviewSession[];
}

export interface AnalyticsData {
  scoreProgression: Array<{
    id: string;
    label: string;
    date: string;
    role: string;
    overallScore: number;
    averageScore: number;
    technicalAvg: number | null;
    hrAvg: number | null;
  }>;
  categoryComparison: {
    technicalAverage: number | null;
    technicalCount: number;
    hrAverage: number | null;
    hrCount: number;
  };
  topicPerformance: Array<{
    topic: string;
    averageScore: number;
    count: number;
  }>;
  scoreDistribution: Array<{
    band: string;
    count: number;
  }>;
  roleBreakdown: Array<{
    role: string;
    sessions: number;
    averageScore: number;
  }>;
}
