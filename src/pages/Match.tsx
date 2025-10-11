import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
const Match = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [showConfetti, setShowConfetti] = useState(true);
  const [copied, setCopied] = useState(false);
  
  const founder = location.state?.founder || {
    name: "Alex",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    building: "an amazing startup",
  };

  const currentUser = JSON.parse(localStorage.getItem('foundrProfile') || '{"name":"You","building":"something cool"}');

  const introMessage = `Hey ${founder.name.split(' ')[0]}! Loved your project "${founder.building}". I'm building "${currentUser.building}" — open to a quick call?`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(introMessage);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Intro message copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
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
          
          {founder.calendlyLink && (
            <a 
              href={founder.calendlyLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block w-full"
            >
              <Button className="w-full" variant="default">
                📅 Schedule a Call
              </Button>
            </a>
          )}
          
          <div className="bg-muted/50 p-4 rounded-md text-left space-y-3">
            <p className="text-sm font-medium text-foreground">💬 Copy this intro message:</p>
            <p className="text-sm text-foreground bg-background p-3 rounded border border-border">
              {introMessage}
            </p>
            <Button 
              onClick={copyToClipboard}
              variant="outline"
              className="w-full gap-2"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Intro Message
                </>
              )}
            </Button>
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
          Built with FoundrSwipe — Serious builders only.
        </footer>
      </div>
    </main>
  );
};

export default Match;
