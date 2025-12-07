import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Check, Award, Settings, RefreshCw } from "lucide-react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { OnboardingTooltip } from "@/components/OnboardingTooltip";
import { useOnboarding } from "@/hooks/use-onboarding";
import { NotificationBell } from "@/components/NotificationBell";

// Calculate builder score
const calculateBuilderScore = (founder: any) => {
  let score = 0;
  
  if (founder.proof_of_work?.trim()) score += 30;
  
  if (founder.proof_of_work) {
    try {
      new URL(founder.proof_of_work);
      score += 40;
    } catch {}
  }
  
  if (founder.calendly_link?.trim()) score += 20;
  
  const requiredFields = [
    founder.name,
    founder.email,
    founder.building,
    founder.timezone,
    founder.availability,
    founder.brings?.length > 0,
    founder.needs?.length > 0
  ];
  
  if (requiredFields.every(field => field)) score += 10;
  
  return score;
};

const Swipe = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentStep, currentStepIndex, totalSteps, isOnboardingActive, nextStep, skipOnboarding } = useOnboarding();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitX, setExitX] = useState(0);
  const [loading, setLoading] = useState(true);
  const swipeCardRef = useRef<HTMLDivElement>(null);

  const currentFounder = profiles[currentIndex];

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setCurrentUserId(session.user.id);

      // Get profiles user has already swiped on
      const { data: swipedProfiles } = await supabase
        .from("swipes")
        .select("swiped_id")
        .eq("swiper_id", session.user.id);

      const swipedIds = swipedProfiles?.map(s => s.swiped_id) || [];

      // Get profiles excluding current user and already swiped profiles
      let query = supabase
        .from("profiles")
        .select("*")
        .neq("id", session.user.id);
      
      // Only add the "not in" filter if there are swiped IDs
      if (swipedIds.length > 0) {
        query = query.not("id", "in", `(${swipedIds.join(',')})`);
      }

      const { data: allProfiles, error } = await query;

      if (error) throw error;

      setProfiles(allProfiles || []);
    } catch (error) {
      console.error("Error loading profiles:", error);
      toast({
        title: "Error",
        description: "Failed to load profiles. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkForMatch = async (swipedUserId: string) => {
    if (!currentUserId) return false;

    // Check if the swiped user has also swiped right on current user
    const { data: mutualSwipe } = await supabase
      .from("swipes")
      .select("*")
      .eq("swiper_id", swipedUserId)
      .eq("swiped_id", currentUserId)
      .maybeSingle();

    if (mutualSwipe) {
      // It's a match! Create match record
      const { error } = await supabase
        .from("matches")
        .insert({
          founder1_id: currentUserId,
          founder2_id: swipedUserId,
        });

      if (!error) {
        return true;
      }
    }

    return false;
  };

  const handleSwipeRight = async () => {
    if (!currentUserId || !currentFounder) return;

    try {
      // Save the swipe
      const { error: swipeError } = await supabase
        .from("swipes")
        .insert({
          swiper_id: currentUserId,
          swiped_id: currentFounder.id,
        });

      if (swipeError) throw swipeError;

      // Check for match
      const isMatch = await checkForMatch(currentFounder.id);

      if (isMatch) {
        // Navigate to match page
        setTimeout(() => {
          navigate("/match", { state: { founder: currentFounder } });
        }, 300);
      } else {
        moveToNextProfile();
      }
    } catch (error) {
      console.error("Error handling swipe:", error);
      toast({
        title: "Error",
        description: "Failed to save swipe. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSwipeLeft = () => {
    moveToNextProfile();
  };

  const moveToNextProfile = () => {
    setTimeout(() => {
      if (currentIndex < profiles.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setExitX(0);
        x.set(0);
      } else {
        setCurrentIndex(profiles.length);
      }
    }, 200);
  };

  const handleDragEnd = (_e: any, info: PanInfo) => {
    const threshold = 100;
    
    if (Math.abs(info.offset.x) > threshold) {
      const liked = info.offset.x > 0;
      setExitX(liked ? 300 : -300);
      
      if (liked) {
        handleSwipeRight();
      } else {
        handleSwipeLeft();
      }
    } else {
      x.set(0);
    }
  };

  const handleSwipe = useCallback((liked: boolean) => {
    setExitX(liked ? 300 : -300);
    
    if (liked) {
      handleSwipeRight();
    } else {
      handleSwipeLeft();
    }
  }, [currentFounder, currentUserId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentFounder) return;
      if (e.key === 'ArrowRight') {
        handleSwipe(true);
      } else if (e.key === 'ArrowLeft') {
        handleSwipe(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentFounder, handleSwipe]);

  if (loading) {
    return (
      <motion.div
        className="min-h-screen bg-background flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="flex flex-col items-center gap-4"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Award className="w-12 h-12 text-primary" />
          <motion.p
            className="text-lg"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Loading profiles...
          </motion.p>
        </motion.div>
      </motion.div>
    );
  }

  if (!currentFounder) {
    return (
      <motion.div
        className="min-h-screen bg-background flex flex-col items-center justify-center p-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <div className="text-center max-w-md">
          <motion.div
            className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Award className="w-12 h-12 text-primary" />
          </motion.div>
          <motion.h2
            className="text-3xl font-bold mb-4"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            You're All Caught Up!
          </motion.h2>
          <motion.p
            className="text-muted-foreground mb-8"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            You've reviewed all available founders. New founders join daily - check back soon!
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-3 justify-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="outline" 
                onClick={() => {
                  setLoading(true);
                  setCurrentIndex(0);
                  loadProfiles();
                }}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={() => navigate("/messages")}>
                View Messages
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  const builderScore = calculateBuilderScore(currentFounder);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <motion.header
        className="p-4 border-b border-border"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-md mx-auto flex items-center justify-between">
          <motion.h1
            className="text-2xl font-bold"
            whileHover={{ scale: 1.05 }}
          >
            FoundrSwipe
          </motion.h1>
          <div className="flex items-center gap-1">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <NotificationBell />
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate("/create")}
                title="Edit Profile"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate("/messages")}
              >
                Messages
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={async () => {
                  await supabase.auth.signOut();
                  navigate("/auth");
                }}
              >
                Logout
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Swipe Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 pb-24">
        {/* Profile Counter */}
        <motion.div 
          className="mb-4 text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <span className="font-medium text-foreground">{currentIndex + 1}</span> of {profiles.length} profiles
          <span className="ml-2 text-xs">(← → keys to swipe)</span>
        </motion.div>

        <div ref={swipeCardRef} className="relative w-full max-w-md aspect-[3/4]">
          {/* LIKE Overlay */}
          <motion.div
            className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
            style={{ opacity: likeOpacity }}
          >
            <div className="bg-green-500/90 text-white text-4xl font-bold px-8 py-4 rounded-lg rotate-[-20deg] border-4 border-white shadow-xl">
              LIKE
            </div>
          </motion.div>
          
          {/* NOPE Overlay */}
          <motion.div
            className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
            style={{ opacity: nopeOpacity }}
          >
            <div className="bg-red-500/90 text-white text-4xl font-bold px-8 py-4 rounded-lg rotate-[20deg] border-4 border-white shadow-xl">
              NOPE
            </div>
          </motion.div>

          <motion.div
            className="absolute inset-0 bg-card border-2 border-border rounded-2xl shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            style={{ x, rotate, opacity }}
            animate={exitX !== 0 ? { x: exitX } : {}}
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            {/* Card Content */}
            <div className="h-full flex flex-col">
              {/* Avatar Section */}
              <motion.div
                className="relative h-1/2 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center"
                whileHover={{ scale: 1.02 }}
              >
                <motion.img 
                  src={currentFounder.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentFounder.name}`}
                  alt={currentFounder.name}
                  className="w-32 h-32 rounded-full border-4 border-background shadow-lg object-cover"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                />
                
                {/* Builder Score Badge */}
                <motion.div
                  className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full border-2 border-primary flex items-center gap-1.5"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  whileHover={{ scale: 1.1 }}
                >
                  <Award className="w-4 h-4 text-primary" />
                  <motion.span
                    className="font-bold text-primary"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {builderScore}
                  </motion.span>
                </motion.div>
              </motion.div>

              {/* Info Section */}
              <motion.div
                className="flex-1 p-6 overflow-y-auto"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-2xl font-bold mb-1">{currentFounder.name}</h2>
                <p className="text-sm text-muted-foreground mb-4">{currentFounder.timezone || "Remote"}</p>

                <div className="space-y-4">
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <h3 className="font-semibold text-sm mb-2">Building</h3>
                    <p className="text-sm">{currentFounder.building}</p>
                  </motion.div>

                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <h3 className="font-semibold text-sm mb-2">Brings</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentFounder.brings?.map((skill: string, i: number) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.7 + i * 0.05 }}
                          whileHover={{ scale: 1.1 }}
                        >
                          <Badge variant="secondary">{skill}</Badge>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    <h3 className="font-semibold text-sm mb-2">Needs</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentFounder.needs?.map((need: string, i: number) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.9 + i * 0.05 }}
                          whileHover={{ scale: 1.1 }}
                        >
                          <Badge variant="outline">{need}</Badge>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  <motion.div
                    className="grid grid-cols-2 gap-4 text-sm"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    <div>
                      <span className="text-muted-foreground">Availability:</span>
                      <p className="font-medium">{currentFounder.availability || "Not specified"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Timezone:</span>
                      <p className="font-medium">{currentFounder.timezone || "Not specified"}</p>
                    </div>
                  </motion.div>

                  {currentFounder.proof_of_work && (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 1.1 }}
                    >
                      <h3 className="font-semibold text-sm mb-1">Proof of Work</h3>
                      <a 
                        href={currentFounder.proof_of_work}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline break-all"
                      >
                        {currentFounder.proof_of_work}
                      </a>
                    </motion.div>
                  )}

                  {currentFounder.calendly_link && (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 1.2 }}
                    >
                      <h3 className="font-semibold text-sm mb-1">Calendly</h3>
                      <a 
                        href={currentFounder.calendly_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline break-all"
                      >
                        {currentFounder.calendly_link}
                      </a>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Action Buttons */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 p-6 bg-background/80 backdrop-blur-sm border-t border-border"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
      >
        <div className="max-w-md mx-auto flex items-center justify-center gap-6">
          <motion.div
            whileHover={{ scale: 1.1, rotate: -5 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button
              size="lg"
              variant="outline"
              className="w-16 h-16 rounded-full border-2"
              onClick={() => handleSwipe(false)}
            >
              <X className="w-8 h-8" />
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button
              size="lg"
              className="w-16 h-16 rounded-full"
              onClick={() => handleSwipe(true)}
            >
              <Check className="w-8 h-8" />
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Onboarding Tooltip */}
      {isOnboardingActive && currentStep?.page === "/swipe" && (
        <OnboardingTooltip
          isVisible={true}
          title={currentStep.title}
          description={currentStep.description}
          position="top"
          onNext={nextStep}
          onSkip={skipOnboarding}
          currentStep={currentStepIndex}
          totalSteps={totalSteps}
          targetRef={swipeCardRef}
        />
      )}
    </div>
  );
};

export default Swipe;

