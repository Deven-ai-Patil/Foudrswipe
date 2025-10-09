import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Landing = () => {
  const navigate = useNavigate();

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
            onClick={() => navigate("/create")}
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
