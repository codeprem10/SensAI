"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "models/gemini-flash-latest" });

// Mock cover letter template for fallback
function generateMockCoverLetter(data, user) {
  return `# Cover Letter

[Your Address]
[City, State ZIP Code]
[Email Address]
[Phone Number]
[Date]

[Recipient Name]
[Company Name]
[Company Address]
[City, State ZIP Code]

Dear Hiring Manager,

I am writing to express my strong interest in the ${data.jobTitle} position at ${data.companyName}. With my background in ${user.industry} and ${user.experience} years of professional experience, I am confident in my ability to contribute significantly to your team.

Throughout my career, I have developed expertise in ${user.skills?.length ? user.skills.slice(0, 3).join(", ") : "various technical and professional domains"}. My professional background includes ${user.bio ? user.bio.substring(0, 100) : "proven expertise in delivering high-quality results"}...

I am particularly drawn to ${data.companyName} because of your commitment to excellence and innovation in the industry. I am excited about the opportunity to apply my skills and experience to contribute to your organization's continued success.

I would welcome the opportunity to discuss how my background, skills, and enthusiasm can benefit your team. Thank you for considering my application.

Sincerely,
${user.name || "Your Name"}`;
}

export async function generateCoverLetter(data) {
  let user = null;

  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Fetch user
    user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    // Validate input
    if (!data.jobTitle || !data.companyName) {
      throw new Error("Job title and company name are required");
    }

    try {
      // Try to generate with AI
      const prompt = `
    Write a professional cover letter for a ${data.jobTitle} position at ${data.companyName}.
    
    About the candidate:
    - Industry: ${user.industry}
    - Years of Experience: ${user.experience}
    - Skills: ${user.skills?.join(", ")}
    - Professional Background: ${user.bio}
    
    Job Description:
    ${data.jobDescription}
    
    Requirements:
    1. Use a professional, enthusiastic tone
    2. Highlight relevant skills and experience
    3. Show understanding of the company's needs
    4. Keep it concise (max 400 words)
    5. Use proper business letter formatting in markdown
    6. Include specific examples of achievements
    7. Relate candidate's background to job requirements
    
    Format the letter in markdown.
  `;

      console.log("Generating cover letter for:", data.companyName);

      const result = await model.generateContent(prompt);
      const content = result.response.text().trim();

      if (!content) {
        throw new Error("AI returned empty response");
      }

      const coverLetter = await db.coverLetter.create({
        data: {
          content,
          jobDescription: data.jobDescription,
          companyName: data.companyName,
          jobTitle: data.jobTitle,
          userId: user.id,
        },
      });

      console.log("Cover letter generated successfully");
      return coverLetter;
    } catch (aiError) {
      // If AI fails, use mock cover letter
      console.warn("⚠️ AI generation failed, using mock cover letter:", aiError);

      const mockContent = generateMockCoverLetter(data, user);

      const coverLetter = await db.coverLetter.create({
        data: {
          content: mockContent,
          jobDescription: data.jobDescription,
          companyName: data.companyName,
          jobTitle: data.jobTitle,
          userId: user.id,
        },
      });

      console.log("✅ Mock cover letter created and saved");
      return coverLetter;
    }
  } catch (error) {
    console.error("generateCoverLetter error:", error);

    // If database fails, return a structured error response instead of throwing
    const errorMessage = String(error?.message || "Failed to generate cover letter");

    if (user) {
      // Try one more time with mock data
      try {
        const mockContent = generateMockCoverLetter(data, user);
        const coverLetter = await db.coverLetter.create({
          data: {
            content: mockContent,
            jobDescription: data.jobDescription,
            companyName: data.companyName,
            jobTitle: data.jobTitle,
            userId: user.id,
          },
        });
        return coverLetter;
      } catch (dbError) {
        console.error("Final fallback failed:", dbError);
      }
    }

    // Re-throw only if we absolutely must
    throw new Error(errorMessage);
  }
}

export async function getCoverLetters() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  return await db.coverLetter.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getCoverLetter(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  return await db.coverLetter.findUnique({
    where: {
      id,
      userId: user.id,
    },
  });
}

export async function deleteCoverLetter(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  return await db.coverLetter.delete({
    where: {
      id,
      userId: user.id,
    },
  });
}