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
import { X, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-md mx-auto animate-fade-in">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-1 animate-slide-in-right">Create Your Foundr Card</h1>
          <p className="text-sm text-muted-foreground animate-fade-in">Serious builders only. All fields required.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="photo">Profile Photo (Optional)</Label>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-2 border-border animate-scale-in">
                <AvatarImage src={photoPreview || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name || 'default'}`} />
                <AvatarFallback>{formData.name?.[0]?.toUpperCase() || '?'}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Label htmlFor="photo-upload" className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-border rounded-md hover:border-primary transition-colors hover-scale">
                    <Upload className="h-4 w-4" />
                    <span className="text-sm">Upload Photo</span>
                  </div>
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
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Alex Rivera"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@startup.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
            <p className="text-xs text-muted-foreground">Used for magic link login</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="building">What I'm building</Label>
            <Textarea
              id="building"
              placeholder="AI tool for indie writers"
              maxLength={100}
              value={formData.building}
              onChange={(e) => setFormData({...formData, building: e.target.value})}
              required
              className="resize-none h-20"
            />
            <p className="text-xs text-muted-foreground">One sentence. Be specific.</p>
          </div>

          <div className="space-y-2">
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
              <Button 
                type="button" 
                onClick={() => addTag('brings', bringsInput)}
                className="shrink-0 w-[70px]"
              >
                Add
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Press Enter to add. At least one required.</p>
            <div className="flex flex-wrap gap-2 min-h-[32px]">
              {brings.map((skill) => (
                <Badge key={skill} variant="secondary" className="gap-1 animate-scale-in">
                  {skill}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive transition-colors"
                    onClick={() => removeTag('brings', skill)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
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
              <Button 
                type="button" 
                onClick={() => addTag('needs', needsInput)}
                className="shrink-0 w-[70px]"
              >
                Add
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Press Enter to add. At least one required.</p>
            <div className="flex flex-wrap gap-2 min-h-[32px]">
              {needs.map((need) => (
                <Badge key={need} variant="outline" className="gap-1 animate-scale-in">
                  {need}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive transition-colors"
                    onClick={() => removeTag('needs', need)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Input
              id="timezone"
              placeholder="e.g., PST, UTC+1, IST"
              value={formData.timezone}
              onChange={(e) => setFormData({...formData, timezone: e.target.value})}
              required
            />
          </div>

          <div className="space-y-2">
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
              className="border-2"
            />
            <div className="text-xs space-y-1">
              <p className="text-muted-foreground font-medium">You must link a real project to join.</p>
              <p className="text-muted-foreground">✅ Good: yourapp.lovable.app, github.com/you/project, figma.com/proto/...</p>
              <p className="text-muted-foreground">❌ Not enough: "I have an idea", "Coming soon"</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="calendly">📅 Calendly / Meeting Link (Optional)</Label>
            <Input
              id="calendly"
              type="url"
              placeholder="https://calendly.com/your-link or cal.com/yourname"
              value={formData.calendlyLink}
              onChange={(e) => setFormData({...formData, calendlyLink: e.target.value})}
            />
            <p className="text-xs text-muted-foreground">Makes it easy for matches to book time with you</p>
          </div>

          <Button type="submit" size="lg" className="w-full hover-scale">
            Save & Start Swiping
          </Button>
        </form>
      </div>
    </main>
  );
};

export default Create;
