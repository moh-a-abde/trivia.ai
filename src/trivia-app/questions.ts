import { basketballQuestions } from './basketball-questions';
import { soccerQuestions } from './soccer-questions';

export { basketballQuestions, soccerQuestions };

// Combined questions for hooks that need all questions
export const questions = [...basketballQuestions, ...soccerQuestions];
