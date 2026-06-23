"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Check if API key exists
if (!process.env.GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model:"models/gemini-flash-latest",
})

// Mock quiz data for fallback when API quota is exceeded
const MOCK_QUIZ_DATABASE = {
  "Software Development": [
    {
      question: "What is the time complexity of binary search?",
      options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
      correctAnswer: "O(log n)",
      explanation: "Binary search eliminates half of the remaining elements in each iteration, resulting in logarithmic time complexity."
    },
    {
      question: "Which design pattern is used to create objects without specifying the exact classes?",
      options: ["Singleton", "Factory", "Observer", "Decorator"],
      correctAnswer: "Factory",
      explanation: "The Factory pattern provides an interface for creating objects, allowing subclasses to decide which class to instantiate."
    },
    {
      question: "What is the purpose of the 'const' keyword in JavaScript?",
      options: ["It prevents reassignment of variables", "It creates global variables", "It makes code faster", "It's an alias for 'var'"],
      correctAnswer: "It prevents reassignment of variables",
      explanation: "const prevents the variable from being reassigned, though it doesn't make the object immutable."
    },
    {
      question: "In React, what hook is used to manage side effects?",
      options: ["useState", "useEffect", "useContext", "useReducer"],
      correctAnswer: "useEffect",
      explanation: "useEffect is the React hook specifically designed to handle side effects like data fetching, subscriptions, and DOM updates."
    },
    {
      question: "What is the main advantage of using a database index?",
      options: ["It makes inserts faster", "It reduces storage space", "It speeds up query retrieval", "It prevents duplicate data"],
      correctAnswer: "It speeds up query retrieval",
      explanation: "Indexes allow the database to find data without scanning the entire table, significantly speeding up query performance."
    }
  ],
  "Data Science": [
    {
      question: "What does 'overfitting' mean in machine learning?",
      options: ["The model is too simple", "The model performs well on training data but poorly on test data", "The model uses too few features", "The model is perfectly accurate"],
      correctAnswer: "The model performs well on training data but poorly on test data",
      explanation: "Overfitting occurs when a model learns the noise in the training data rather than the underlying pattern, leading to poor generalization."
    },
    {
      question: "Which algorithm is commonly used for dimensionality reduction?",
      options: ["K-means", "Principal Component Analysis (PCA)", "Decision Trees", "Naive Bayes"],
      correctAnswer: "Principal Component Analysis (PCA)",
      explanation: "PCA is a popular unsupervised technique that reduces the number of features while retaining most of the variance in the data."
    },
    {
      question: "What is the purpose of cross-validation in machine learning?",
      options: ["To speed up training", "To assess model generalization and reduce variance in performance estimates", "To increase model accuracy", "To reduce training time"],
      correctAnswer: "To assess model generalization and reduce variance in performance estimates",
      explanation: "Cross-validation divides data into multiple subsets to provide a more robust evaluation of model performance."
    },
    {
      question: "What does the 'confusion matrix' help evaluate?",
      options: ["Data imbalance", "Classification model performance (TP, TN, FP, FN)", "Feature correlation", "Model complexity"],
      correctAnswer: "Classification model performance (TP, TN, FP, FN)",
      explanation: "The confusion matrix shows True Positives, True Negatives, False Positives, and False Negatives, enabling calculation of metrics like accuracy, precision, and recall."
    },
    {
      question: "Which loss function is typically used for binary classification?",
      options: ["Mean Squared Error", "Binary Cross-Entropy", "Hinge Loss", "All of the above"],
      correctAnswer: "Binary Cross-Entropy",
      explanation: "Binary Cross-Entropy measures the difference between predicted probabilities and actual binary labels, making it ideal for binary classification."
    }
  ],
  "Frontend Development": [
    {
      question: "What is the purpose of CSS Grid?",
      options: ["To create animations", "To create a two-dimensional layout system", "To manage JavaScript variables", "To optimize images"],
      correctAnswer: "To create a two-dimensional layout system",
      explanation: "CSS Grid allows developers to create complex, responsive layouts using rows and columns, providing more control than Flexbox."
    },
    {
      question: "What is the virtual DOM in React?",
      options: ["A copy of the actual DOM kept in memory for performance optimization", "A DOM for testing", "The browser's native DOM", "A third-party library"],
      correctAnswer: "A copy of the actual DOM kept in memory for performance optimization",
      explanation: "React maintains a virtual DOM to track changes and efficiently update only the parts of the real DOM that have changed."
    },
    {
      question: "How can you improve the performance of a React application?",
      options: ["Use inline styles", "Memoization with React.memo", "Never use keys in lists", "Remove all comments"],
      correctAnswer: "Memoization with React.memo",
      explanation: "React.memo prevents unnecessary re-renders of components when props haven't changed, improving performance."
    },
    {
      question: "What is the purpose of the 'async/await' syntax in JavaScript?",
      options: ["To create multiple threads", "To handle asynchronous operations in a more readable way", "To declare variables", "To create loops"],
      correctAnswer: "To handle asynchronous operations in a more readable way",
      explanation: "async/await allows you to write asynchronous code that looks synchronous, making it easier to understand and maintain."
    },
    {
      question: "Which selector has the highest specificity in CSS?",
      options: ["Class selector", "ID selector", "Element selector", "Attribute selector"],
      correctAnswer: "ID selector",
      explanation: "ID selectors have the highest specificity (except for !important), followed by class selectors, and then element selectors."
    }
  ],
  "default": [
    {
      question: "What is the most important skill for a software developer?",
      options: ["Problem-solving", "Coding speed", "Memory", "Typing speed"],
      correctAnswer: "Problem-solving",
      explanation: "Problem-solving is the foundation of software development; the ability to break down complex problems is more valuable than any specific language."
    },
    {
      question: "Which of the following is a SOLID principle?",
      options: ["Single Responsibility", "Open/Closed", "Liskov Substitution", "All of the above"],
      correctAnswer: "All of the above",
      explanation: "SOLID is an acronym for five design principles: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion."
    },
    {
      question: "What is the purpose of version control systems like Git?",
      options: ["To compile code", "To track changes and manage collaboration", "To execute code", "To install dependencies"],
      correctAnswer: "To track changes and manage collaboration",
      explanation: "Version control systems track code changes, enable collaboration, and allow developers to revert to previous versions if needed."
    },
    {
      question: "What does 'DRY' stand for in programming?",
      options: ["Don't Repeat Yourself", "Data Retrieval Yield", "Dynamic Runtime Yield", "Debugged Resource Yielding"],
      correctAnswer: "Don't Repeat Yourself",
      explanation: "DRY is a principle that encourages developers to avoid duplicating code and logic throughout their applications."
    },
    {
      question: "Which is better for large-scale applications: monolithic or microservices architecture?",
      options: ["Monolithic", "Microservices", "It depends on requirements", "They're the same"],
      correctAnswer: "It depends on requirements",
      explanation: "The choice between monolithic and microservices depends on factors like team size, scalability needs, complexity, and deployment requirements."
    }
  ]
};

