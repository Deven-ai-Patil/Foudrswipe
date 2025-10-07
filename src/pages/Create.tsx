import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Create = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    building: "",
    timezone: "",
    time: "",
    proofLink: "",
  });
  
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.proofLink.trim()) {
      toast({
        variant: "destructive",
        title: "Proof link required",
        description: "You must link a real project to join.",
      });
      return;
    }

    // Store form data in localStorage for demo
    localStorage.setItem('founderProfile', JSON.stringify({
      ...formData,
      brings,
      needs,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`,
    }));

    toast({
      title: "Profile created!",
      description: "Ready to find your co-founder.",
    });

    navigate("/swipe");
  };

  return (
    <main className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-1">Create Your Founder Card</h1>
          <p className="text-sm text-muted-foreground">Serious builders only. All fields required.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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
            <Label htmlFor="brings">I bring</Label>
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
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {brings.map((skill) => (
                <Badge key={skill} variant="secondary" className="gap-1">
                  {skill}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeTag('brings', skill)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="needs">I need</Label>
            <Input
              id="needs"
              placeholder="What's missing? (e.g., Backend, Co-founder)"
              value={needsInput}
              onChange={(e) => setNeedsInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag('needs', needsInput);
                }
              }}
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {needs.map((need) => (
                <Badge key={need} variant="outline" className="gap-1">
                  {need}
                  <X
                    className="h-3 w-3 cursor-pointer"
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

          <Button type="submit" size="lg" className="w-full">
            Save & Start Swiping
          </Button>
        </form>
      </div>
    </main>
  );
};

export default Create;
