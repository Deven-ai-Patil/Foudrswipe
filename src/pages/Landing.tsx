import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
          FoundrSwipe
        </h1>
        
        <p className="text-xl text-muted-foreground mb-2">
          Serious builders only.
        </p>
        
        <p className="text-base text-muted-foreground mb-8">
          Link your live project. Find your co-foundr.
        </p>

        <Button
          onClick={() => navigate("/create")}
          size="lg"
          className="w-full max-w-xs mx-auto text-base font-medium"
        >
          Create Your Foundr Card
        </Button>

        <p className="text-xs text-muted-foreground/60 mt-12">
          Proof required. Dreamers denied.
        </p>
      </div>
    </main>
  );
};

export default Landing;
