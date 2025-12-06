import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.74.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SwipeNotificationRequest {
  swiper_id: string;
  swiped_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { swiper_id, swiped_id }: SwipeNotificationRequest = await req.json();
    console.log('Processing swipe notification:', { swiper_id, swiped_id });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch both profiles
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, name, email')
      .in('id', [swiper_id, swiped_id]);

    if (profileError || !profiles || profiles.length !== 2) {
      console.error('Error fetching profiles:', profileError);
      throw new Error('Could not fetch founder profiles');
    }

    const swiper = profiles.find(p => p.id === swiper_id);
    const swiped = profiles.find(p => p.id === swiped_id);

    if (!swiper || !swiped || !swiped.email) {
      console.log('Missing profile data, skipping notification');
      return new Response(
        JSON.stringify({ success: true, skipped: true, reason: 'Missing profile data' }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send email to the swiped founder
    const emailResponse = await resend.emails.send({
      from: "Foundr <onboarding@resend.dev>",
      to: [swiped.email],
      subject: "👀 Someone is interested in connecting with you!",
      html: `
        <h1>You've Got an Admirer! 👀</h1>
        <p>Hey ${swiped.name || 'there'}!</p>
        <p><strong>${swiper.name || 'A founder'}</strong> just swiped right on your profile on Foundr!</p>
        <p>Head over to the app and see if you're interested in connecting. If you swipe right too, it's a match!</p>
        <p><a href="https://preview--builder-sync.lovable.app/swipe" style="background-color: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 16px;">Open Foundr</a></p>
        <p style="margin-top: 24px; color: #666;">Happy connecting!<br>The Foundr Team</p>
      `,
    });

    console.log("Swipe notification email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailResponse }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-swipe-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
