import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { MessageCircle, Send, Reply, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Post {
  id: string;
  content: string;
  created_at: string;
  expires_at: string;
  user_id: string;
  reply_count?: number;
  username?: string;
}

interface PostReply {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  username?: string;
}

interface CommunitySpaceProps {
  userId: string;
}

const CommunitySpace = ({ userId }: CommunitySpaceProps) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [replies, setReplies] = useState<PostReply[]>([]);
  const [newReply, setNewReply] = useState("");

  useEffect(() => {
    fetchPosts();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel("community_posts")
      .on("postgres_changes", { event: "*", schema: "public", table: "community_posts" }, () => {
        fetchPosts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("community_posts")
        .select("*")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch reply counts and usernames
      const postsWithCounts = await Promise.all(
        (data || []).map(async (post) => {
          const { count } = await supabase
            .from("post_replies")
            .select("*", { count: "exact", head: true })
            .eq("post_id", post.id);
          
          const { data: profile } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", post.user_id)
            .single();
          
          return { ...post, reply_count: count || 0, username: profile?.username || "Anonymous" };
        })
      );

      setPosts(postsWithCounts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim()) {
      toast.error("Please write something");
      return;
    }

    setLoading(true);

    try {
      // Moderate content before posting
      const { data: moderation, error: modError } = await supabase.functions.invoke("moderate-content", {
        body: { content: newPost },
      });

      if (modError) throw modError;

      if (!moderation.approved) {
        toast.error(`Your post was not approved: ${moderation.reason}`);
        setLoading(false);
        return;
      }

      const { error } = await supabase.from("community_posts").insert({
        user_id: userId,
        content: newPost,
      });

      if (error) throw error;

      toast.success("Post shared anonymously!");
      setNewPost("");
      fetchPosts();
    } catch (error: any) {
      toast.error(error.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  const fetchReplies = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from("post_replies")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      
      // Fetch usernames for replies
      const repliesWithUsernames = await Promise.all(
        (data || []).map(async (reply) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", reply.user_id)
            .single();
          
          return { ...reply, username: profile?.username || "Anonymous" };
        })
      );
      
      setReplies(repliesWithUsernames);
    } catch (error) {
      console.error("Error fetching replies:", error);
    }
  };

  const handleReply = async (postId: string) => {
    if (!newReply.trim()) return;

    setLoading(true);

    try {
      // Moderate content before posting
      const { data: moderation, error: modError } = await supabase.functions.invoke("moderate-content", {
        body: { content: newReply },
      });

      if (modError) throw modError;

      if (!moderation.approved) {
        toast.error(`Your reply was not approved: ${moderation.reason}`);
        setLoading(false);
        return;
      }

      const { error } = await supabase.from("post_replies").insert({
        post_id: postId,
        user_id: userId,
        content: newReply,
      });

      if (error) throw error;

      toast.success("Reply posted!");
      setNewReply("");
      fetchReplies(postId);
      fetchPosts();
    } catch (error: any) {
      toast.error(error.message || "Failed to post reply");
    } finally {
      setLoading(false);
    }
  };

  const toggleReplies = (postId: string) => {
    if (selectedPost === postId) {
      setSelectedPost(null);
      setReplies([]);
    } else {
      setSelectedPost(postId);
      fetchReplies(postId);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-soft border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            Share Anonymously
          </CardTitle>
          <CardDescription>
            Express your thoughts in a safe space. Posts disappear after 24 hours.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Share what's on your mind... (Your post is anonymous and will be moderated for safety)"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <Button onClick={handleCreatePost} disabled={loading} className="w-full gradient-calm gap-2">
            <Send className="w-4 h-4" />
            {loading ? "Posting..." : "Post Anonymously"}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Community Posts</h3>
        {posts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className="shadow-soft transition-smooth hover:shadow-glow">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-primary">{post.username}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-foreground whitespace-pre-wrap">{post.content}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Expires: {formatDistanceToNow(new Date(post.expires_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleReplies(post.id)}
                    className="gap-2"
                  >
                    <Reply className="w-4 h-4" />
                    {post.reply_count} {post.reply_count === 1 ? "Reply" : "Replies"}
                  </Button>
                </div>

                {selectedPost === post.id && (
                  <div className="space-y-3 pt-3 border-t">
                    {replies.map((reply) => (
                      <div key={reply.id} className="bg-muted/50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-primary">{reply.username}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm">{reply.content}</p>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Write a supportive reply..."
                        value={newReply}
                        onChange={(e) => setNewReply(e.target.value)}
                        rows={2}
                        className="resize-none flex-1"
                      />
                      <Button onClick={() => handleReply(post.id)} size="sm" className="gap-2">
                        <Send className="w-4 h-4" />
                        Reply
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default CommunitySpace;