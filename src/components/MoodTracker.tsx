import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { Smile, Frown, Meh, Heart, ThumbsUp, ThumbsDown, Gamepad2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { encryptText } from "@/lib/encryption";
import { formatSuggestions } from "@/lib/sanitize";

const MOODS = [
  { type: "happy", label: "Happy", emoji: "😊", icon: Smile },
  { type: "sad", label: "Sad", emoji: "😢", icon: Frown },
  { type: "angry", label: "Angry", emoji: "😠", icon: Frown },
  { type: "stress", label: "Stress", emoji: "😰", icon: Meh },
  { type: "peaceful", label: "Peaceful", emoji: "😌", icon: Heart },
  { type: "neutral", label: "Neutral", emoji: "😐", icon: Meh },
];

interface MoodTrackerProps {
  userId: string;
}

const MoodTracker = ({ userId }: MoodTrackerProps) => {
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [moodLevel, setMoodLevel] = useState([3]);
  const [journalText, setJournalText] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any>(null);
  const [currentSuggestionId, setCurrentSuggestionId] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!selectedMood) {
      toast.error("Please select a mood");
      return;
    }

    setLoading(true);

    try {
      // Encrypt journal text before saving
      const encryptedJournalText = journalText 
        ? await encryptText(journalText, userId) 
        : null;

      // Save mood entry with encrypted journal text
      const { data: moodEntry, error: moodError } = await supabase
        .from("mood_entries")
        .insert({
          user_id: userId,
          mood_type: selectedMood,
          mood_level: moodLevel[0],
          journal_text: encryptedJournalText,
        })
        .select()
        .single();

      if (moodError) throw moodError;

      // Call AI for suggestions
      const { data: aiResponse, error: aiError } = await supabase.functions.invoke("analyze-mood", {
        body: {
          moodType: selectedMood,
          moodLevel: moodLevel[0],
          journalText: journalText,
          userId: userId,
          moodEntryId: moodEntry.id,
        },
      });

      if (aiError) throw aiError;

      setSuggestions(aiResponse);
      setCurrentSuggestionId(aiResponse.suggestionId);
      toast.success("Mood tracked! Here are some suggestions for you.");

      // Reset form
      setSelectedMood("");
      setMoodLevel([3]);
      setJournalText("");
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to track mood");
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (isHelpful: boolean) => {
    if (!currentSuggestionId) return;

    try {
      await supabase.from("feedback").insert({
        suggestion_id: currentSuggestionId,
        user_id: userId,
        is_helpful: isHelpful,
      });

      toast.success("Thanks for your feedback!");
      setSuggestions(null);
      setCurrentSuggestionId(null);
    } catch (error: any) {
      console.error("Feedback error:", error);
    }
  };

  // formatSuggestions is now imported from @/lib/sanitize

  const renderSuggestionsWithGameLinks = (text: string) => {
    // Parse game recommendations in format [GAME:gameid] text
    const gameMap: Record<string, string> = {
      breathing: 'Breathing Exercise',
      memory: 'Memory Game',
      pattern: 'Pattern Recognition',
      scrambled: 'Scrambled Words',
    };

    const lines = text.split('\n');
    
    return lines.map((line, index) => {
      // Check for [GAME:gameid] format
      const gameMatch = line.match(/\[GAME:(\w+)\]/);
      
      if (gameMatch) {
        const gameId = gameMatch[1];
        const gameName = gameMap[gameId];
        // Remove the [GAME:gameid] tag from display
        const cleanLine = line.replace(/\[GAME:\w+\]\s*/, '');
        
        if (gameName) {
          return (
            <div key={index} className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex-1">
                <div className="font-semibold text-primary mb-1">{gameName}</div>
                <div className="text-sm" dangerouslySetInnerHTML={{ __html: formatSuggestions(cleanLine) }} />
              </div>
              <Button
                size="sm"
                onClick={() => navigate(`/games#${gameId}`)}
                className="gap-1 shrink-0"
              >
                <Gamepad2 className="w-4 h-4" />
                Play
              </Button>
            </div>
          );
        }
      }
      
      return <div key={index} dangerouslySetInnerHTML={{ __html: formatSuggestions(line) }} />;
    });
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>How are you feeling?</CardTitle>
          <CardDescription>Select your mood and describe what's on your mind</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {MOODS.map((mood) => {
              const Icon = mood.icon;
              return (
                <button
                  key={mood.type}
                  onClick={() => setSelectedMood(mood.type)}
                  className={`p-4 rounded-lg border-2 transition-smooth hover:scale-105 ${
                    selectedMood === mood.type
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-4xl">{mood.emoji}</span>
                    <span className="font-medium">{mood.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Intensity Level: {moodLevel[0]}/5 
              <span className="text-muted-foreground ml-2">
                ({moodLevel[0] === 1 ? "Slightly" : moodLevel[0] === 2 ? "Somewhat" : moodLevel[0] === 3 ? "Moderately" : moodLevel[0] === 4 ? "Very" : "Strongly"})
              </span>
            </label>
            <Slider
              value={moodLevel}
              onValueChange={setMoodLevel}
              max={5}
              min={1}
              step={1}
              className="py-4"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tell us more (optional)</label>
            <Textarea
              placeholder="What's making you feel this way? The more you share, the better suggestions we can provide..."
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <Button onClick={handleSubmit} disabled={loading} className="w-full gradient-calm">
            {loading ? "Analyzing..." : "Track Mood & Get Suggestions"}
          </Button>
        </CardContent>
      </Card>

      {suggestions && (
        <Card className="shadow-glow border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" />
              Personalized Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose prose-sm max-w-none space-y-2">
              {renderSuggestionsWithGameLinks(suggestions.suggestions)}
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-3">Was this helpful?</p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleFeedback(true)}
                  className="gap-2"
                >
                  <ThumbsUp className="w-4 h-4" />
                  Helpful
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleFeedback(false)}
                  className="gap-2"
                >
                  <ThumbsDown className="w-4 h-4" />
                  Not Helpful
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MoodTracker;