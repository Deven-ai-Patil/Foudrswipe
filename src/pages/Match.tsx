import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Calendar, Sparkles, Heart } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/hooks/use-notifications";
import { motion } from "framer-motion";
import { OnboardingTooltip } from "@/components/OnboardingTooltip";
import { useOnboarding } from "@/hooks/use-onboarding";

const Match = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { showMatchNotification } = useNotifications();
  const { currentStep, currentStepIndex, totalSteps, isOnboardingActive, nextStep, skipOnboarding } = useOnboarding();
  const [copied, setCopied] = useState(false);
  const messageButtonRef = useRef<HTMLDivElement>(null);

  const founder = state?.founder;

  useEffect(() => {
    if (founder) {
      showMatchNotification(founder.name);
    }
    // Only show notification once when component mounts with founder
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!founder) {
    navigate("/");
    return null;
  }

  const currentUser = JSON.parse(
    localStorage.getItem("foundrProfile") || '{"name":"You","building":"something cool"}'
  );

  const introMessage = `Hey ${founder.name.split(" ")[0]}! Loved your project "${
    founder.building
  }". I'm building "${currentUser.building}" — open to a quick call?`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(introMessage);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Intro message copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-background px-4 py-8 overflow-hidden">
      {/* Animated confetti particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 rounded-full"
          style={{
            backgroundColor: i % 3 === 0 ? "hsl(var(--primary))" : i % 3 === 1 ? "hsl(var(--success))" : "hsl(var(--accent))",
            left: `${Math.random() * 100}%`,
            top: -20,
          }}
          animate={{
            y: ["0vh", "100vh"],
            x: [0, Math.random() * 100 - 50],
            rotate: [0, 360],
            opacity: [1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* Floating hearts */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`heart-${i}`}
          className="absolute opacity-20"
          style={{
            left: `${10 + i * 12}%`,
            bottom: -50,
          }}
          animate={{
            y: [0, -800],
            opacity: [0, 0.3, 0],
            scale: [0, 1, 0.5],
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.5,
          }}
        >
          <Heart className="w-6 h-6 fill-current text-primary" />
        </motion.div>
      ))}

      <div className="w-full max-w-md relative z-10">
        <motion.div
          className="text-center mb-8"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4 shadow-lg"
            animate={{
              boxShadow: [
                "0 0 20px rgba(0,0,0,0.1)",
                "0 0 40px rgba(0,0,0,0.15)",
                "0 0 20px rgba(0,0,0,0.1)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="h-5 w-5 text-primary" />
            </motion.div>
            <span className="text-primary font-bold">It's a Match!</span>
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 0.5 }}
            >
              <Sparkles className="h-5 w-5 text-primary" />
            </motion.div>
          </motion.div>
          <motion.p
            className="text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            You both want to connect
          </motion.p>
        </motion.div>

        <motion.div
          className="bg-card rounded-2xl shadow-xl overflow-hidden border border-border mb-6"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.2 }}
          whileHover={{ scale: 1.02, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}
        >
          <div className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <motion.img
                src={founder.avatar}
                alt={founder.name}
                className="w-16 h-16 rounded-full border-2 border-primary flex-shrink-0 shadow-lg"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.4 }}
                whileHover={{ scale: 1.1, rotate: 5 }}
              />
              <div className="flex-1">
                <motion.h2
                  className="text-2xl font-bold text-foreground mb-1"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {founder.name}
                </motion.h2>
                <motion.p
                  className="text-sm text-muted-foreground"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  🕗 {founder.timezone} • {founder.time}
                </motion.p>
              </div>
            </div>

            <motion.div
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <div className="space-y-1">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Building
                </h3>
                <p className="text-base text-foreground">{founder.building}</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Brings
                </h3>
                <div className="flex flex-wrap gap-2">
                  {founder.brings?.map((skill: string, i: number) => (
                    <motion.div
                      key={skill}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.8 + i * 0.05, type: "spring" }}
                      whileHover={{ scale: 1.1, rotate: 2 }}
                    >
                      <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        {skill}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Needs
                </h3>
                <div className="flex flex-wrap gap-2">
                  {founder.needs?.map((need: string, i: number) => (
                    <motion.div
                      key={need}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1 + i * 0.05, type: "spring" }}
                      whileHover={{ scale: 1.1, rotate: -2 }}
                    >
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30">
                        {need}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-4 mb-6"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
        >
          <h3 className="text-sm font-semibold text-foreground mb-2">
            📋 Copy This Intro Message
          </h3>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            {introMessage}
          </p>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={copyToClipboard}
              variant="outline"
              className="w-full"
            >
              {copied ? (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Check className="mr-2 h-4 w-4" />
                  </motion.div>
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Intro Message
                </>
              )}
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          className="flex gap-3"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div className="flex-1" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="outline" className="w-full" onClick={() => navigate("/swipe")}>
              Keep Swiping
            </Button>
          </motion.div>
          <motion.div ref={messageButtonRef} className="flex-1" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button className="w-full shadow-lg" onClick={() => navigate("/messages")}>
              <Calendar className="mr-2 h-4 w-4" />
              Start Messaging
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Onboarding Tooltip */}
      {isOnboardingActive && currentStep?.page === "/match" && (
        <OnboardingTooltip
          isVisible={true}
          title={currentStep.title}
          description={currentStep.description}
          position="top"
          onNext={nextStep}
          onSkip={skipOnboarding}
          currentStep={currentStepIndex}
          totalSteps={totalSteps}
          targetRef={messageButtonRef}
        />
      )}
    </main>
  );
};

export default Match;
