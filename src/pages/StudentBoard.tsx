import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FileText, Heart, MessageSquare, LogOut, Send, User } from "lucide-react";

const StudentBoard = () => {
  const { code: urlCode } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState<"entry" | "board">("entry");
  const [code, setCode] = useState(urlCode || "");
  const [name, setName] = useState("");
  const [board, setBoard] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Entry check
  const enter = async () => {
    if (!code || !name.trim()) return toast.error("Please enter both code and name");
    setLoading(true);
    const { data, error } = await supabase.from("class_boards").select("*").eq("code", code.toUpperCase()).single();
    if (error || !data) {
      toast.error("Invalid code");
      setLoading(false);
      return;
    }
    setBoard(data);
    setStep("board");
    setLoading(false);
    loadPosts(data.id);
  };

  const loadPosts = async (boardId: string) => {
    const { data } = await supabase
      .from("board_posts")
      .select(`
        *,
        board_likes(count),
        board_comments(*)
      `)
      .eq("board_id", boardId)
      .order("created_at", { ascending: false });
    setPosts(data ?? []);
  };

  const like = async (postId: string) => {
    await supabase.from("board_likes").insert({ post_id: postId, display_name: name });
    loadPosts(board.id);
  };

  const comment = async (postId: string, text: string) => {
    if (!text.trim()) return;
    await supabase.from("board_comments").insert({ post_id: postId, display_name: name, comment: text });
    loadPosts(board.id);
  };

  if (step === "entry") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <Card className="w-full max-w-md p-8 rounded-3xl border-0 shadow-xl space-y-6">
          <div className="text-center">
            <div className="h-16 w-16 bg-primary rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-primary/20">
              <User className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Student Access</h1>
            <p className="text-slate-500 mt-2">Join your teacher's session</p>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-600">Access Code</Label>
              <Input 
                placeholder="XXXX" 
                value={code} 
                onChange={e => setCode(e.target.value.toUpperCase())}
                className="h-12 text-center text-xl font-bold tracking-widest uppercase rounded-xl border-slate-200 focus:border-primary focus:ring-primary/20" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-600">Your Name</Label>
              <Input 
                placeholder="e.g. Alex Smith" 
                value={name} 
                onChange={e => setName(e.target.value)}
                className="h-12 rounded-xl border-slate-200 focus:border-primary focus:ring-primary/20" 
              />
            </div>
            <Button 
              onClick={enter} 
              disabled={loading} 
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? "Joining..." : "Enter Class Board"}
            </Button>
            <div className="pt-4 border-t border-slate-100 text-center">
              <button onClick={() => navigate("/dashboard")} className="text-sm text-slate-400 hover:text-primary transition-colors font-medium">
                Are you a teacher? <span className="underline">Go to Teacher Portal</span>
              </button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">L</div>
            <h2 className="font-bold text-slate-800 tracking-tight">{board.name}</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-slate-600 hover:text-rose-600 gap-2 font-medium">
            <LogOut className="h-4 w-4" /> Exit
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-gradient-to-r from-primary to-indigo-600 rounded-3xl p-8 text-white shadow-lg shadow-primary/10">
          <h1 className="text-2xl font-bold mb-2 text-white">Hello, {name}! 👋</h1>
          <p className="text-white/80">Check out the resources your teacher shared today.</p>
        </div>

        {posts.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-2 border-slate-200 bg-white/50">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No resources shared yet.</p>
          </Card>
        ) : (
          <div className="space-y-6">
            {posts.map(p => (
              <Card key={p.id} className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow bg-white rounded-3xl">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{p.title}</h3>
                      <p className="text-slate-500 text-sm mt-1">{p.description}</p>
                    </div>
                    {p.file_url && (
                      <a href={p.file_url} target="_blank" rel="noopener" 
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors text-sm font-semibold">
                        <FileText className="h-4 w-4" /> View PDF
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-6 pt-4 border-t border-slate-100 mt-4">
                    <button 
                      onClick={() => like(p.id)}
                      className="flex items-center gap-2 text-slate-600 hover:text-rose-500 transition-colors group"
                    >
                      <div className="h-8 w-8 rounded-full bg-slate-100 group-hover:bg-rose-50 flex items-center justify-center transition-colors">
                        <Heart className="h-4 w-4" />
                      </div>
                      <span className="font-bold text-sm">{(p as any).board_likes?.[0]?.count || 0}</span>
                    </button>
                    <div className="flex items-center gap-2 text-slate-600">
                      <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                        <MessageSquare className="h-4 w-4" />
                      </div>
                      <span className="font-bold text-sm">{(p as any).board_comments?.length || 0}</span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="space-y-3">
                      {(p as any).board_comments?.map((c: any) => (
                        <div key={c.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                          <p className="font-bold text-xs text-primary mb-1">{c.display_name}</p>
                          <p className="text-sm text-slate-700 leading-relaxed">{c.comment}</p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Input 
                        id={`comment-${p.id}`}
                        placeholder="Write a comment..." 
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const val = (e.target as HTMLInputElement).value;
                            if (val.trim()) {
                              comment(p.id, val);
                              (e.target as HTMLInputElement).value = "";
                            }
                          }
                        }}
                        className="rounded-xl border-slate-200 focus:border-primary focus:ring-primary/20 h-11"
                      />
                      <Button 
                        onClick={() => {
                          const input = document.getElementById(`comment-${p.id}`) as HTMLInputElement;
                          if (input && input.value.trim()) {
                            comment(p.id, input.value);
                            input.value = "";
                          }
                        }}
                        size="icon" 
                        className="h-11 w-11 shrink-0 rounded-xl bg-primary shadow-lg shadow-primary/20"
                      >
                        <Send className="h-4 w-4 text-white" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentBoard;
