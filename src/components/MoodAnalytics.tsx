import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { BarChart3, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface MoodAnalyticsProps {
  userId: string;
}

interface MoodEntry {
  id: string;
  mood_type: string;
  mood_level: number;
  created_at: string;
}

const MOOD_COLORS: { [key: string]: string } = {
  happy: "#10b981",
  sad: "#3b82f6",
  stressed: "#f59e0b",
  angry: "#ef4444",
  anxious: "#8b5cf6",
  peaceful: "#06b6d4",
};

const MoodAnalytics = ({ userId }: MoodAnalyticsProps) => {
  const [timeRange, setTimeRange] = useState<"7" | "15" | "30">("7");
  const [moodData, setMoodData] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMoodData();
  }, [userId, timeRange]);

  const fetchMoodData = async () => {
    setLoading(true);
    try {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange));

      const { data, error } = await supabase
        .from("mood_entries")
        .select("*")
        .eq("user_id", userId)
        .gte("created_at", daysAgo.toISOString())
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMoodData(data || []);
    } catch (error: any) {
      console.error("Error fetching mood data:", error);
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for line chart
  const lineChartData = moodData.map((entry) => ({
    date: new Date(entry.created_at).toLocaleDateString(),
    level: entry.mood_level,
    mood: entry.mood_type,
  }));

  // Prepare data for pie chart
  const moodCounts = moodData.reduce((acc, entry) => {
    acc[entry.mood_type] = (acc[entry.mood_type] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  const pieChartData = Object.entries(moodCounts).map(([mood, count]) => ({
    name: mood.charAt(0).toUpperCase() + mood.slice(1),
    value: count,
    color: MOOD_COLORS[mood] || "#64748b",
  }));

  const averageMood = moodData.length
    ? (moodData.reduce((sum, entry) => sum + entry.mood_level, 0) / moodData.length).toFixed(1)
    : "0";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Mood Analytics
          </CardTitle>
          <CardDescription>Track your emotional patterns over time</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as "7" | "15" | "30")}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="7">Last 7 Days</TabsTrigger>
              <TabsTrigger value="15">Last 15 Days</TabsTrigger>
              <TabsTrigger value="30">Last 30 Days</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Loading analytics...</p>
          </CardContent>
        </Card>
      ) : moodData.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              No mood data available for the selected time period. Start tracking your mood to see analytics!
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Average Mood Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-5xl font-bold text-primary">{averageMood}</div>
              <div className="text-sm text-muted-foreground">out of 5</div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Based on {moodData.length} mood {moodData.length === 1 ? "entry" : "entries"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Most Frequent Mood</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold capitalize">
              {pieChartData.length > 0
                ? pieChartData.reduce((prev, current) => (prev.value > current.value ? prev : current)).name
                : "N/A"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Mood Level Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="level" stroke="#8b5cf6" strokeWidth={2} name="Mood Level" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mood Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
        </>
      )}
    </div>
  );
};

export default MoodAnalytics;
