"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mic, MicOff, Play, RotateCcw, Volume2 } from "lucide-react";
import { toast } from "sonner";

/**
 * AI Interview Component
 * Features:
 * - Voice-based interview questions
 * - Real-time speech recognition (Web Speech API)
 * - AI feedback on answers
 * - Text-to-speech for questions
 * - Progress tracking
 */
const AIInterview = () => {
  // Interview questions for different roles
  const interviewQuestions = [
    {
      id: 1,
      question: "Tell me about your most significant project. What was your role and what challenges did you face?",
      category: "Experience",
    },
    {
      id: 2,
      question: "How do you handle tight deadlines and multiple priorities?",
      category: "Soft Skills",
    },
    {
      id: 3,
      question: "Describe a time when you had to work with a difficult team member. How did you handle it?",
      category: "Teamwork",
    },
    {
      id: 4,
      question: "What are your long-term career goals and how does this role fit into your plans?",
      category: "Career",
    },
    {
      id: 5,
      question: "Why are you interested in this position and what makes you a good fit?",
      category: "Motivation",
    },
  ];

  // State Management
  const [isStarted, setIsStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Refs
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  // Initialize Web Speech API
  useEffect(() => {
    // Initialize speechSynthesis on client side only
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
    }

    if (typeof window === "undefined") return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast.error("Speech Recognition not supported in this browser. Use Chrome, Edge, or Safari.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.language = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript("");
    };

    recognition.onresult = (event) => {
      let interimTranscript = "";
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          setTranscript((prev) => prev + transcript + " ");
        } else {
          interimTranscript += transcript;
        }
      }
    };

    recognition.onerror = (event) => {
      toast.error(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Start Interview
  const handleStartInterview = () => {
    setIsStarted(true);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setFeedback(null);
    // Speak the first question
    setTimeout(() => speakQuestion(0), 500);
  };

  // Text-to-Speech for questions
  const speakQuestion = (index) => {
    if (!window.speechSynthesis) {
      toast.error("Speech Synthesis not supported");
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const question = interviewQuestions[index].question;
    const utterance = new SpeechSynthesisUtterance(question);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Start Voice Recording
  const handleStartRecording = () => {
    if (recognitionRef.current) {
      setTranscript("");
      recognitionRef.current.start();
    }
  };

  // Stop Voice Recording
  const handleStopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  // Save answer and move to next question
  const handleNextQuestion = async () => {
    if (!transcript.trim()) {
      toast.error("Please provide an answer before moving to next question");
      return;
    }

    // Save current answer
    const currentQuestion = interviewQuestions[currentQuestionIndex];
    setAnswers({
      ...answers,
      [currentQuestionIndex]: {
        question: currentQuestion.question,
        answer: transcript,
      },
    });

    // Move to next question
    if (currentQuestionIndex < interviewQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setTranscript("");
      setFeedback(null);
      // Speak next question
      setTimeout(() => speakQuestion(currentQuestionIndex + 1), 500);
    } else {
      // Interview completed
      toast.success("Interview completed! All answers saved.");
      setIsStarted(false);
    }
  };

  // Get AI Feedback
  const handleGetFeedback = async () => {
    if (!transcript.trim()) {
      toast.error("Please provide an answer first");
      return;
    }

    setIsLoading(true);
    try {
      const currentQuestion = interviewQuestions[currentQuestionIndex];
      
      const response = await fetch("/api/ai-interview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: currentQuestion.question,
          answer: transcript,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get feedback");
      }

      const data = await response.json();
      setFeedback(data.feedback);
      toast.success("Feedback received!");
    } catch (error) {
      console.error("Error getting feedback:", error);
      toast.error("Failed to get feedback. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset Interview
  const handleReset = () => {
    setIsStarted(false);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTranscript("");
    setFeedback(null);
    window.speechSynthesis?.cancel();
  };

  // If not started, show start screen
  if (!isStarted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Ready to Practice?</CardTitle>
            <CardDescription>
              Practice your interview skills with our AI voice interview. You'll be asked 5 questions.
              Speak your answers naturally and get AI feedback.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg text-sm">
              <p className="font-semibold mb-2">📋 What to expect:</p>
              <ul className="space-y-1 text-xs">
                <li>✓ 5 interview questions</li>
                <li>✓ Voice-based responses</li>
                <li>✓ AI feedback on each answer</li>
                <li>✓ Real-time transcription</li>
              </ul>
            </div>
            <Button onClick={handleStartInterview} size="lg" className="w-full">
              <Mic className="h-4 w-4 mr-2" />
              Start Interview
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = interviewQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / interviewQuestions.length) * 100;

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">
            Question {currentQuestionIndex + 1} of {interviewQuestions.length}
          </span>
          <Badge variant="outline">{currentQuestion.category}</Badge>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{currentQuestion.question}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Transcript Display */}
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg min-h-20 max-h-40 overflow-y-auto">
            {transcript ? (
              <p className="text-sm text-gray-700 dark:text-gray-300">{transcript}</p>
            ) : (
              <p className="text-sm text-gray-400">Your answer will appear here...</p>
            )}
          </div>

          {/* Recording Controls */}
          <div className="flex gap-2">
            <Button
              onClick={handleStartRecording}
              disabled={isListening || isSpeaking}
              variant={isListening ? "destructive" : "default"}
              className="flex-1"
            >
              <Mic className="h-4 w-4 mr-2" />
              {isListening ? "Recording..." : "Start Recording"}
            </Button>

            <Button
              onClick={handleStopRecording}
              disabled={!isListening}
              variant="outline"
              className="flex-1"
            >
              <MicOff className="h-4 w-4 mr-2" />
              Stop
            </Button>

            <Button
              onClick={() => speakQuestion(currentQuestionIndex)}
              disabled={isSpeaking}
              variant="outline"
              size="icon"
            >
              <Volume2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Clear Answer */}
          {transcript && (
            <Button
              onClick={() => setTranscript("")}
              variant="ghost"
              size="sm"
              className="w-full"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear Answer
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Feedback Card */}
      {feedback && (
        <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="text-base">💡 AI Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 dark:text-gray-300">{feedback}</p>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={handleGetFeedback}
          disabled={isLoading || !transcript.trim()}
          variant="secondary"
          className="flex-1"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Getting Feedback...
            </>
          ) : (
            "Get AI Feedback"
          )}
        </Button>

        <Button
          onClick={handleNextQuestion}
          disabled={!transcript.trim()}
          className="flex-1"
        >
          {currentQuestionIndex === interviewQuestions.length - 1
            ? "Complete Interview"
            : "Next Question"}
        </Button>
      </div>

      {/* Reset Button */}
      <Button
        onClick={handleReset}
        variant="ghost"
        className="w-full"
      >
        <RotateCcw className="h-4 w-4 mr-2" />
        Start Over
      </Button>
    </div>
  );
};

export default AIInterview;
