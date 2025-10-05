import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const Match = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showConfetti, setShowConfetti] = useState(true);
  
  const founder = location.state?.founder || {
    name: "Alex",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
  };

  useEffect(() => {
    setTimeout(() => setShowConfetti(false), 3000);
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`,
              }}
            >
              <div className="w-2 h-2 bg-success rounded-full" />
            </div>
          ))}
        </div>
      )}

      <div className="text-center max-w-md mx-auto z-10">
        <h1 className="text-4xl font-bold text-success mb-3">
          It's a match! 🎉
        </h1>
        
        <p className="text-lg text-foreground mb-8">
          You and {founder.name} can now build together.
        </p>

        <div className="flex justify-center gap-4 mb-8">
          <div className="relative">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=You`}
              alt="Your avatar"
              className="w-16 h-16 rounded-full ring-4 ring-success shadow-lg"
            />
          </div>
          <div className="relative">
            <img
              src={founder.avatar}
              alt={`${founder.name}'s avatar`}
              className="w-16 h-16 rounded-full ring-4 ring-success shadow-lg"
            />
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 mb-8 shadow-md">
          <p className="text-foreground/80 mb-2">
            ✅ Emails shared! Check your inbox to connect.
          </p>
          <p className="text-sm text-muted-foreground">
            Suggested next step: Share your Calendly!
          </p>
        </div>

        <Button
          onClick={() => navigate("/swipe")}
          size="lg"
          className="w-full max-w-xs bg-foreground text-background hover:bg-foreground/90"
        >
          Keep Swiping
        </Button>
      </div>
    </main>
  );
};

export default Match;
