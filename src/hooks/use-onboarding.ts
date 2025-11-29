import { useState, useEffect, useCallback } from "react";

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  position: "top" | "bottom" | "left" | "right";
  page: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to FoundrSwipe! 🚀",
    description: "Let's take a quick tour to help you find your perfect co-founder. This will only take a minute!",
    position: "bottom",
    page: "/",
  },
  {
    id: "create-profile",
    title: "Create Your Foundr Card",
    description: "First, you'll need to create your profile. Share what you're building, what you bring, and what you need!",
    position: "bottom",
    page: "/",
  },
  {
    id: "swipe-cards",
    title: "Swipe to Connect",
    description: "Swipe right on founders you'd like to work with, or left to pass. When you both swipe right, it's a match!",
    position: "top",
    page: "/swipe",
  },
  {
    id: "view-matches",
    title: "Check Your Matches",
    description: "View all your matches here and start conversations with potential co-founders!",
    position: "top",
    page: "/match",
  },
  {
    id: "messages",
    title: "Start Chatting",
    description: "Message your matches in real-time and schedule calls to discuss your collaboration!",
    position: "top",
    page: "/messages",
  },
];

export const useOnboarding = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isOnboardingActive, setIsOnboardingActive] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding
    const completed = localStorage.getItem("onboarding_completed");
    if (completed === "true") {
      setHasCompletedOnboarding(true);
      setIsOnboardingActive(false);
    } else {
      // Start onboarding after a brief delay
      const timer = setTimeout(() => {
        setIsOnboardingActive(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const nextStep = useCallback(() => {
    if (currentStepIndex < ONBOARDING_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      completeOnboarding();
    }
  }, [currentStepIndex]);

  const skipOnboarding = useCallback(() => {
    completeOnboarding();
  }, []);

  const completeOnboarding = useCallback(() => {
    localStorage.setItem("onboarding_completed", "true");
    setIsOnboardingActive(false);
    setHasCompletedOnboarding(true);
  }, []);

  const resetOnboarding = useCallback(() => {
    localStorage.removeItem("onboarding_completed");
    setCurrentStepIndex(0);
    setIsOnboardingActive(true);
    setHasCompletedOnboarding(false);
  }, []);

  const currentStep = ONBOARDING_STEPS[currentStepIndex];

  return {
    currentStep,
    currentStepIndex,
    totalSteps: ONBOARDING_STEPS.length,
    isOnboardingActive,
    hasCompletedOnboarding,
    nextStep,
    skipOnboarding,
    resetOnboarding,
    allSteps: ONBOARDING_STEPS,
  };
};
