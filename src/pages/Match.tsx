import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Calendar, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/hooks/use-notifications";

const Match = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { showMatchNotification } = useNotifications();
  const [copied, setCopied] = useState(false);

  const founder = state?.founder;

  useEffect(() => {
    if (founder) {
      showMatchNotification(founder.name);
    }
  }, [founder, showMatchNotification]);

  if (!founder) {
    navigate("/");
    return null;
  }

  const currentUser = JSON.parse(
    localStorage.getItem("foundrProfile") || '{"name":"You","building":"something cool"}'
  );

  const introMessage = `Hey ${founder.name.split(" ")[0]}! Loved your project "${
    founder.building
  }". I'm building "${currentUser.building}" — open to a quick call?`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(introMessage);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Intro message copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-background px-4 py-8">
      <div className="w-full max-w-md animate-scale-in">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4 hover-scale shadow-lg">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-primary font-bold">It's a Match!</span>
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground">You both want to connect</p>
        </div>

        <div className="bg-card rounded-2xl shadow-xl overflow-hidden border border-border mb-6 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 animate-fade-in">
          <div className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <img
                src={founder.avatar}
                alt={founder.name}
                className="w-16 h-16 rounded-full border-2 border-primary flex-shrink-0 hover-scale shadow-lg"
              />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground mb-1">{founder.name}</h2>
                <p className="text-sm text-muted-foreground">
                  🕗 {founder.timezone} • {founder.time}
                </p>
              </div>
            </div>

            <div className="space-y-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <div className="space-y-1">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Building
                </h3>
                <p className="text-base text-foreground">{founder.building}</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Brings
                </h3>
                <div className="flex flex-wrap gap-2">
                  {founder.brings?.map((skill: string) => (
                    <Badge
                      key={skill}
                      className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 hover-scale"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Needs
                </h3>
                <div className="flex flex-wrap gap-2">
                  {founder.needs?.map((need: string) => (
                    <Badge
                      key={need}
                      variant="outline"
                      className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover-scale"
                    >
                      {need}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-4 mb-6 hover:shadow-lg transition-all duration-300 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <h3 className="text-sm font-semibold text-foreground mb-2">
            📋 Copy This Intro Message
          </h3>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            {introMessage}
          </p>
          <Button
            onClick={copyToClipboard}
            variant="outline"
            className="w-full hover-scale transition-all duration-300"
          >
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4 animate-scale-in" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy Intro Message
              </>
            )}
          </Button>
        </div>

        <div className="flex gap-3 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <Button variant="outline" className="flex-1 hover-scale" onClick={() => navigate("/swipe")}>
            Keep Swiping
          </Button>
          <Button className="flex-1 hover-scale shadow-lg hover:shadow-xl">
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Call
          </Button>
        </div>
      </div>
    </main>
  );
};

export default Match;
