'use server'

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

//generative ai call
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model:"models/gemini-flash-latest",
})

// Mock industry insights data
const MOCK_INDUSTRY_INSIGHTS = {
  "Software Development": {
    salaryRanges: [
      { role: "Junior Developer", min: 50000, max: 70000, median: 60000, location: "USA" },
      { role: "Mid-level Developer", min: 80000, max: 120000, median: 100000, location: "USA" },
      { role: "Senior Developer", min: 120000, max: 200000, median: 150000, location: "USA" },
      { role: "DevOps Engineer", min: 100000, max: 180000, median: 140000, location: "USA" },
      { role: "Full Stack Developer", min: 90000, max: 150000, median: 120000, location: "USA" }
    ],
    growthRate: 8.5,
    demandLevel: "High",
    topSkills: ["React", "Node.js", "TypeScript", "Python", "AWS"],
    marketOutlook: "Positive",
    keyTrends: ["AI/ML Integration", "Cloud-First Development", "Microservices", "DevOps", "Low-Code Platforms"],
    recommendedSkills: ["AI/ML", "Cloud Architecture", "Kubernetes", "GraphQL", "Cybersecurity"]
  },
  "Data Science": {
    salaryRanges: [
      { role: "Junior Data Scientist", min: 65000, max: 85000, median: 75000, location: "USA" },
      { role: "Data Scientist", min: 100000, max: 140000, median: 120000, location: "USA" },
      { role: "Senior Data Scientist", min: 140000, max: 220000, median: 180000, location: "USA" },
      { role: "ML Engineer", min: 120000, max: 200000, median: 160000, location: "USA" },
      { role: "Analytics Engineer", min: 95000, max: 150000, median: 122500, location: "USA" }
    ],
    growthRate: 12.3,
    demandLevel: "High",
    topSkills: ["Python", "SQL", "TensorFlow", "Machine Learning", "Statistics"],
    marketOutlook: "Positive",
    keyTrends: ["Generative AI", "MLOps", "Data Privacy", "Real-time Analytics", "AutoML"],
    recommendedSkills: ["Generative AI", "LLMs", "Advanced Statistics", "Big Data", "ETL Optimization"]
  },
  "default": {
    salaryRanges: [
      { role: "Entry Level", min: 40000, max: 60000, median: 50000, location: "USA" },
      { role: "Mid-level Professional", min: 70000, max: 110000, median: 90000, location: "USA" },
      { role: "Senior Professional", min: 110000, max: 180000, median: 145000, location: "USA" },
      { role: "Team Lead", min: 120000, max: 200000, median: 160000, location: "USA" },
      { role: "Manager", min: 130000, max: 220000, median: 175000, location: "USA" }
    ],
    growthRate: 5.2,
    demandLevel: "Medium",
    topSkills: ["Communication", "Problem Solving", "Project Management", "Technical Skills", "Leadership"],
    marketOutlook: "Neutral",
    keyTrends: ["Remote Work", "Upskilling", "Diversity & Inclusion", "Digital Transformation", "Automation"],
    recommendedSkills: ["Digital Skills", "Emotional Intelligence", "Adaptability", "Data Literacy", "Continuous Learning"]
  }
};

function getMockInsights(industry) {
  return MOCK_INDUSTRY_INSIGHTS[industry] || MOCK_INDUSTRY_INSIGHTS["default"];
}

//function to generate ai insights
export const generateAIinsights=async(industry)=>{
    try {
        if (!industry) {
            console.warn("⚠️ Industry not provided, using default mock insights");
            return getMockInsights("default");
        }

        if (!process.env.GEMINI_API_KEY) {
            console.warn("⚠️ GEMINI_API_KEY not set, using mock insights");
            return getMockInsights(industry);
        }

        try {
            const prompt = `
              Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
              {
                "salaryRanges": [
                  { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
                ],
                "growthRate": number,
                "demandLevel": "High" | "Medium" | "Low",
                "topSkills": ["skill1", "skill2"],
                "marketOutlook": "Positive" | "Neutral" | "Negative",
                "keyTrends": ["trend1", "trend2"],
                "recommendedSkills": ["skill1", "skill2"]
              }
              
              IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
              Include at least 5 common roles for salary ranges.
              Growth rate should be a percentage.
              Include at least 5 skills and trends.
            `; 

            console.log("Generating AI insights for industry:", industry);

            const result = await model.generateContent(prompt);
            const response = result.response;
            const text = response.text();
            const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

            const parsed = JSON.parse(cleanedText);
            console.log("✅ AI insights generated successfully");
            return parsed;
        } catch (apiError) {
            console.warn("⚠️ API error generating insights, using mock data:", apiError);
            return getMockInsights(industry);
        }
    } catch (error) {
        console.error("generateAIinsights error:", error);
        // Final fallback
        return getMockInsights(industry);
    }
};

export async function getIndustryInsights(){
    try {
        //check if user is logged in
        const {userId} = await auth();
        if(!userId) throw new Error('Unauthorized');
    
        //to find user in db
        const user = await db.user.findUnique({
            where:{
                clerkUserId : userId,
            },
            include : {
                industryInsight : true,
            },
        });
        if(!user) throw new Error('user not found');

        //check if industry insights is accepted by user
        if(!user.industryInsight){
            if (!user.industry) {
                throw new Error("Please complete your profile with an industry first");
            }

            try {
                const insights = await generateAIinsights(user.industry);

                const industryInsight = await db.industryInsight.create({
                    data:{
                        industry: user.industry,
                        ...insights,
                        nextUpdate: new Date(Date.now() + 7*24*60*60*1000),
                    }
                });
                return industryInsight;
            } catch (createError) {
                console.error("Error creating industry insight:", createError);
                // Return mock insights without saving if creation fails
                const insights = await generateAIinsights(user.industry);
                return {
                    industry: user.industry,
                    ...insights,
                    lastUpdated: new Date(),
                    nextUpdate: new Date(Date.now() + 7*24*60*60*1000),
                };
            }
        }
        return user.industryInsight;
    } catch (error) {
        console.error("getIndustryInsights error:", error);
        // Return mock data as fallback
        return getMockInsights("default");
    }
}
    






// ///////CHATGPT/////////