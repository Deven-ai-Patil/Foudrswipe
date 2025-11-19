import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Check, Award } from "lucide-react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitX, setExitX] = useState(0);
  const [loading, setLoading] = useState(true);

  const currentFounder = profiles[currentIndex];

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

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
      const { data: allProfiles, error } = await supabase
        .from("profiles")
        .select("*")
        .neq("id", session.user.id)
        .not("id", "in", `(${swipedIds.length > 0 ? swipedIds.join(',') : 'null'})`);

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

  const handleSwipe = (liked: boolean) => {
    setExitX(liked ? 300 : -300);
    
    if (liked) {
      handleSwipeRight();
    } else {
      handleSwipeLeft();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg">Loading profiles...</p>
      </div>
    );
  }

  if (!currentFounder) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-3xl font-bold mb-4">No More Profiles</h2>
          <p className="text-muted-foreground mb-6">
            You've reviewed all available founders. Check back later for new profiles!
          </p>
          <Button onClick={() => navigate("/messages")}>
            View Messages
          </Button>
        </div>
      </div>
    );
  }

  const builderScore = calculateBuilderScore(currentFounder);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4 border-b border-border">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">FoundrSwipe</h1>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate("/messages")}
          >
            Messages
          </Button>
        </div>
      </header>

      {/* Swipe Area */}
      <div className="flex-1 flex items-center justify-center p-4 pb-24">
        <div className="relative w-full max-w-md aspect-[3/4]">
          <motion.div
            className="absolute inset-0 bg-card border-2 border-border rounded-2xl shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            style={{ x, rotate, opacity }}
            animate={exitX !== 0 ? { x: exitX } : {}}
          >
            {/* Card Content */}
            <div className="h-full flex flex-col">
              {/* Avatar Section */}
              <div className="relative h-1/2 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <img 
                  src={currentFounder.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentFounder.name}`}
                  alt={currentFounder.name}
                  className="w-32 h-32 rounded-full border-4 border-background shadow-lg object-cover"
                />
                
                {/* Builder Score Badge */}
                <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full border-2 border-primary flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-primary" />
                  <span className="font-bold text-primary">{builderScore}</span>
                </div>
              </div>

              {/* Info Section */}
              <div className="flex-1 p-6 overflow-y-auto">
                <h2 className="text-2xl font-bold mb-1">{currentFounder.name}</h2>
                <p className="text-sm text-muted-foreground mb-4">{currentFounder.email}</p>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-sm mb-2">Building</h3>
                    <p className="text-sm">{currentFounder.building}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-sm mb-2">Brings</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentFounder.brings?.map((skill: string, i: number) => (
                        <Badge key={i} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-sm mb-2">Needs</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentFounder.needs?.map((need: string, i: number) => (
                        <Badge key={i} variant="outline">{need}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Availability:</span>
                      <p className="font-medium">{currentFounder.availability || "Not specified"}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Timezone:</span>
                      <p className="font-medium">{currentFounder.timezone || "Not specified"}</p>
                    </div>
                  </div>

                  {currentFounder.proof_of_work && (
                    <div>
                      <h3 className="font-semibold text-sm mb-1">Proof of Work</h3>
                      <a 
                        href={currentFounder.proof_of_work}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline break-all"
                      >
                        {currentFounder.proof_of_work}
                      </a>
                    </div>
                  )}

                  {currentFounder.calendly_link && (
                    <div>
                      <h3 className="font-semibold text-sm mb-1">Calendly</h3>
                      <a 
                        href={currentFounder.calendly_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline break-all"
                      >
                        {currentFounder.calendly_link}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-background/80 backdrop-blur-sm border-t border-border">
        <div className="max-w-md mx-auto flex items-center justify-center gap-6">
          <Button
            size="lg"
            variant="outline"
            className="w-16 h-16 rounded-full border-2"
            onClick={() => handleSwipe(false)}
          >
            <X className="w-8 h-8" />
          </Button>
          <Button
            size="lg"
            className="w-16 h-16 rounded-full"
            onClick={() => handleSwipe(true)}
          >
            <Check className="w-8 h-8" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Swipe;

