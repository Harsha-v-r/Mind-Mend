// import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
// };

// import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// serve(async (req) => {
//   if (req.method === "OPTIONS") {
//     return new Response(null, { headers: corsHeaders });
//   }

//   try {
//     // Verify authentication
//     const authHeader = req.headers.get("Authorization");
//     if (!authHeader) {
//       return new Response(
//         JSON.stringify({ error: "Missing authorization header" }),
//         { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//       );
//     }

//     // Create Supabase client to verify user
//     const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
//     const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
//     const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
//       global: { headers: { Authorization: authHeader } }
//     });

//     const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
//     if (authError || !user) {
//       console.error("Auth error:", authError);
//       return new Response(
//         JSON.stringify({ error: "Unauthorized" }),
//         { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//       );
//     }

//     const { content } = await req.json();

//     if (!content || typeof content !== "string") {
//       return new Response(
//         JSON.stringify({ error: "Content is required" }),
//         { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//       );
//     }

//     // Validate content length to prevent abuse
//     if (content.length > 5000) {
//       return new Response(
//         JSON.stringify({ error: "Content too long. Maximum 5000 characters allowed." }),
//         { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//       );
//     }

//     const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
//     if (!LOVABLE_API_KEY) {
//       throw new Error("LOVABLE_API_KEY is not configured");
//     }

//     // Use AI to analyze content for inappropriate language
//     const systemPrompt = `You are a content moderation AI. Analyze the following text for:
// 1. Profanity or cuss words
// 2. Hate speech or discriminatory language
// 3. Threats or violent content
// 4. Sexual or explicit content
// 5. Spam or harmful links

// Respond with ONLY "APPROVED" if the content is appropriate, or "REJECTED: [brief reason]" if it contains inappropriate content.
// Be firm but not overly strict - allow emotional expression and venting as long as it doesn't violate the above rules.`;

//     // const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
//     //   method: "POST",
//     //   headers: {
//     //     Authorization: `Bearer ${LOVABLE_API_KEY}`,
//     //     "Content-Type": "application/json",
//     //   },
//     //   body: JSON.stringify({
//     //     model: "google/gemini-2.5-flash",
//     //     messages: [
//     //       { role: "system", content: systemPrompt },
//     //       { role: "user", content: `Analyze this content: "${content}"` },
//     //     ],
//     //   }),
//     // });
//     const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
// const aiResponse = await fetch(
//   `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
//   {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//       contents: [{ parts: [{ text: "Your prompt here" }] }]
//     })
//   }
// );


//     if (!aiResponse.ok) {
//       if (aiResponse.status === 429) {
//         return new Response(
//           JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
//           { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//         );
//       }
//       if (aiResponse.status === 402) {
//         return new Response(
//           JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
//           { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//         );
//       }
//       throw new Error("Failed to moderate content");
//     }

//     const aiData = await aiResponse.json();
//     const moderationResult = aiData.choices[0].message.content.trim();

//     console.log("Moderation result:", moderationResult);

//     if (moderationResult.startsWith("APPROVED")) {
//       return new Response(
//         JSON.stringify({ 
//           approved: true,
//           message: "Content approved"
//         }),
//         { headers: { ...corsHeaders, "Content-Type": "application/json" } }
//       );
//     } else {
//       const reason = moderationResult.replace("REJECTED:", "").trim();
//       return new Response(
//         JSON.stringify({ 
//           approved: false,
//           reason: reason || "Content contains inappropriate language or violates community guidelines"
//         }),
//         { headers: { ...corsHeaders, "Content-Type": "application/json" } }
//       );
//     }
//   } catch (error) {
//     console.error("Error in moderate-content:", error);
//     return new Response(
//       JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
//       {
//         status: 500,
//         headers: { ...corsHeaders, "Content-Type": "application/json" },
//       }
//     );
//   }
// });
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { content } = await req.json();

    if (!content || typeof content !== "string") {
      return new Response(
        JSON.stringify({ error: "Content is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (content.length > 5000) {
      return new Response(
        JSON.stringify({ error: "Content too long." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are a content moderation AI. Analyze the following text for:
1. Profanity or cuss words
2. Hate speech
3. Threats
4. Sexual content
5. Spam

Respond with ONLY "APPROVED" if appropriate, or "REJECTED: [brief reason]" if inappropriate.`;

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not set");

    const model = "gemini-2.5-flash-lite";
    const aiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
             parts: [{ text: systemPrompt }]
          },
          contents: [{ 
            parts: [{ text: `Analyze this content: "${content}"` }] 
          }]
        })
      }
    );

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      throw new Error("Failed to moderate content");
    }

    // Fixed Response Parsing
    const aiData = await aiResponse.json();
    const moderationResult = aiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!moderationResult) {
       throw new Error("Empty response from AI");
    }

    console.log("Moderation result:", moderationResult);

    if (moderationResult.startsWith("APPROVED")) {
      return new Response(
        JSON.stringify({ 
          approved: true,
          message: "Content approved"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      const reason = moderationResult.replace("REJECTED:", "").trim();
      return new Response(
        JSON.stringify({ 
          approved: false,
          reason: reason || "Content contains inappropriate language"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error in moderate-content:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});