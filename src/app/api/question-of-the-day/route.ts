import { QUESTIONS } from "./questions";

export async function GET() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysSinceEpoch = Math.floor(today.getTime() / (1000 * 60 * 60 * 24)); //convert to day number since Jan 1, 1970

  const index = daysSinceEpoch % QUESTIONS.length;

  return Response.json({
    question: QUESTIONS[index],
  });
}
