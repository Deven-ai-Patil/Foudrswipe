import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/use-notifications";
import { motion } from "framer-motion";
import { Sparkles, Rocket, Zap } from "lucide-react";

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
    <main className="relative min-h-screen flex items-center justify-center bg-background px-4 overflow-hidden">
      {/* Animated background elements */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            "radial-gradient(circle at 20% 50%, hsl(var(--primary) / 0.1) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 50%, hsl(var(--primary) / 0.1) 0%, transparent 50%)",
            "radial-gradient(circle at 50% 80%, hsl(var(--primary) / 0.1) 0%, transparent 50%)",
            "radial-gradient(circle at 20% 50%, hsl(var(--primary) / 0.1) 0%, transparent 50%)",
          ],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />

      {/* Floating icons */}
      <motion.div
        className="absolute top-20 left-20 opacity-20"
        animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <Sparkles className="w-12 h-12" />
      </motion.div>
      
      <motion.div
        className="absolute top-32 right-32 opacity-20"
        animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <Rocket className="w-16 h-16" />
      </motion.div>

      <motion.div
        className="absolute bottom-32 left-40 opacity-20"
        animate={{ y: [0, -15, 0], rotate: [0, 15, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <Zap className="w-10 h-10" />
      </motion.div>

      <div className="text-center max-w-2xl mx-auto relative z-10">
        <motion.h1
          className="text-6xl md:text-7xl font-black text-foreground mb-6 tracking-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          FoundrSwipe
        </motion.h1>
        
        <motion.p
          className="text-2xl md:text-3xl font-bold text-foreground mb-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          Serious builders only.
        </motion.p>
        
        <motion.p
          className="text-lg md:text-xl text-muted-foreground mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        >
          Link your live project. Find your co-foundr.
        </motion.p>

        <motion.div
          className="space-y-4 w-full max-w-sm mx-auto"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => navigate("/auth")}
              size="lg"
              className="w-full text-lg font-bold rounded-2xl h-14 shadow-lg relative overflow-hidden group"
            >
              <span className="relative z-10">GET STARTED</span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.6 }}
              />
            </Button>
          </motion.div>
          
          <motion.p
            className="text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            Create your Foundr card in 2 minutes
          </motion.p>
        </motion.div>

        <motion.p
          className="text-sm font-medium text-muted-foreground mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Proof required. Dreamers denied.
        </motion.p>
      </div>
    </main>
  );
};

export default Landing;
