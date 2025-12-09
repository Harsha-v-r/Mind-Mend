import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { TrendingUp, Calendar, Sparkles, Lock, Gamepad2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { decryptText } from "@/lib/encryption";
import { formatSuggestions } from "@/lib/sanitize";
interface MoodEntry {
  id: string;
  mood_type: string;
  mood_level: number;
  journal_text: string | null;
  created_at: string;
}

interface AISuggestion {
  id: string;
  suggestion_text: string;
  created_at: string;
}

interface MoodHistoryProps {
  userId: string;
}

const MOOD_COLORS: Record<string, string> = {
  happy: "text-yellow-500",
  sad: "text-blue-500",
  stressed: "text-orange-500",
  angry: "text-red-500",
  anxious: "text-purple-500",
  peaceful: "text-green-500",
};

const MOOD_EMOJIS: Record<string, string> = {
  happy: "😊",
  sad: "😢",
  stressed: "😰",
  angry: "😠",
  anxious: "😨",
  peaceful: "😌",
};

const MoodHistory = ({ userId }: MoodHistoryProps) => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageMood, setAverageMood] = useState(0);
  const [selectedEntry, setSelectedEntry] = useState<MoodEntry | null>(null);
  const [decryptedJournalText, setDecryptedJournalText] = useState<string>("");
  const [selectedSuggestions, setSelectedSuggestions] = useState<AISuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const gameMap: Record<string, string> = {
    breathing: 'Breathing Exercise',
    memory: 'Memory Game',
    pattern: 'Pattern Recognition',
    scrambled: 'Scrambled Words',
  };
  useEffect(() => {
    fetchMoodHistory();
  }, [userId]);

  const fetchMoodHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("mood_entries")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(30);

      if (error) throw error;

      // Decrypt journal text for display in list (preview only)
      const decryptedEntries = await Promise.all(
        (data || []).map(async (entry) => {
          if (entry.journal_text) {
            const decrypted = await decryptText(entry.journal_text, userId);
            return { ...entry, journal_text: decrypted };
          }
          return entry;
        })
      );

      setEntries(decryptedEntries);
      
      if (data && data.length > 0) {
        const avg = data.reduce((sum, entry) => sum + entry.mood_level, 0) / data.length;
        setAverageMood(Math.round(avg * 10) / 10);
      }
    } catch (error) {
      console.error("Error fetching mood history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEntryClick = async (entry: MoodEntry) => {
    setSelectedEntry(entry);
    setDecryptedJournalText(entry.journal_text || "");
    setLoadingSuggestions(true);
    
    try {
      const { data, error } = await supabase
        .from("ai_suggestions")
        .select("*")
        .eq("mood_entry_id", entry.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSelectedSuggestions(data || []);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSelectedSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // formatSuggestions is now imported from @/lib/sanitize

  const renderSuggestionsWithGameLinks = (text: string) => {
    const lines = text.split('\n');
    
    return lines.map((line, index) => {
      const gameMatch = line.match(/\[GAME:(\w+)\]/);
      
      if (gameMatch) {
        const gameId = gameMatch[1];
        const gameName = gameMap[gameId];
        const cleanLine = line.replace(/\[GAME:\w+\]\s*/, '');
        
        if (gameName) {
          return (
            <div key={index} className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20 my-2">
              <div className="flex-1">
                <div className="font-semibold text-primary mb-1">{gameName}</div>
                <div className="text-sm" dangerouslySetInnerHTML={{ __html: formatSuggestions(cleanLine) }} />
              </div>
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/games#${gameId}`);
                }}
                className="gap-1 shrink-0"
              >
                <Gamepad2 className="w-4 h-4" />
                Play
              </Button>
            </div>
          );
        }
      }
      
      if (!line.trim()) return null;
      return <div key={index} dangerouslySetInnerHTML={{ __html: formatSuggestions(line) }} />;
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your mood history...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center space-y-4">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto opacity-50" />
            <div>
              <p className="text-lg font-medium">No mood entries yet</p>
              <p className="text-sm text-muted-foreground">
                Start tracking your mood to see your history and trends
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-soft border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Your Mood Trends
          </CardTitle>
          <CardDescription>
            Average mood level: <span className="text-lg font-bold text-primary">{averageMood}/5</span>
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Recent Entries</h3>
        {entries.map((entry) => (
          <Card 
            key={entry.id} 
            className="shadow-soft transition-smooth hover:shadow-glow cursor-pointer hover:border-primary/50"
            onClick={() => handleEntryClick(entry)}
          >
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="text-4xl">{MOOD_EMOJIS[entry.mood_type] || "😐"}</div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className={`font-semibold capitalize ${MOOD_COLORS[entry.mood_type] || ""}`}>
                        {entry.mood_type}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(entry.created_at), "MMM dd, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{entry.mood_level}</div>
                      <div className="text-xs text-muted-foreground">intensity</div>
                    </div>
                  </div>
                  {entry.journal_text && (
                    <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg line-clamp-2 flex items-start gap-2">
                      <Lock className="w-3 h-3 mt-0.5 shrink-0 text-primary" />
                      <span>{entry.journal_text}</span>
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-3xl">{selectedEntry && (MOOD_EMOJIS[selectedEntry.mood_type] || "😐")}</span>
              <span className="capitalize">{selectedEntry?.mood_type}</span>
            </DialogTitle>
            <DialogDescription>
              View details and suggestions from this mood entry
            </DialogDescription>
          </DialogHeader>
          
          {selectedEntry && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">
                      {format(new Date(selectedEntry.created_at), "MMMM dd, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Intensity</p>
                    <p className="text-3xl font-bold text-primary">{selectedEntry.mood_level}</p>
                  </div>
                </div>

                {decryptedJournalText && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-primary" />
                      What you shared (encrypted):
                    </h4>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm">{decryptedJournalText}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  AI Suggestions from that time
                </h4>
                
                {loadingSuggestions ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </div>
                ) : selectedSuggestions.length > 0 ? (
                  <div className="space-y-4">
                    {selectedSuggestions.map((suggestion) => (
                      <div key={suggestion.id} className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                        <div className="prose prose-sm max-w-none">
                          {renderSuggestionsWithGameLinks(suggestion.suggestion_text)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No AI suggestions were recorded for this entry.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MoodHistory;