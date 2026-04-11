const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, source } = await req.json();

    if (!email || typeof email !== "string") {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(JSON.stringify({ error: "Email not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminEmails = ["kofi@sydevault.com", "chris.d.conley@gmail.com"];

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Syde Vault <no-reply@notifications.sydevault.com>",
        to: adminEmails,
        subject: "📬 New Newsletter Subscriber",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333; margin-bottom: 16px;">New Newsletter Signup</h2>
            <div style="background: #f7f7f7; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
              <p style="margin: 4px 0;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 4px 0;"><strong>Source:</strong> ${source || "unknown"}</p>
              <p style="margin: 4px 0;"><strong>Time:</strong> ${new Date().toLocaleString("en-US", { timeZone: "America/New_York" })}</p>
            </div>
            <p style="color: #666; font-size: 13px;">You can view all subscribers in the Admin Dashboard → Newsletter tab.</p>
          </div>
        `,
      }),
    });

    const result = await emailRes.json();
    console.log("Newsletter signup notification sent:", result);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error sending newsletter notification:", error);
    return new Response(JSON.stringify({ error: "Failed to send notification" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
