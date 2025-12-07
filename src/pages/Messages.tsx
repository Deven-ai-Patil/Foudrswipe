import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Send, Check, CheckCheck } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { useNotifications } from "@/hooks/use-notifications";
import { OnboardingTooltip } from "@/components/OnboardingTooltip";
import { useOnboarding } from "@/hooks/use-onboarding";
import { NotificationBell } from "@/components/NotificationBell";

type Match = Tables<"matches">;
type Message = Tables<"messages">;

interface MatchWithDetails extends Match {
  otherFounderName?: string;
  otherFounderAvatar?: string;
  lastMessage?: string;
  unreadCount?: number;
}

const Messages = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { showMessageNotification } = useNotifications();
  const { currentStep, currentStepIndex, totalSteps, isOnboardingActive, nextStep, skipOnboarding } = useOnboarding();
  const [matches, setMatches] = useState<MatchWithDetails[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(
    searchParams.get("matchId")
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const isAppVisible = useRef(true);
  const messageInputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUserId(session.user.id);
        fetchMatches(session.user.id);
      } else {
        navigate("/auth");
      }
    };
    
    initializeUser();

    // Track app visibility for notifications
    const handleVisibilityChange = () => {
      isAppVisible.current = !document.hidden;
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (selectedMatch) {
      fetchMessages(selectedMatch);
      markMessagesAsRead(selectedMatch);
      setupRealtimeSubscription(selectedMatch);
      setupPresenceChannel(selectedMatch);
    }
  }, [selectedMatch]);

  const fetchMatches = async (userId: string) => {
    try {
      const { data: matchesData, error } = await supabase
        .from("matches")
        .select("*")
        .or(`founder1_id.eq.${userId},founder2_id.eq.${userId}`);

      if (error) throw error;

      if (!matchesData || matchesData.length === 0) {
        setMatches([]);
        return;
      }

      // Fetch profile details for each match
      const matchesWithDetails = await Promise.all(
        matchesData.map(async (match) => {
          const otherFounderId =
            match.founder1_id === userId ? match.founder2_id : match.founder1_id;

          const { data: profile } = await supabase
            .from("profiles")
            .select("name, photo_url")
            .eq("id", otherFounderId)
            .single();

          // Get last message
          const { data: lastMsg } = await supabase
            .from("messages")
            .select("content")
            .eq("match_id", match.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          // Get unread count
          const { count: unreadCount } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("match_id", match.id)
            .eq("read", false)
            .neq("sender_id", userId);

          return {
            ...match,
            otherFounderName: profile?.name || "Unknown",
            otherFounderAvatar:
              profile?.photo_url ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherFounderId}`,
            lastMessage: lastMsg?.content || "",
            unreadCount: unreadCount || 0,
          };
        })
      );

      setMatches(matchesWithDetails);
    } catch (error) {
      console.error("Error fetching matches:", error);
      toast({
        title: "Error",
        description: "Failed to load matches",
        variant: "destructive",
      });
    }
  };

  const fetchMessages = async (matchId: string) => {
    try {
      const { data: messagesData, error } = await supabase
        .from("messages")
        .select("*")
        .eq("match_id", matchId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      setMessages(messagesData || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    }
  };

  const markMessagesAsRead = async (matchId: string) => {
    if (!currentUserId) return;

    try {
      await supabase
        .from("messages")
        .update({ read: true })
        .eq("match_id", matchId)
        .neq("sender_id", currentUserId)
        .eq("read", false);

      // Update local state
      setMessages(prev => 
        prev.map(msg => 
          msg.match_id === matchId && msg.sender_id !== currentUserId
            ? { ...msg, read: true }
            : msg
        )
      );

      // Refresh matches to update unread count
      if (currentUserId) {
        fetchMatches(currentUserId);
      }
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const setupRealtimeSubscription = (matchId: string) => {
    const channel = supabase
      .channel(`messages-${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => [...prev, newMsg]);
          
          // Show notification if message is from other user and app is not visible
          if (newMsg.sender_id !== currentUserId && !isAppVisible.current) {
            const match = matches.find(m => m.id === matchId);
            showMessageNotification(
              match?.otherFounderName || "Someone",
              newMsg.content,
              matchId
            );
          }
          
          if (newMsg.sender_id !== currentUserId) {
            markMessagesAsRead(matchId);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === payload.new.id ? (payload.new as Message) : msg
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const setupPresenceChannel = (matchId: string) => {
    const channel = supabase.channel(`typing-${matchId}`);

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const typing = new Set<string>();
        Object.values(state).forEach((presences: any) => {
          presences.forEach((presence: any) => {
            if (presence.isTyping && presence.user_id !== currentUserId) {
              typing.add(presence.user_id);
            }
          });
        });
        setTypingUsers(typing);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ user_id: currentUserId, isTyping: false });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleTyping = async (typing: boolean) => {
    if (!selectedMatch || !currentUserId) return;

    const channel = supabase.channel(`typing-${selectedMatch}`);
    await channel.track({ user_id: currentUserId, isTyping: typing });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedMatch || !currentUserId) return;

    try {
      const { error } = await supabase.from("messages").insert({
        match_id: selectedMatch,
        sender_id: currentUserId,
        content: newMessage.trim(),
      });

      if (error) throw error;

      setNewMessage("");
      setIsTyping(false);
      handleTyping(false);

      // Refresh matches to update last message
      fetchMatches(currentUserId);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (value: string) => {
    setNewMessage(value);
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      handleTyping(true);
    } else if (!value.trim() && isTyping) {
      setIsTyping(false);
      handleTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Matches List */}
      <div className="w-full md:w-80 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/swipe")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold flex-1">Messages</h1>
            <NotificationBell />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {matches.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No matches yet. Start swiping!
            </div>
          ) : (
            matches.map((match) => (
              <button
                key={match.id}
                onClick={() => setSelectedMatch(match.id)}
                className={`w-full p-4 flex items-center gap-3 hover:bg-accent transition-colors border-b border-border ${
                  selectedMatch === match.id ? "bg-accent" : ""
                }`}
              >
                <Avatar>
                  <AvatarImage src={match.otherFounderAvatar} />
                  <AvatarFallback>
                    {match.otherFounderName?.[0] || "B"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{match.otherFounderName}</h3>
                    {match.unreadCount! > 0 && (
                      <Badge variant="default" className="ml-2">
                        {match.unreadCount}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {match.lastMessage || "Start a conversation"}
                  </p>
                </div>
              </button>
            ))
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedMatch ? (
          <>
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage
                    src={
                      matches.find((m) => m.id === selectedMatch)
                        ?.otherFounderAvatar
                    }
                  />
                  <AvatarFallback>B</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold">
                    {
                      matches.find((m) => m.id === selectedMatch)
                        ?.otherFounderName
                    }
                  </h2>
                  {typingUsers.size > 0 && (
                    <p className="text-xs text-muted-foreground">typing...</p>
                  )}
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => {
                  const isOwn = message.sender_id === currentUserId;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          isOwn
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p>{message.content}</p>
                        <div className="flex items-center gap-1 mt-1 justify-end">
                          <span className="text-xs opacity-70">
                            {new Date(message.created_at).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                          {isOwn &&
                            (message.read ? (
                              <CheckCheck className="h-3 w-3" />
                            ) : (
                              <Check className="h-3 w-3" />
                            ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-border">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="flex gap-2"
              >
                <div ref={messageInputRef} className="flex-1">
                  <Input
                    value={newMessage}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder="Type a message..."
                    className="w-full"
                  />
                </div>
                <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a match to start messaging
          </div>
        )}
      </div>

      {/* Onboarding Tooltip */}
      {isOnboardingActive && currentStep?.page === "/messages" && (
        <OnboardingTooltip
          isVisible={true}
          title={currentStep.title}
          description={currentStep.description}
          position="top"
          onNext={nextStep}
          onSkip={skipOnboarding}
          currentStep={currentStepIndex}
          totalSteps={totalSteps}
          targetRef={messageInputRef}
        />
      )}
    </div>
  );
};

export default Messages;
