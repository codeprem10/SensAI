/**
 * API Route: AI Interview Feedback
 * POST /api/ai-interview
 * 
 * Accepts: { question: string, answer: string }
 * Returns: { feedback: string }
 * 
 * Currently uses mock AI feedback
 * TODO: Replace with OpenAI API or Gemini API in production
 */

const generateMockFeedback = (question, answer) => {
  // List of constructive feedback templates
  const feedbackTemplates = [
    "Great start! Your answer covers the main points. Consider adding specific examples or metrics to make it more compelling.",
    "Good response with clear structure. To improve: add more quantifiable results and explain the impact of your actions.",
    "Solid answer! Next time, try to relate your experience more directly to the role requirements and company values.",
    "You've provided a good overview. Consider: What did you learn from this experience? How did it shape your approach?",
    "Nice effort! Your answer would be stronger with specific details. Tell the interviewer what metrics or outcomes resulted from your work.",
    "Good explanation of the situation. Try to emphasize your specific contribution and the skills you demonstrated.",
    "Your answer shows good technical understanding. Remember to also discuss the soft skills and teamwork aspects involved.",
    "Excellent detail! Next time, try to be more concise while keeping the key insights. Interviews often have time constraints.",
    "Strong response structure. To stand out more, explain how this experience prepared you for this specific role.",
    "Good attempt! Remember to use the STAR method (Situation, Task, Action, Result) for behavioral questions.",
  ];

  // Mock AI improvement suggestions based on answer length
  let suggestion = feedbackTemplates[Math.floor(Math.random() * feedbackTemplates.length)];

  // Check answer quality and provide specific feedback
  if (answer.length < 50) {
    suggestion = "Your answer is quite brief. Try elaborating with more details, examples, and outcomes to make a stronger impression.";
  } else if (answer.length > 500) {
    suggestion = "Good detailed response! However, consider being more concise with your answer to respect time constraints.";
  }

  // Add confidence badge
  const answerQuality = answer.split(" ").length > 30 ? "in-depth" : "brief";

  return {
    feedback: suggestion,
    answerQuality,
    timestamp: new Date().toISOString(),
  };
};

// TODO: Implement real AI feedback using Gemini API
// Example code for future implementation:
/*
const generateAIFeedback = async (question, answer) => {
  const { GoogleGenerativeAI } = require("@google/generative-ai");
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "models/gemini-flash-latest" });
  
  const prompt = `
    You are an expert interview coach. Provide constructive feedback on this interview answer.
    
    Question: "${question}"
    
    Candidate's Answer: "${answer}"
    
    Provide feedback in JSON format with fields: feedback (string, max 150 words), strengths (array), improvements (array), score (1-10)
  `;
  
  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
};
*/

export async function POST(request) {
  try {
    const body = await request.json();
    const { question, answer } = body;

    // Validate input
    if (!question || !answer) {
      return new Response(
        JSON.stringify({ error: "Question and answer are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate input lengths
    if (question.length < 10 || answer.length < 10) {
      return new Response(
        JSON.stringify({ error: "Question and answer must be at least 10 characters" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Generate feedback (mock for now)
    const feedbackData = generateMockFeedback(question, answer);

    return new Response(
      JSON.stringify({
        success: true,
        feedback: feedbackData.feedback,
        answerQuality: feedbackData.answerQuality,
        timestamp: feedbackData.timestamp,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in AI interview feedback:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to generate feedback",
        message: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

/**
 * API Documentation:
 * 
 * Request:
 * {
 *   "question": "Tell me about your most significant project?",
 *   "answer": "I worked on a web application that improved user engagement..."
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "feedback": "Great answer! Consider adding metrics...",
 *   "answerQuality": "in-depth",
 *   "timestamp": "2026-03-26T10:30:00.000Z"
 * }
 * 
 * Error Response:
 * {
 *   "error": "Failed to generate feedback",
 *   "message": "Error details here"
 * }
 */
