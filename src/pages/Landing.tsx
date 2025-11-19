import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/use-notifications";

const Landing = () => {
  const navigate = useNavigate();
  const { requestPermission, permission } = useNotifications();

  useEffect(() => {
    // Request notification permission on first visit
    const hasRequestedPermission = localStorage.getItem("notificationPermissionRequested");
    
    if (!hasRequestedPermission && permission === "default") {
      // Wait a bit before asking to avoid being too aggressive
      const timer = setTimeout(() => {
        requestPermission().then(() => {
          localStorage.setItem("notificationPermissionRequested", "true");
        });
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [permission, requestPermission]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-6xl md:text-7xl font-black text-foreground mb-6 tracking-tight">
          FoundrSwipe
        </h1>
        
        <p className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          Serious builders only.
        </p>
        
        <p className="text-lg md:text-xl text-muted-foreground mb-12">
          Link your live project. Find your co-foundr.
        </p>

        <div className="space-y-4 w-full max-w-sm mx-auto">
          <Button
            onClick={() => navigate("/auth")}
            size="lg"
            className="w-full text-lg font-bold rounded-2xl h-14 shadow-lg hover:scale-105 transition-transform"
          >
            GET STARTED
          </Button>
          
          <p className="text-sm text-muted-foreground">
            Create your Foundr card in 2 minutes
          </p>
        </div>

        <p className="text-sm font-medium text-muted-foreground mt-16">
          Proof required. Dreamers denied.
        </p>
      </div>
    </main>
  );
};

export default Landing;