function getMockQuiz(industry) {
  const industryQuiz = MOCK_QUIZ_DATABASE[industry] || MOCK_QUIZ_DATABASE["default"];
  return industryQuiz;
}

export async function generateQuiz() {
  try {
    // Check API key
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable is not configured");
    }

    // Authenticate user
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized - Please log in");

    // Fetch user with error handling
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: {
        industry: true,
        skills: true,
      },
    });

    if (!user) throw new Error("User profile not found in database");

    // Check if user has set their industry
    if (!user.industry) {
      throw new Error("Please complete your profile with an industry before generating a quiz. Go to Settings → Profile.");
    }

    // Build the prompt with user data
    const skillsText = user.skills?.length ? ` with expertise in ${user.skills.join(", ")}` : "";
    
    const prompt = `
    Generate exactly 5 technical interview questions for a ${user.industry} professional${skillsText}.
    
    Each question should be multiple choice with 4 different options.
    
    Return ONLY valid JSON (no markdown, no backticks) with this exact structure:
    {
      "questions": [
        {
          "question": "question text here",
          "options": ["option 1", "option 2", "option 3", "option 4"],
          "correctAnswer": "the correct option text",
          "explanation": "brief explanation of why this is correct"
        }
      ]
    }
  `;

    console.log("Generating quiz for industry:", user.industry);
    
    // Call Gemini API
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    console.log("Raw Gemini response:", text.substring(0, 200)); // Log first 200 chars

    // Clean response - remove markdown code blocks if present
    let cleanedText = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    
    // Try to parse JSON
    let quiz;
    try {
      quiz = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("JSON Parse error:", parseError);
      console.error("Attempted to parse:", cleanedText);
      throw new Error("Invalid response format from AI - could not parse questions. Please try again.");
    }

    // Validate the response structure
    if (!quiz.questions || !Array.isArray(quiz.questions)) {
      throw new Error("Invalid response structure - missing questions array");
    }

    if (quiz.questions.length === 0) {
      throw new Error("No questions were generated. Please try again.");
    }

    // Validate each question
    for (let i = 0; i < quiz.questions.length; i++) {
      const q = quiz.questions[i];
      if (!q.question || !q.options || !q.correctAnswer || !q.explanation) {
        throw new Error(`Question ${i + 1} is missing required fields. Please try again.`);
      }
    }

    console.log("Quiz generated successfully with", quiz.questions.length, "questions");
    return quiz.questions;
    
  } catch (error) {
    console.error("Error generating quiz:", error.message || error);
    
    // Re-throw with user-friendly message
    if (error.message.includes("GEMINI_API_KEY")) {
      throw new Error("AI service is not configured. Please contact support.");
    }
    
    throw error;
  }
}


