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

      <div className="text-center max-w-md mx-auto space-y-6 relative z-10">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          It's a match! 🎉
        </h1>
        
        <p className="text-xl text-muted-foreground mb-8">
          You both want to build together
        </p>

        <div className="flex justify-center items-center gap-8 mb-8">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center mb-2">
              <span className="text-2xl">👤</span>
            </div>
            <p className="text-sm font-medium">You</p>
          </div>
          
          <div className="text-4xl animate-pulse">
            ❤️
          </div>
          
          <div className="text-center">
            <img 
              src={founder.avatar}
              alt={founder.name}
              className="w-24 h-24 rounded-full border-2 border-primary mb-2"
            />
            <p className="text-sm font-medium">{founder.name}</p>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border space-y-4">
          <p className="text-lg font-semibold text-foreground">
            You matched with {founder.name}!
          </p>
          <p className="text-sm text-muted-foreground">
            Their email: <span className="text-foreground font-medium">{founder.email || "email@example.com"}</span>
          </p>
          <div className="bg-muted/50 p-4 rounded-md text-left">
            <p className="text-sm text-muted-foreground mb-2">👉 Send a quick intro:</p>
            <p className="text-sm italic text-foreground">
              "Hey {founder.name.split(' ')[0]}, saw we both love shipping — want to hop on a call?"
            </p>
          </div>
        </div>

        <Button 
          onClick={() => navigate("/swipe")}
          size="lg"
          className="w-full"
        >
          Keep Swiping
        </Button>

        <footer className="pt-8 text-xs text-muted-foreground/60">
          Built with FounderSwipe — Serious builders only.
        </footer>
      </div>
    </main>
  );
};

export default Match;
