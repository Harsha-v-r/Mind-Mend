import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useHighScore = (gameName: string) => {
  const [highScore, setHighScore] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHighScore();
  }, [gameName]);

  const fetchHighScore = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("game_scores")
        .select("highest_level")
        .eq("user_id", user.id)
        .eq("game_name", gameName)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setHighScore(data.highest_level);
      }
    } catch (error) {
      console.error("Error fetching high score:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateHighScore = async (newLevel: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (newLevel <= highScore) return;

      const { error } = await supabase
        .from("game_scores")
        .upsert({
          user_id: user.id,
          game_name: gameName,
          highest_level: newLevel,
        }, {
          onConflict: "user_id,game_name"
        });

      if (error) throw error;

      setHighScore(newLevel);
      toast.success(`🏆 New high score! Level ${newLevel}`);
    } catch (error) {
      console.error("Error updating high score:", error);
    }
  };

  return { highScore, updateHighScore, isLoading };
};