export async function saveQuizResult(questions, answers, score) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const questionResults = questions.map((q, index) => ({
    question: q.question,
    answer: q.correctAnswer,
    userAnswer: answers[index],
    isCorrect: q.correctAnswer === answers[index],
    explanation: q.explanation,
  }));
  // Get wrong answers
  const wrongAnswers = questionResults.filter((q) => !q.isCorrect);

    // Only generate improvement tips if there are wrong answers
  let improvementTip = null;
  if (wrongAnswers.length > 0) {
    const wrongQuestionsText = wrongAnswers
      .map(
        (q) =>
          `Question: "${q.question}"\nCorrect Answer: "${q.answer}"\nUser Answer: "${q.userAnswer}"`
      )
      .join("\n\n");

    const improvementPrompt = `
      The user got the following ${user.industry} technical interview questions wrong:

      ${wrongQuestionsText}

      Based on these mistakes, provide a concise, specific improvement tip.
      Focus on the knowledge gaps revealed by these wrong answers.
      Keep the response under 2 sentences and make it encouraging.
      Don't explicitly mention the mistakes, instead focus on what to learn/practice.
    `;

    try {
      const tipResult = await model.generateContent(improvementPrompt);

      improvementTip = tipResult.response.text().trim();
      console.log(improvementTip);
    } catch (error) {
      console.error("Error generating improvement tip:", error);
      // Continue without improvement tip if generation fails
    }
  }


   try {
    const assessment = await db.assessment.create({
      data: {
        userId: user.id,
        quizeScore: score,
        questions: questionResults,
        category: "Technical",
        improvementTip,
      },
    });

    return assessment;
  } catch (error) {
    console.error("Error saving quiz result:", error);
    throw new Error("Failed to save quiz result");
  }

}


export async function getAssessments() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const assessments = await db.assessment.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return assessments;
  } catch (error) {
    console.error("Error fetching assessments:", error);
    throw new Error("Failed to fetch assessments");
  }
}




