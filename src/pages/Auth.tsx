import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Sparkles, Heart } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Login with username (we'll query profiles to get the username)
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("username", username)
          .single();

        if (!profile) {
          toast.error("Username not found");
          setLoading(false);
          return;
        }

        // Use the username as email for authentication (same format as signup)
        const email = `${profile.username.toLowerCase()}@mindmend.app`;
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        toast.success("Welcome back! 💜");
        navigate("/dashboard");
      } else {
        // Signup
        if (!name.trim()) {
          toast.error("Name is required");
          setLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          toast.error("Passwords do not match");
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          toast.error("Password must be at least 6 characters");
          setLoading(false);
          return;
        }

        // Generate username from name if not provided
        let finalUsername = username.trim();
        if (!finalUsername) {
          // Generate username from name: lowercase, remove spaces, add random number
          const baseName = name.toLowerCase().replace(/\s+/g, '');
          const randomNum = Math.floor(Math.random() * 9999);
          finalUsername = `${baseName}${randomNum}`;
        }

        if (finalUsername.length < 3) {
          toast.error("Username must be at least 3 characters");
          setLoading(false);
          return;
        }

        // Check if username exists
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("username")
          .eq("username", finalUsername)
          .single();

        if (existingProfile) {
          toast.error("Username already taken, please provide a custom username");
          setLoading(false);
          return;
        }

        // Create a unique email from username
        const tempEmail = `${finalUsername.toLowerCase()}@mindmend.app`;
        
        const { data: authData, error } = await supabase.auth.signUp({
          email: tempEmail,
          password,
          options: {
            data: {
              username: finalUsername,
              name: name,
            },
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });

        if (error) throw error;
        
        toast.success("Account created! Welcome to Mind Mend 🌸");
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-serene flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-4 rounded-full">
              <Heart className="w-12 h-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Mind Mend
          </h1>
          <p className="text-muted-foreground">Your AI-powered wellbeing companion</p>
        </div>

        <Card className="shadow-soft border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {isLogin ? "Welcome Back" : "Join Mind Mend"}
            </CardTitle>
            <CardDescription>
              {isLogin ? "Continue your wellness journey" : "Start your path to better mental health"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="transition-smooth"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="username">
                  Username {!isLogin && "(optional - auto-generated from name if empty)"}
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder={isLogin ? "your_username" : "Leave empty for auto-generation"}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required={isLogin}
                  className="transition-smooth"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="transition-smooth"
                />
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="transition-smooth"
                  />
                </div>
              )}

              <Button type="submit" className="w-full gradient-calm" disabled={loading}>
                {loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-primary hover:underline"
                >
                  {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-xs text-center text-muted-foreground">
          Your privacy matters. All conversations are confidential.
        </p>
      </div>
    </div>
  );
};

export default Auth;