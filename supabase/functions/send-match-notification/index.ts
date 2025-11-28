import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.74.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MatchNotificationRequest {
  match_id: string;
  founder1_id: string;
  founder2_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { match_id, founder1_id, founder2_id }: MatchNotificationRequest = await req.json();
    console.log('Processing match notification:', { match_id, founder1_id, founder2_id });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch both founders' profiles
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, name, email')
      .in('id', [founder1_id, founder2_id]);

    if (profileError || !profiles || profiles.length !== 2) {
      console.error('Error fetching profiles:', profileError);
      throw new Error('Could not fetch founder profiles');
    }

    const founder1 = profiles.find(p => p.id === founder1_id);
    const founder2 = profiles.find(p => p.id === founder2_id);

    if (!founder1 || !founder2) {
      throw new Error('Founder profiles not found');
    }

    // Send email to founder 1
    const email1Response = await resend.emails.send({
      from: "Foundr <onboarding@resend.dev>",
      to: [founder1.email],
      subject: "🎉 You've got a new match!",
      html: `
        <h1>It's a Match! 🎉</h1>
        <p>Great news, ${founder1.name}!</p>
        <p>You and <strong>${founder2.name}</strong> have matched on Foundr!</p>
        <p>Start a conversation and see where this connection takes your projects.</p>
        <p><a href="${supabaseUrl.replace('.supabase.co', '')}/messages" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 16px;">Start Messaging</a></p>
        <p style="margin-top: 24px; color: #666;">Best regards,<br>The Foundr Team</p>
      `,
    });

    // Send email to founder 2
    const email2Response = await resend.emails.send({
      from: "Foundr <onboarding@resend.dev>",
      to: [founder2.email],
      subject: "🎉 You've got a new match!",
      html: `
        <h1>It's a Match! 🎉</h1>
        <p>Great news, ${founder2.name}!</p>
        <p>You and <strong>${founder1.name}</strong> have matched on Foundr!</p>
        <p>Start a conversation and see where this connection takes your projects.</p>
        <p><a href="${supabaseUrl.replace('.supabase.co', '')}/messages" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 16px;">Start Messaging</a></p>
        <p style="margin-top: 24px; color: #666;">Best regards,<br>The Foundr Team</p>
      `,
    });

    console.log("Match notification emails sent successfully:", { email1Response, email2Response });

    return new Response(
      JSON.stringify({ success: true, email1Response, email2Response }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-match-notification function:", error);
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
