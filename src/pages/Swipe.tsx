import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Check } from "lucide-react";

// Mock data for demo
const mockFounders = [
  {
    id: 1,
    name: "Sarah Chen",
    building: "SaaS analytics dashboard for small businesses",
    brings: ["React", "Product Design", "Growth"],
    needs: ["Backend", "DevOps"],
    time: "10–20 hrs/week",
    timezone: "PST",
    proof: "https://github.com/sarachen/analytics",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
  },
  {
    id: 2,
    name: "Marcus Thompson",
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
            No more builders.
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
    <main className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md">
        <div
          className={`bg-card rounded-2xl shadow-lg p-6 transition-all duration-300 ${
            direction === 'left' ? '-translate-x-full opacity-0' : ''
          } ${direction === 'right' ? 'translate-x-full opacity-0' : ''}`}
        >
          <div className="flex flex-col items-center mb-6">
            <img
              src={currentFounder.avatar}
              alt={currentFounder.name}
              className="w-20 h-20 rounded-full mb-4"
            />
            <h2 className="text-2xl font-bold text-foreground text-center">
              {currentFounder.name}
            </h2>
          </div>

          <div className="space-y-4 mb-8">
            <p className="text-foreground/80 italic text-center">
              Building: {currentFounder.building}
            </p>

            <div className="space-y-2">
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="text-sm text-muted-foreground">Brings:</span>
                {currentFounder.brings.map((skill) => (
                  <Badge key={skill} className="bg-primary/10 text-primary hover:bg-primary/20">
                    {skill}
                  </Badge>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 justify-center">
                <span className="text-sm text-muted-foreground">Needs:</span>
                {currentFounder.needs.map((need) => (
                  <Badge key={need} variant="outline" className="border-amber-300 text-amber-700 bg-amber-50">
                    {need}
                  </Badge>
                ))}
              </div>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              Available: {currentFounder.time} • {currentFounder.timezone}
            </p>

            <div className="text-center">
              <a
                href={currentFounder.proof}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary underline hover:text-primary/80"
              >
                Proof: {shortenUrl(currentFounder.proof)}
              </a>
            </div>
          </div>
        </div>

        <div className="flex gap-0 mt-6">
          <Button
            onClick={() => handleSwipe(false)}
            variant="secondary"
            size="lg"
            className="flex-1 rounded-r-none h-14 text-base"
          >
            <X className="mr-2 h-5 w-5" />
            Pass
          </Button>
          <Button
            onClick={() => handleSwipe(true)}
            size="lg"
            className="flex-1 rounded-l-none h-14 text-base"
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
