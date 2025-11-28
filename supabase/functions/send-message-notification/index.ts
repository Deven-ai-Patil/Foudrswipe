import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.74.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MessageNotificationRequest {
  message_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message_id, sender_id, receiver_id, content }: MessageNotificationRequest = await req.json();
    console.log('Processing message notification:', { message_id, sender_id, receiver_id });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch sender and receiver profiles
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, name, email')
      .in('id', [sender_id, receiver_id]);

    if (profileError || !profiles || profiles.length !== 2) {
      console.error('Error fetching profiles:', profileError);
      throw new Error('Could not fetch user profiles');
    }

    const sender = profiles.find(p => p.id === sender_id);
    const receiver = profiles.find(p => p.id === receiver_id);

    if (!sender || !receiver) {
      throw new Error('User profiles not found');
    }

    // Truncate message content if too long
    const truncatedContent = content.length > 100 
      ? content.substring(0, 100) + '...' 
      : content;

    // Send email to receiver
    const emailResponse = await resend.emails.send({
      from: "Foundr <onboarding@resend.dev>",
      to: [receiver.email],
      subject: `💬 New message from ${sender.name}`,
      html: `
        <h1>You've received a new message! 💬</h1>
        <p>Hi ${receiver.name},</p>
        <p><strong>${sender.name}</strong> sent you a message:</p>
        <blockquote style="background-color: #f3f4f6; padding: 16px; border-left: 4px solid #4F46E5; margin: 16px 0;">
          "${truncatedContent}"
        </blockquote>
        <p><a href="${supabaseUrl.replace('.supabase.co', '')}/messages" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 16px;">Reply Now</a></p>
        <p style="margin-top: 24px; color: #666;">Best regards,<br>The Foundr Team</p>
      `,
    });

    console.log("Message notification email sent successfully:", emailResponse);

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
    console.error("Error in send-message-notification function:", error);
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
