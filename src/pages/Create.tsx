import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { X, Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const Create = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    building: "",
    timezone: "",
    time: "",
    proofLink: "",
    calendlyLink: "",
  });

  // Check auth and load profile
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUserId(session.user.id);

      // Load existing profile data
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profile) {
        setFormData({
          name: profile.name || "",
          email: profile.email || "",
          building: profile.building || "",
          timezone: profile.timezone || "",
          time: profile.availability || "",
          proofLink: profile.proof_of_work || "",
          calendlyLink: profile.calendly_link || "",
        });
        setBrings(profile.brings || []);
        setNeeds(profile.needs || []);
        if (profile.photo_url) {
          setPhotoPreview(profile.photo_url);
        }
      }

      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  const [brings, setBrings] = useState<string[]>([]);
  const [needs, setNeeds] = useState<string[]>([]);
  const [bringsInput, setBringsInput] = useState("");
  const [needsInput, setNeedsInput] = useState("");

  const addTag = (type: 'brings' | 'needs', value: string) => {
    if (!value.trim()) return;
    
    if (type === 'brings') {
      if (!brings.includes(value.trim())) {
        setBrings([...brings, value.trim()]);
      }
      setBringsInput("");
    } else {
      if (!needs.includes(value.trim())) {
        setNeeds([...needs, value.trim()]);
      }
      setNeedsInput("");
    }
  };

  const removeTag = (type: 'brings' | 'needs', value: string) => {
    if (type === 'brings') {
      setBrings(brings.filter(item => item !== value));
    } else {
      setNeeds(needs.filter(item => item !== value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (brings.length === 0) {
      toast({
        variant: "destructive",
        title: "Skills required",
        description: "Add at least one skill you bring to the table.",
      });
      return;
    }

    if (needs.length === 0) {
      toast({
        variant: "destructive",
        title: "Needs required",
        description: "Add at least one thing you're looking for.",
      });
      return;
    }

    if (!formData.proofLink.trim()) {
      toast({
        variant: "destructive",
        title: "Proof link required",
        description: "Link your live project (GitHub, Lovable app, Figma, etc.). Dreamers not allowed.",
      });
      return;
    }

    if (!userId) {
      toast({
        title: "Error",
        description: "You must be logged in to create a profile.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    // Save to database
    const { error } = await supabase
      .from("profiles")
      .update({
        name: formData.name,
        email: formData.email,
        building: formData.building,
        brings: brings,
        needs: needs,
        availability: formData.time,
        timezone: formData.timezone,
        photo_url: photoPreview || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`,
        proof_of_work: formData.proofLink,
        calendly_link: formData.calendlyLink,
      })
      .eq("id", userId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Profile created!",
      description: "Ready to find your co-foundr.",
    });

    navigate("/swipe");
  };


  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <motion.div
        className="min-h-screen bg-background flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="flex flex-col items-center gap-4"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-12 h-12 text-primary" />
          <motion.p
            className="text-lg"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Loading...
          </motion.p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <main className="min-h-screen bg-background py-8 px-4">
      <motion.div
        className="max-w-md mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="mb-6"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-2xl font-bold text-foreground mb-1">Create Your Foundr Card</h1>
          <p className="text-sm text-muted-foreground">Serious builders only. All fields required.</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <motion.div
            className="space-y-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Label htmlFor="photo">Profile Photo (Optional)</Label>
            <div className="flex items-center gap-4">
              <motion.div whileHover={{ scale: 1.1, rotate: 5 }}>
                <Avatar className="h-20 w-20 border-2 border-border">
                  <AvatarImage src={photoPreview || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name || 'default'}`} />
                  <AvatarFallback>{formData.name?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                </Avatar>
              </motion.div>
              <div className="flex-1">
                <Label htmlFor="photo-upload" className="cursor-pointer">
                  <motion.div
                    className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-border rounded-md hover:border-primary transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Upload className="h-4 w-4" />
                    <span className="text-sm">Upload Photo</span>
                  </motion.div>
                  <Input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </Label>
                <p className="text-xs text-muted-foreground mt-1">Or we'll use a default avatar</p>
              </div>
            </div>
          </motion.div>

          {/* Animate each form field */}
          {[
            { id: "name", label: "Full Name", placeholder: "Alex Rivera", type: "input" },
            { id: "email", label: "Email", placeholder: "you@startup.com", type: "input" },
            { id: "building", label: "What I'm building", placeholder: "AI tool for indie writers", type: "textarea" }
          ].map((field, index) => (
            <motion.div
              key={field.id}
              className="space-y-2"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <Label htmlFor={field.id}>{field.label}</Label>
              {field.type === "textarea" ? (
                <Textarea
                  id={field.id}
                  placeholder={field.placeholder}
                  maxLength={100}
                  value={formData[field.id as keyof typeof formData]}
                  onChange={(e) => setFormData({...formData, [field.id]: e.target.value})}
                  required
                  className="resize-none h-20 transition-all duration-200 focus:scale-[1.01]"
                />
              ) : (
                <Input
                  id={field.id}
                  type={field.id === "email" ? "email" : "text"}
                  placeholder={field.placeholder}
                  value={formData[field.id as keyof typeof formData]}
                  onChange={(e) => setFormData({...formData, [field.id]: e.target.value})}
                  required
                  className="transition-all duration-200 focus:scale-[1.01]"
                />
              )}
              {field.id === "email" && (
                <p className="text-xs text-muted-foreground">Used for magic link login</p>
              )}
              {field.id === "building" && (
                <p className="text-xs text-muted-foreground">One sentence. Be specific.</p>
              )}
            </motion.div>
          ))}

          <motion.div
            className="space-y-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <Label htmlFor="brings" className="flex items-center gap-1">
              I bring <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="brings"
                placeholder="Add your skills (e.g., React, Growth, UX)"
                value={bringsInput}
                onChange={(e) => setBringsInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag('brings', bringsInput);
                  }
                }}
                className="flex-1"
              />
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  type="button" 
                  onClick={() => addTag('brings', bringsInput)}
                  className="shrink-0 w-[70px]"
                >
                  Add
                </Button>
              </motion.div>
            </div>
            <p className="text-xs text-muted-foreground">Press Enter to add. At least one required.</p>
            <div className="flex flex-wrap gap-2 min-h-[32px]">
              {brings.map((skill, i) => (
                <motion.div
                  key={skill}
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 200, delay: i * 0.05 }}
                  whileHover={{ scale: 1.1, rotate: 2 }}
                >
                  <Badge variant="secondary" className="gap-1">
                    {skill}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive transition-colors"
                      onClick={() => removeTag('brings', skill)}
                    />
                  </Badge>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="space-y-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Label htmlFor="needs" className="flex items-center gap-1">
              I need <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="needs"
                placeholder="What's missing? (e.g., Backend, Co-foundr)"
                value={needsInput}
                onChange={(e) => setNeedsInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag('needs', needsInput);
                  }
                }}
                className="flex-1"
              />
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  type="button" 
                  onClick={() => addTag('needs', needsInput)}
                  className="shrink-0 w-[70px]"
                >
                  Add
                </Button>
              </motion.div>
            </div>
            <p className="text-xs text-muted-foreground">Press Enter to add. At least one required.</p>
            <div className="flex flex-wrap gap-2 min-h-[32px]">
              {needs.map((need, i) => (
                <motion.div
                  key={need}
                  initial={{ scale: 0, rotate: 10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: -10 }}
                  transition={{ type: "spring", stiffness: 200, delay: i * 0.05 }}
                  whileHover={{ scale: 1.1, rotate: -2 }}
                >
                  <Badge variant="outline" className="gap-1">
                    {need}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive transition-colors"
                      onClick={() => removeTag('needs', need)}
                    />
                  </Badge>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="space-y-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <Label htmlFor="time">Time available</Label>
            <Select value={formData.time} onValueChange={(value) => setFormData({...formData, time: value})} required>
              <SelectTrigger id="time" className="bg-card">
                <SelectValue placeholder="Select availability" />
              </SelectTrigger>
              <SelectContent className="bg-card">
                <SelectItem value="5 hrs/week">5 hrs/week</SelectItem>
                <SelectItem value="10–20 hrs/week">10–20 hrs/week</SelectItem>
                <SelectItem value="Full-time">Full-time</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          <motion.div
            className="space-y-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <Label htmlFor="timezone">Timezone</Label>
            <Input
              id="timezone"
              placeholder="e.g., PST, UTC+1, IST"
              value={formData.timezone}
              onChange={(e) => setFormData({...formData, timezone: e.target.value})}
              required
              className="transition-all duration-200 focus:scale-[1.01]"
            />
          </motion.div>

          <motion.div
            className="space-y-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.1 }}
          >
            <Label htmlFor="proof" className="text-base font-semibold">
              ✅ Proof Link (REQUIRED)
            </Label>
            <Input
              id="proof"
              type="url"
              placeholder="https://github.com/your/repo or yourapp.lovable.app"
              value={formData.proofLink}
              onChange={(e) => setFormData({...formData, proofLink: e.target.value})}
              required
              className="border-2 transition-all duration-200 focus:scale-[1.01]"
            />
            <div className="text-xs space-y-1">
              <p className="text-muted-foreground font-medium">You must link a real project to join.</p>
              <p className="text-muted-foreground">✅ Good: yourapp.lovable.app, github.com/you/project, figma.com/proto/...</p>
              <p className="text-muted-foreground">❌ Not enough: "I have an idea", "Coming soon"</p>
            </div>
          </motion.div>

          <motion.div
            className="space-y-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <Label htmlFor="calendly">📅 Calendly / Meeting Link (Optional)</Label>
            <Input
              id="calendly"
              type="url"
              placeholder="https://calendly.com/your-link or cal.com/yourname"
              value={formData.calendlyLink}
              onChange={(e) => setFormData({...formData, calendlyLink: e.target.value})}
              className="transition-all duration-200 focus:scale-[1.01]"
            />
            <p className="text-xs text-muted-foreground">Makes it easy for matches to book time with you</p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button type="submit" size="lg" className="w-full">
              Save & Start Swiping
            </Button>
          </motion.div>
        </form>
      </motion.div>
    </main>
  );
};

export default Create;
