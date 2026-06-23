"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
function getGeminiModel() {
  return genAI.getGenerativeModel({ model: "models/gemini-flash-latest" });
}


export async function saveResume(content) {
  const { userId } = await auth();
  console.log("Auth userId:", userId);
  
  if (!userId) throw new Error("Unauthorized - No user authenticated");

  try {
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    console.log("User found:", user?.id);
    
    if (!user) throw new Error("User not found in database");

    const resume = await db.resume.upsert({
      where: {
        userId: user.id,
      },
      update: {
        content,
      },
      create: {
        userId: user.id,
        content,
        atsScore: 0, // Default ATS score - will be calculated later
      },
    });

    console.log("Resume saved successfully:", resume.id);
    revalidatePath("/resume");
    return resume;
  } catch (error) {
    console.error("Error saving resume:", error);
    throw new Error(`Failed to save resume: ${error.message}`);
  }
}

export async function getResume() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  return await db.resume.findUnique({
    where: {
      userId: user.id,
    },
  });
}

export async function improveWithAI({ current, type }) {
  let user = null;

  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    user = await db.user.findUnique({
      where: { clerkUserId: userId },
      include: {
        industryInsight: true,
      },
    });

    if (!user) throw new Error("User not found");

    // Validate input
    if (!current?.trim()) {
      throw new Error("Content is empty");
    }

    const model = getGeminiModel();

    const prompt = `
    As an expert resume writer, improve the following ${type} description for a ${user.industry} professional.
    Make it more impactful, quantifiable, and aligned with industry standards.
    Current content: "${current}"

    Requirements:
    1. Use action verbs
    2. Include metrics and results where possible
    3. Highlight relevant technical skills
    4. Keep it concise but detailed
    5. Focus on achievements over responsibilities
    6. Use industry-specific keywords
    
    Format the response as a single paragraph without any additional text or explanations.
  `;

    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      const improvedContent = response.text().trim();
      
      if (!improvedContent) {
        throw new Error("AI returned empty response");
      }

      return improvedContent;
    } catch (aiError) {
      // If AI fails, return improved version of current content
      console.warn("⚠️ AI improvement failed, returning enhanced original:", aiError);
      
      // Simple improvement fallback
      const enhanced = current
        .replace(/responsible for/gi, "Led")
        .replace(/worked on/gi, "Developed")
        .replace(/helped/gi, "Implemented")
        .trim();
      
      return enhanced || current;
    }
  } catch (error) {
    console.error("improveWithAI error:", error);
    
    // Return original content instead of crashing
    if (current) {
      return current;
    }
    
    throw error;
  }
}