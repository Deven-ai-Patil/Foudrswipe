import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OnboardingTooltipProps {
  isVisible: boolean;
  title: string;
  description: string;
  position: "top" | "bottom" | "left" | "right";
  onNext: () => void;
  onSkip: () => void;
  currentStep: number;
  totalSteps: number;
  targetRef?: React.RefObject<HTMLElement>;
}

export const OnboardingTooltip = ({
  isVisible,
  title,
  description,
  position = "bottom",
  onNext,
  onSkip,
  currentStep,
  totalSteps,
  targetRef,
}: OnboardingTooltipProps) => {
  const getPositionClasses = () => {
    switch (position) {
      case "top":
        return "bottom-full mb-2 left-1/2 -translate-x-1/2";
      case "bottom":
        return "top-full mt-2 left-1/2 -translate-x-1/2";
      case "left":
        return "right-full mr-2 top-1/2 -translate-y-1/2";
      case "right":
        return "left-full ml-2 top-1/2 -translate-y-1/2";
      default:
        return "top-full mt-2 left-1/2 -translate-x-1/2";
    }
  };

  const getArrowClasses = () => {
    switch (position) {
      case "top":
        return "top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-card";
      case "bottom":
        return "bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-card";
      case "left":
        return "left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-card";
      case "right":
        return "right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-card";
      default:
        return "bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-card";
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 z-[60]"
            onClick={onSkip}
          />

          {/* Spotlight effect on target */}
          {targetRef?.current && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed z-[61] pointer-events-none"
              style={{
                top: targetRef.current.getBoundingClientRect().top - 8,
                left: targetRef.current.getBoundingClientRect().left - 8,
                width: targetRef.current.getBoundingClientRect().width + 16,
                height: targetRef.current.getBoundingClientRect().height + 16,
                boxShadow: "0 0 0 4px hsl(var(--primary) / 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.5)",
                borderRadius: "12px",
              }}
            />
          )}

          {/* Tooltip */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: position === "bottom" ? -10 : 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: position === "bottom" ? -10 : 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`fixed z-[62] ${getPositionClasses()} w-80 max-w-[90vw]`}
            style={
              targetRef?.current
                ? {
                    top:
                      position === "bottom"
                        ? targetRef.current.getBoundingClientRect().bottom + 16
                        : position === "top"
                        ? targetRef.current.getBoundingClientRect().top - 16
                        : targetRef.current.getBoundingClientRect().top +
                          targetRef.current.getBoundingClientRect().height / 2,
                    left:
                      position === "right"
                        ? targetRef.current.getBoundingClientRect().right + 16
                        : position === "left"
                        ? targetRef.current.getBoundingClientRect().left - 16
                        : targetRef.current.getBoundingClientRect().left +
                          targetRef.current.getBoundingClientRect().width / 2,
                    transform:
                      position === "left" || position === "right"
                        ? "translateY(-50%)"
                        : "translateX(-50%)",
                  }
                : undefined
            }
          >
            {/* Arrow */}
            <div
              className={`absolute w-0 h-0 border-8 ${getArrowClasses()}`}
            />

            {/* Tooltip content */}
            <motion.div
              className="bg-card border border-border rounded-xl shadow-2xl p-6 relative overflow-hidden"
              initial={{ boxShadow: "0 0 0 0 hsl(var(--primary) / 0.3)" }}
              animate={{
                boxShadow: [
                  "0 0 0 0 hsl(var(--primary) / 0.3)",
                  "0 0 0 8px hsl(var(--primary) / 0)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {/* Animated gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50" />

              <div className="relative">
                {/* Close button */}
                <button
                  onClick={onSkip}
                  className="absolute -top-2 -right-2 p-1 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Step indicator */}
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: totalSteps }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="h-1 flex-1 rounded-full bg-muted overflow-hidden"
                      initial={false}
                    >
                      <motion.div
                        className="h-full bg-primary"
                        initial={{ width: i < currentStep ? "100%" : "0%" }}
                        animate={{ width: i < currentStep ? "100%" : i === currentStep ? "100%" : "0%" }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Title */}
                <motion.h3
                  className="text-lg font-bold text-foreground mb-2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {title}
                </motion.h3>

                {/* Description */}
                <motion.p
                  className="text-sm text-muted-foreground mb-4"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {description}
                </motion.p>

                {/* Action buttons */}
                <motion.div
                  className="flex items-center justify-between gap-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onSkip}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Skip tour
                  </Button>
                  <Button
                    size="sm"
                    onClick={onNext}
                    className="group"
                  >
                    {currentStep === totalSteps - 1 ? "Got it!" : "Next"}
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
