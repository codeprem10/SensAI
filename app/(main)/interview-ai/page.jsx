"use client";

import AIInterview from "@/components/ai-interview";
import React from "react";

/**
 * AI Voice Interview Practice Page
 * - Allows users to practice interviews with voice input
 * - Uses Web Speech API for speech recognition and synthesis
 * - Provides AI feedback on answers
 */
export default function AIInterviewPage() {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-5xl md:text-6xl font-bold gradient-title">
          AI Voice Interview Practice
        </h1>
      </div>
      
      <AIInterview />
    </div>
  );
}
