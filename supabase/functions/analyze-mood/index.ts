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
    // 1. Verify Authentication
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

    const { moodType, moodLevel, journalText, userId, moodEntryId } = await req.json();

    if (userId !== user.id) {
      return new Response(
        JSON.stringify({ error: "User ID mismatch" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Prepare Prompts
    const systemPrompt = `You are a compassionate AI mental health companion. Adapt your response length based on what the person actually needs.

RESPONSE LENGTH RULES:
- HAPPY/PEACEFUL moods: Keep it SHORT (2-4 sentences). Celebrate with them briefly, maybe suggest a fun activity or gratitude practice. Don't overdo it.
- NEUTRAL moods: Brief and encouraging (3-5 sentences). Light suggestions.
- SAD/STRESSED/ANGRY/ANXIOUS moods: Provide MORE support (1-2 short paragraphs). Include validation, specific coping tips, and practical techniques.
- If they shared detailed text about struggles: Match with thoughtful, detailed response.
- If they shared something brief or nothing: Keep your response proportional.

FOLLOW-UP QUESTIONS (important!):
When someone shares a difficult feeling (sad, stressed, angry, anxious) but their entry is VAGUE or BRIEF:
- End with ONE gentle, open-ended follow-up question to understand them better
- Frame it warmly, not interrogatively
- Examples:
  - "Would you like to share what's been weighing on you?"
  - "Is there something specific that triggered this feeling?"
  - "What's been on your mind lately?"
  - "Would it help to talk through what happened?"
- DON'T ask follow-ups for happy/peaceful moods or when they've already shared details

CONTENT GUIDELINES:
- Always acknowledge their feeling first
- For positive moods: Quick celebration, maybe one small suggestion
- For difficult moods: Validation + specific actionable tips + gentle encouragement
- Include breathing/grounding techniques only when genuinely helpful
- Be conversational, not clinical

THERAPEUTIC GAMES (suggest only when appropriate):
- [GAME:breathing] Breathing Exercise - for calming stress, anxiety, anger
- [GAME:memory] Memory Game - for redirecting racing thoughts  
- [GAME:pattern] Pattern Recognition - for grounding and focus
- [GAME:scrambled] Scrambled Words - for positive distraction

Format: "[GAME:id] Brief reason" - suggest 0-2 games based on need.

IMPORTANT: Match the energy and need. Don't pad responses unnecessarily.`;

    // Logic to build userPrompt
    const positiveMoods = ['happy', 'peaceful', 'neutral', 'calm', 'content', 'excited', 'grateful'];
    const difficultMoods = ['sad', 'stress', 'angry', 'anxious', 'frustrated', 'overwhelmed', 'lonely', 'scared', 'worried'];
    const isPositiveMood = positiveMoods.some(m => moodType.toLowerCase().includes(m));
    const isDifficultMood = difficultMoods.some(m => moodType.toLowerCase().includes(m));
    const hasDetailedText = journalText && journalText.trim().length > 50;
    const hasVagueText = journalText && journalText.trim().length > 0 && journalText.trim().length <= 50;
    const hasNoText = !journalText || journalText.trim().length === 0;
    
    let userPrompt = `The person is feeling ${moodType} (intensity: ${moodLevel}/5).`;
    if (journalText && journalText.trim()) {
      userPrompt += `\n\nThey shared: "${journalText}"`;
    }
    
    // Add context based on your logic
    if (isPositiveMood) {
      userPrompt += `\n\nThis is a positive mood. Keep response SHORT and celebratory (2-4 sentences). No follow-up questions needed.`;
    } else if (isDifficultMood && (hasVagueText || hasNoText)) {
      userPrompt += `\n\nThey're experiencing a difficult emotion but haven't shared much detail. Provide warm support, then END with a gentle follow-up question.`;
    } else if (isDifficultMood && hasDetailedText) {
      userPrompt += `\n\nThey've shared details about their struggle. Respond with care and specific, actionable support. No follow-up question needed.`;
    } else if (isDifficultMood && moodLevel >= 4) {
      userPrompt += `\n\nThis is an intense difficult feeling. Provide thoughtful support with specific coping strategies.`;
    } else {
      userPrompt += `\n\nOffer proportional support based on what they've shared.`;
    }

    // 3. Call Google Gemini API (Fixed)
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not set");
    const model = "gemini-2.5-flash-lite";
    const aiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Gemini separates System instructions from User content in v1beta
          system_instruction: {
            parts: [{ text: systemPrompt }]
          },
          contents: [{ 
            role: "user",
            parts: [{ text: userPrompt }] 
          }]
        })
      }
    );

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      throw new Error(`Failed to get AI suggestions: ${aiResponse.status}`);
    }

    // 4. Parse Response (Fixed for Gemini Format)
    const aiData = await aiResponse.json();
    
    // Google returns: candidates[0].content.parts[0].text
    const suggestions = aiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!suggestions) {
      throw new Error("Invalid response format from AI");
    }

    // 5. Save to Database
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: suggestionData, error: dbError } = await supabase
      .from("ai_suggestions")
      .insert({
        mood_entry_id: moodEntryId,
        user_id: userId,
        suggestion_text: suggestions,
        suggestion_type: "general",
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return new Response(
      JSON.stringify({
        suggestions: suggestions,
        suggestionId: suggestionData.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in analyze-mood:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});