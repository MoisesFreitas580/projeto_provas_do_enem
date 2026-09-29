// src/app/models/attempt-result.model.ts

export type CorrectionStatus = 'CORRECT' | 'WRONG' | 'SKIPPED' | 'MISSING_ANSWER_KEY' | 'ANNULLED';

export interface CorrectionSkill {
  code: string;
  description: string;
}

export interface CorrectionAnswer {
  selectedLetter: string | null;
  correctLetter: string | null;
  isCorrect: boolean;
  correctionStatus: CorrectionStatus;
  skill?: CorrectionSkill;
  question: any; 
}

export interface AttemptSessionResult {
  id: string;
  title?: string;
  status: 'IN_PROGRESS' | 'CORRECTED' | 'ABANDONED';
  correctQuestions: number;
  wrongQuestions: number;
  skippedQuestions: number;
  rawScore: number;
  answers: CorrectionAnswer[];
}