import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Check, Award } from "lucide-react";

// Calculate builder score
const calculateBuilderScore = (founder: any) => {
  let score = 0;
  
  // Has proof link? (+30)
  if (founder.proof && founder.proof.trim()) {
    score += 30;
  }
  
  // Proof is live (valid URL format)? (+40)
  if (founder.proof) {
    try {
      new URL(founder.proof);
      score += 40;
    } catch {
      // Invalid URL
    }
  }
  
  // Added Calendly? (+20)
  if (founder.calendlyLink && founder.calendlyLink.trim()) {
    score += 20;
  }
  
  // Completed all fields? (+10)
  const requiredFields = [
    founder.name,
    founder.email,
    founder.building,
    founder.timezone,
    founder.time,
    founder.brings && founder.brings.length > 0,
    founder.needs && founder.needs.length > 0
  ];
  
  if (requiredFields.every(field => field)) {
    score += 10;
  }
  
  return score;
};

// Mock data for demo
const mockFounders = [
  {
    id: 1,
    name: "Sarah Chen",
    email: "sarah@builderswipe.com",
    building: "SaaS analytics dashboard for small businesses",
    brings: ["React", "Product Design", "Growth"],
    needs: ["Backend", "DevOps"],
    time: "10–20 hrs/week",
    timezone: "PST",
    proof: "https://github.com/sarachen/analytics",
    calendlyLink: "https://calendly.com/sarah-chen",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
  },
  {
    id: 2,
    name: "Marcus Thompson",
    email: "marcus@fitremote.app",
    building: "Fitness app for remote workers",
    brings: ["iOS", "Backend", "ML"],
    needs: ["Marketing", "UX Design"],
    time: "Full-time",
    timezone: "EST",
    proof: "https://fitremote.app",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
  },
  {
    id: 3,
    name: "Priya Sharma",
    email: "priya@devtools.io",
    building: "Open-source dev tools for API testing",
    brings: ["Node.js", "Documentation", "Community"],
    needs: ["Frontend", "Co-founder"],
    time: "5 hrs/week",
    timezone: "IST",
    proof: "https://github.com/priya/apitest",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
  },
];

const Swipe = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);

  const currentFounder = mockFounders[currentIndex];

  const handleSwipe = (liked: boolean) => {
    setDirection(liked ? 'right' : 'left');
    
    setTimeout(() => {
      if (currentIndex < mockFounders.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setDirection(null);
        
        // Simulate match on second swipe right
        if (liked && currentIndex === 1) {
          setTimeout(() => {
            navigate("/match", { state: { founder: currentFounder } });
          }, 300);
        }
      } else {
        setCurrentIndex(mockFounders.length);
      }
    }, 300);
  };

  if (!currentFounder) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            No more serious builders today
          </h2>
          <p className="text-muted-foreground mb-6">Come back tomorrow!</p>
          <Button onClick={() => navigate("/")}>Back to Home</Button>
        </div>
      </main>
    );
  }

  const shortenUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname + (urlObj.pathname !== '/' ? '/...' : '');
    } catch {
      return url.substring(0, 30) + '...';
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-background px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground mb-2 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Discover Builders
          </h1>
          <p className="text-sm text-muted-foreground">Serious builders only.</p>
        </div>

        <div
          className={`bg-card rounded-2xl shadow-2xl overflow-hidden border border-border transition-all duration-300 hover:shadow-3xl hover:-translate-y-1 ${
            direction === 'left' ? '-translate-x-full opacity-0 rotate-[-10deg]' : ''
          } ${direction === 'right' ? 'translate-x-full opacity-0 rotate-[10deg]' : 'animate-fade-in'}`}
        >
          <div className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <img
                src={currentFounder.avatar}
                alt={currentFounder.name}
                className="w-16 h-16 rounded-full border-2 border-primary flex-shrink-0"
              />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground mb-1 animate-fade-in">
                  {currentFounder.name}
                </h2>
                <p className="text-sm text-muted-foreground flex items-center gap-2 mb-2 animate-fade-in" style={{ animationDelay: "0.1s" }}>
                  🕗 {currentFounder.timezone} • {currentFounder.time}
                </p>
                <Badge 
                  variant="outline" 
                  className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 font-semibold hover-scale animate-fade-in shadow-md hover:shadow-lg transition-all duration-300"
                  style={{ animationDelay: "0.2s" }}
                >
                  <Award className="w-3 h-3 mr-1" />
                  Builder Score: {calculateBuilderScore(currentFounder)}/100
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Building</h3>
                <p className="text-base text-foreground">{currentFounder.building}</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">I Bring</h3>
                <div className="flex flex-wrap gap-2">
                  {currentFounder.brings.map((skill) => (
                    <Badge key={skill} className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 hover:bg-blue-500/20">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">I Need</h3>
                <div className="flex flex-wrap gap-2">
                  {currentFounder.needs.map((need) => (
                    <Badge key={need} variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30">
                      {need}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-1 pt-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Proof</h3>
                <a
                  href={currentFounder.proof}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline break-all inline-block"
                >
                  {shortenUrl(currentFounder.proof)}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <Button
            onClick={() => handleSwipe(false)}
            variant="outline"
            size="lg"
            className="flex-1 h-14 text-base hover-scale shadow-lg hover:shadow-xl transition-all duration-300 hover:border-destructive hover:text-destructive"
          >
            <X className="mr-2 h-5 w-5" />
            Pass
          </Button>
          <Button
            onClick={() => handleSwipe(true)}
            size="lg"
            className="flex-1 h-14 text-base hover-scale shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            <Check className="mr-2 h-5 w-5" />
            Connect
          </Button>
        </div>
      </div>
    </main>
  );
};

export default Swipe;
