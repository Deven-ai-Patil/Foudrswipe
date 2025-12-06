import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useRealtimeNotifications = () => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get current user
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
      }
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) return;

    // Subscribe to new swipes where current user is swiped
    const swipesChannel = supabase
      .channel('swipes-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'swipes',
          filter: `swiped_id=eq.${userId}`
        },
        async (payload) => {
          console.log('New swipe received:', payload);
          
          // Get swiper's profile
          const { data: swiperProfile } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', payload.new.swiper_id)
            .single();

          const swiperName = swiperProfile?.name || 'Someone';
          
          toast('👀 New Interest!', {
            description: `${swiperName} just swiped right on you!`,
            action: {
              label: 'View',
              onClick: () => window.location.href = '/swipe'
            },
            duration: 5000,
          });
        }
      )
      .subscribe();

    // Subscribe to new matches where current user is involved
    const matchesChannel = supabase
      .channel('matches-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'matches'
        },
        async (payload) => {
          console.log('New match received:', payload);
          
          // Check if current user is part of this match
          const match = payload.new;
          if (match.founder1_id !== userId && match.founder2_id !== userId) {
            return; // Not our match
          }

          // Get the other founder's profile
          const otherId = match.founder1_id === userId ? match.founder2_id : match.founder1_id;
          const { data: otherProfile } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', otherId)
            .single();

          const otherName = otherProfile?.name || 'A founder';
          
          toast.success('🎉 It\'s a Match!', {
            description: `You and ${otherName} have matched! Start chatting now.`,
            action: {
              label: 'Message',
              onClick: () => window.location.href = '/messages'
            },
            duration: 8000,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(swipesChannel);
      supabase.removeChannel(matchesChannel);
    };
  }, [userId]);

  return { userId };
};
