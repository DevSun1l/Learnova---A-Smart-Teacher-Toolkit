import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { TOPICS, TopicKey, COGNITIVISM_CONTENT, CONSTRUCTIVISM_CONTENT } from "@/lib/topicContent";
import html2pdf from "html2pdf.js";
import { 
  FileDown, Brain, Plus, Minus, Sparkles, Lightbulb, Hammer, Users, 
  FileText, MessageSquare, Heart, ClipboardList, Share2, Upload, 
  ExternalLink, Trash2 
} from "lucide-react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogDescription, DialogFooter 
} from "@/components/ui/dialog";

import { useSearchParams } from "react-router-dom";

type SubTool = "menu" | "behaviorism" | "cognitivism" | "constructivism" | "social";

const Behavioral = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") as SubTool;
  const [tool, setTool] = useState<SubTool>(() => {
    if (initialTab) return initialTab;
    return (localStorage.getItem("last_behavioral_tool") as SubTool) || "menu";
  });

  useEffect(() => {
    localStorage.setItem("last_behavioral_tool", tool);
  }, [tool]);

  if (tool === "menu") {
    const items = [
      { id: "behaviorism" as const, title: "Behaviorism", desc: "Reinforce with point feedback", icon: Brain, color: "from-purple-500 to-fuchsia-400" },
      { id: "cognitivism" as const, title: "Cognitivism", desc: "Reduce cognitive load when teaching", icon: Lightbulb, color: "from-amber-500 to-orange-400" },
      { id: "constructivism" as const, title: "Constructivism", desc: "Build knowledge through inquiry & doing", icon: Hammer, color: "from-teal-500 to-emerald-400" },
      { id: "social" as const, title: "Social Learning", desc: "Class board for sharing & feedback", icon: Users, color: "from-pink-500 to-rose-400" },
    ];
    return (
      <AppShell showBack>
        <h1 className="font-display text-4xl mb-2">Behavioral Theories</h1>
        <p className="text-muted-foreground mb-8">Choose a learning theory to apply in your classroom.</p>
        <div className="grid sm:grid-cols-2 gap-5">
          {items.map(({ id, title, desc, icon: Icon, color }) => (
            <button key={id} onClick={() => setTool(id)} className="tool-card text-left">
              <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white mb-4`}>
                <Icon className="h-7 w-7" />
              </div>
              <h3 className="font-display text-2xl mb-1">{title}</h3>
              <p className="text-muted-foreground">{desc}</p>
            </button>
          ))}
        </div>
      </AppShell>
    );
  }

  if (tool === "behaviorism") return <Behaviorism onBack={() => setTool("menu")} />;
  if (tool === "cognitivism") return <CognConstrPicker mode="cognitivism" onBack={() => setTool("menu")} />;
  if (tool === "constructivism") return <CognConstrPicker mode="constructivism" onBack={() => setTool("menu")} />;
  if (tool === "social") return <SocialLearning onBack={() => setTool("menu")} />;
  return null;
};

// =============== BEHAVIORISM ===============
const Behaviorism = ({ onBack }: { onBack: () => void }) => {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [studentId, setStudentId] = useState("");
  const [description, setDescription] = useState("");
  const [pointsChange, setPointsChange] = useState<1 | -1>(1);
  const [submitting, setSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<{ studentName: string; total: number; feedback: string; pointsChange: number } | null>(null);

  const load = async () => {
    const { data: s } = await supabase.from("students").select("id,roll_number,name,points").order("roll_number");
    setStudents(s ?? []);
    const { data: l } = await supabase.from("behavior_logs").select("*, students(name, roll_number)").order("created_at", { ascending: false }).limit(50);
    setLogs(l ?? []);
  };
  useEffect(() => { if (user) load(); }, [user]);

  const submit = async () => {
    if (!user || !studentId || !description.trim()) return toast.error("Pick a student and write a description");
    setSubmitting(true);
    const student = students.find(s => s.id === studentId)!;
    try {
      const newPoints = student.points + pointsChange;
      await supabase.from("students").update({ points: newPoints }).eq("id", studentId);
      await supabase.from("behavior_logs").insert({ teacher_id: user.id, student_id: studentId, description, points_change: pointsChange });
      setLastResult({ studentName: student.name, total: newPoints, feedback: "", pointsChange });
      toast.success("Logged!");
      setDescription("");
      load();
    } catch (e: any) {
      toast.error(e.message ?? "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell showBack>
      <Button variant="ghost" onClick={onBack} className="mb-4">← Back</Button>
      <h1 className="font-display text-3xl mb-6">Behaviorism — Point Feedback</h1>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <Card className="p-6 rounded-3xl border-2 border-border/50 shadow-[var(--shadow-soft)] space-y-4">
            <div>
              <Label>Student</Label>
              <Select value={studentId} onValueChange={setStudentId}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select a student" /></SelectTrigger>
                <SelectContent>
                  {students.map(s => <SelectItem key={s.id} value={s.id}>#{s.roll_number} · {s.name} ({s.points} pts)</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Behavior description</Label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                placeholder="e.g. Helped a classmate solve a difficult problem during group work."
                className="w-full mt-1 rounded-xl border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <Label>Award or deduct</Label>
              <div className="flex gap-2 mt-1">
                <Button variant={pointsChange === 1 ? "default" : "outline"} onClick={() => setPointsChange(1)} className="flex-1"><Plus className="h-4 w-4 mr-1" /> Award +1</Button>
                <Button variant={pointsChange === -1 ? "default" : "outline"} onClick={() => setPointsChange(-1)} className="flex-1"><Minus className="h-4 w-4 mr-1" /> Deduct -1</Button>
              </div>
            </div>
            <Button onClick={submit} disabled={submitting} className="w-full h-11 rounded-xl bg-gradient-warm text-primary-foreground">
              {submitting ? "Generating feedback…" : <><Sparkles className="h-4 w-4 mr-2" /> Submit & generate feedback</>}
            </Button>
          </Card>

          {lastResult && (
            <Card className="p-6 rounded-3xl border-2 border-border/50 bg-gradient-to-br from-purple-50 to-fuchsia-50 animate-fade-in">
              <p className="text-sm font-semibold text-purple-700 mb-1">
                {lastResult.pointsChange > 0 ? "🎉" : "💭"} {lastResult.studentName} {lastResult.pointsChange > 0 ? "earned" : "lost"} a point
              </p>
              <p className="text-2xl font-display font-bold mb-3">Total: {lastResult.total} pts</p>
              <div className="bg-white/70 backdrop-blur rounded-2xl p-4 border border-purple-200">
                <p className="text-xs uppercase tracking-wider text-purple-600 font-semibold mb-1">Status</p>
                <p className="text-foreground/90">Successfully logged behavior for {lastResult.studentName}.</p>
              </div>
            </Card>
          )}
        </div>

        <Card className="p-5 rounded-3xl border-2 border-border/50 shadow-[var(--shadow-soft)] h-fit max-h-[80vh] overflow-y-auto">
          <h3 className="font-display text-xl mb-3">Activity Log</h3>
          {logs.length === 0 ? <p className="text-sm text-muted-foreground">No logs yet.</p> : (
            <ul className="space-y-3">
              {logs.map(l => (
                <li key={l.id} className="border-l-2 border-primary/40 pl-3 text-sm">
                  <p className="font-semibold">#{l.students?.roll_number} {l.students?.name} <span className={l.points_change > 0 ? "text-success" : "text-destructive"}>{l.points_change > 0 ? "+" : ""}{l.points_change}</span></p>
                  <p className="text-muted-foreground text-xs mt-0.5">{l.description}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </AppShell>
  );
};

// =============== COGNITIVISM / CONSTRUCTIVISM picker ===============
const CognConstrPicker = ({ mode, onBack }: { mode: "cognitivism" | "constructivism"; onBack: () => void }) => {
  const [topicKey, setTopicKey] = useState<TopicKey | null>(null);
  const isCog = mode === "cognitivism";
  const data = topicKey ? (isCog ? COGNITIVISM_CONTENT[topicKey] : CONSTRUCTIVISM_CONTENT[topicKey]) : null;

  const downloadPDF = () => {
    if (!data || !topicKey) return;
    const element = document.createElement("div");
    element.className = "p-10 font-sans text-[#1a1a1a]";

    const contentHtml = `
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <img src="/logo.ico" style="width: 48px; height: 48px;" />
          <h1 style="font-size: 32px; font-weight: 800; color: #020617; margin: 0;">Learnova</h1>
        </div>
        <div style="text-align: right;">
          <p style="font-size: 14px; color: #64748b; margin: 0;">${new Date().toLocaleDateString()}</p>
          <p style="font-size: 14px; font-weight: 600; color: #3b82f6; margin: 0;">${isCog ? "Cognitivism" : "Constructivism"}</p>
        </div>
      </div>

      <h2 style="font-size: 24px; font-weight: 700; color: #0f172a; margin-bottom: 24px;">Topic: ${TOPICS[topicKey].title}</h2>

      ${isCog ? `
        <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
          <h3 style="font-size: 18px; font-weight: 700; color: #3b82f6; margin-top: 0; margin-bottom: 12px;">Step-by-Step Teaching Plan</h3>
          <ol style="margin: 0; padding-left: 20px;">
            ${(data as any).steps.map((s: string) => `<li style="margin-bottom: 8px; font-size: 14px; line-height: 1.5;">${s}</li>`).join("")}
          </ol>
        </div>

        <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
          <h3 style="font-size: 18px; font-weight: 700; color: #f59e0b; margin-top: 0; margin-bottom: 12px;">Tips to Lessen Cognitive Load</h3>
          <ul style="margin: 0; padding-left: 20px;">
            ${(data as any).tips.map((t: string) => `<li style="margin-bottom: 8px; font-size: 14px; line-height: 1.5;">${t}</li>`).join("")}
          </ul>
        </div>

        ${(data as any).acronyms ? `
          <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;">
            <h3 style="font-size: 18px; font-weight: 700; color: #9333ea; margin-top: 0; margin-bottom: 12px;">Acronyms for Memory</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              ${(data as any).acronyms.map((a: string) => `
                <div style="background: #faf5ff; border: 1px solid #f3e8ff; border-radius: 8px; padding: 10px; font-size: 13px; font-weight: 600; color: #7e22ce;">${a}</div>
              `).join("")}
            </div>
          </div>
        ` : ""}
      ` : `
        <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
          <h3 style="font-size: 18px; font-weight: 700; color: #3b82f6; margin-top: 0; margin-bottom: 12px;">Inquiry Questions</h3>
          <ul style="margin: 0; padding-left: 20px;">
            ${(data as any).questions.map((q: string) => `<li style="margin-bottom: 8px; font-size: 14px; line-height: 1.5;">${q}</li>`).join("")}
          </ul>
        </div>

        <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
          <h3 style="font-size: 18px; font-weight: 700; color: #f59e0b; margin-top: 0; margin-bottom: 12px;">Real-life Connection</h3>
          <p style="margin: 0; font-size: 14px; line-height: 1.5;">${(data as any).realLife}</p>
        </div>

        <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
          <h3 style="font-size: 18px; font-weight: 700; color: #f43f5e; margin-top: 0; margin-bottom: 12px;">Hands-on Task</h3>
          <p style="margin: 0; font-size: 14px; line-height: 1.5;">${(data as any).task}</p>
        </div>

        <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;">
          <h3 style="font-size: 18px; font-weight: 700; color: #10b981; margin-top: 0; margin-bottom: 12px;">Scaffolding Prompts</h3>
          <ul style="margin: 0; padding-left: 20px;">
            ${(data as any).scaffolds.map((s: string) => `<li style="margin-bottom: 8px; font-size: 14px; line-height: 1.5;">${s}</li>`).join("")}
          </ul>
        </div>
      `}

      <div style="margin-top: 40px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px;">
        <p style="font-size: 12px; color: #94a3b8; margin: 0;">Generated by Learnova — Personalized Teacher Toolkit</p>
      </div>
    `;

    element.innerHTML = contentHtml;

    const opt = {
      margin: 0.5,
      filename: `Learnova_${isCog ? 'Cognitivism' : 'Constructivism'}_${topicKey}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    (html2pdf as any)().from(element).set(opt).save();
  };

  return (
    <AppShell showBack>
      <Button variant="ghost" onClick={onBack} className="mb-4">← Back</Button>
      <h1 className="font-display text-3xl mb-2">{isCog ? "Cognitivism" : "Constructivism"}</h1>
      <p className="text-muted-foreground mb-6">{isCog ? "Reduce cognitive load while teaching." : "Build understanding through inquiry & real-world tasks."}</p>

      <Card className="p-6 rounded-3xl border-2 border-border/50 shadow-[var(--shadow-soft)] mb-6">
        <Label>Pick a topic</Label>
        <div className="grid sm:grid-cols-3 gap-3 mt-2">
          {Object.values(TOPICS).map(t => (
            <button key={t.id} onClick={() => setTopicKey(t.id)}
              className={`p-4 rounded-2xl text-left transition border-2 ${topicKey === t.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
              <div className="text-2xl mb-1">{t.emoji}</div>
              <p className="font-semibold text-sm">{t.title}</p>
            </button>
          ))}
        </div>
      </Card>

      {data && topicKey && (
        <Card className="p-6 rounded-3xl border-2 border-border/50 shadow-[var(--shadow-soft)] animate-fade-in relative">
          <div className="flex justify-between items-start mb-4">
            <h2 className="font-display text-2xl">{TOPICS[topicKey].title} — {isCog ? "Teaching plan" : "Inquiry plan"}</h2>
            <Button size="sm" variant="outline" onClick={downloadPDF} className="rounded-xl flex items-center gap-2">
              <FileDown className="h-4 w-4" /> Download PDF
            </Button>
          </div>
          {isCog && "steps" in data && (
            <div className="space-y-5">
              <div>
                <h3 className="font-semibold mb-2 text-primary">Step-by-step</h3>
                <ol className="space-y-2 list-decimal pl-5">{(data as any).steps.map((s: string, i: number) => <li key={i} className="text-sm">{s}</li>)}</ol>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-accent">Tips to lessen cognitive load</h3>
                <ul className="space-y-2 list-disc pl-5">{(data as any).tips.map((t: string, i: number) => <li key={i} className="text-sm">{t}</li>)}</ul>
              </div>
              {(data as any).acronyms && (
                <div>
                  <h3 className="font-semibold mb-2 text-purple-600">Acronyms for memory</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(data as any).acronyms.map((a: string, i: number) => (
                      <div key={i} className="p-3 rounded-xl bg-purple-50 border border-purple-100 text-sm font-medium text-purple-700">
                        {a}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {!isCog && "questions" in data && (
            <div className="space-y-5">
              <Section title="Inquiry questions" items={(data as any).questions} accent="primary" />
              <div>
                <h3 className="font-semibold mb-2 text-accent">Real-life connection</h3>
                <p className="text-sm text-foreground/80">{(data as any).realLife}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-tool-intervention">Hands-on task</h3>
                <p className="text-sm text-foreground/80">{(data as any).task}</p>
              </div>
              <Section title="Scaffolding prompts" items={(data as any).scaffolds} accent="success" />
            </div>
          )}
        </Card>
      )}
    </AppShell>
  );
};

const Section = ({ title, items, accent }: { title: string; items: string[]; accent: string }) => (
  <div>
    <h3 className={`font-semibold mb-2 text-${accent}`}>{title}</h3>
    <ul className="space-y-2 list-disc pl-5">{items.map((i, idx) => <li key={idx} className="text-sm">{i}</li>)}</ul>
  </div>
);

// =============== SOCIAL LEARNING ===============
const SocialLearning = ({ onBack }: { onBack: () => void }) => {
  const { user } = useAuth();
  const [board, setBoard] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);

  const loadBoard = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("class_boards")
      .select("*")
      .eq("teacher_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) {
      setBoard(data);
      loadPosts(data.id);
    } else {
      setBoard(null);
    }
    setLoading(false);
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

  useEffect(() => { 
    loadBoard(); 
    
    // Set up real-time subscription for the current board if it exists
    let channel: any;
    if (board?.id) {
      channel = supabase
        .channel(`teacher_board_${board.id}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'board_likes' }, () => loadPosts(board.id))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'board_comments' }, () => loadPosts(board.id))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'board_posts', filter: `board_id=eq.${board.id}` }, () => loadPosts(board.id))
        .subscribe();
    }

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [user, board?.id]);

  const generateCode = () => Math.random().toString(36).substring(2, 6).toUpperCase();

  const activate = async () => {
    if (!user) return;

    if (board) {
      toast.success("Social Board is already active");
      return;
    }

    const { data: existingBoard } = await supabase
      .from("class_boards")
      .select("*")
      .eq("teacher_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingBoard) {
      setBoard(existingBoard);
      loadPosts(existingBoard.id);
      toast.success("Social Board is active");
      return;
    }

    const code = generateCode();
    const { data, error } = await supabase.from("class_boards").insert({ 
      teacher_id: user.id, 
      name: "Today's Lesson Board", 
      code 
    }).select().single();
    
    if (error) return toast.error("Activation failed");
    setBoard(data);
    toast.success("Social Board Activated!");
  };

  const resetCode = async () => {
    if (!user || !board) return;

    const { data, error } = await supabase
      .from("class_boards")
      .update({ code: generateCode() })
      .eq("id", board.id)
      .eq("teacher_id", user.id)
      .select()
      .single();

    if (error) return toast.error("Failed to reset code");
    setBoard(data);
    toast.success("Code reset");
  };

  const clearBoard = async () => {
    if (!user || !board) return;
    const { error } = await supabase.from("class_boards").delete().eq("teacher_id", user.id);
    if (error) return toast.error("Failed to clear board");
    setBoard(null);
    setPosts([]);
    toast.success("Social Board Deactivated");
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !board || !user) return;
    
    const pdfFiles = Array.from(files).filter(f => f.type === "application/pdf");
    if (pdfFiles.length === 0) return toast.error("Only PDFs allowed");

    setUploading(true);
    let successCount = 0;

    for (const file of pdfFiles) {
      try {
        const fileName = `${user.id}/${Math.random()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("board-uploads")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from("board-uploads").getPublicUrl(fileName);

        await supabase.from("board_posts").insert({
          board_id: board.id,
          teacher_id: user.id,
          title: file.name,
          file_url: publicUrl,
        });
        successCount++;
      } catch (err) {
        console.error("Upload error:", err);
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    if (successCount > 0) {
      loadPosts(board.id);
      toast.success(`Successfully uploaded ${successCount} file(s)!`);
    }
    setUploading(false);
    // Clear input
    e.target.value = "";
  };

  const deletePost = async (id: string, fileUrl: string | null) => {
    await supabase.from("board_posts").delete().eq("id", id);
    if (fileUrl) {
      const path = fileUrl.split('board-uploads/')[1];
      if (path) await supabase.storage.from("board-uploads").remove([path]);
    }
    loadPosts(board.id);
  };

  if (loading) return <AppShell showBack><div className="flex items-center justify-center p-20">Loading board...</div></AppShell>;

  const studentLink = `${window.location.origin}/join/${board?.code || ''}`;

  return (
    <AppShell showBack>
      <div className="flex justify-between items-start mb-6">
        <div>
          <Button variant="ghost" onClick={onBack} className="mb-2 p-0 h-auto hover:bg-transparent text-slate-500 italic">← Back to tools</Button>
          <h1 className="font-display text-4xl mb-1">Social Learning</h1>
          <p className="text-muted-foreground italic">Share resources and foster peer discussion.</p>
        </div>
        {board && (
          <div className="flex gap-2">
            <Button onClick={resetCode} variant="outline" className="rounded-xl gap-2 text-slate-600 border-slate-200">
              <Share2 className="h-4 w-4" /> Reset Code
            </Button>
            <Button onClick={clearBoard} variant="outline" className="rounded-xl gap-2 text-rose-600 border-rose-100 hover:bg-rose-50">
              <Trash2 className="h-4 w-4" /> Clear Board
            </Button>
          </div>
        )}
      </div>

      {board ? (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-8 rounded-3xl border-2 border-border/50 shadow-[var(--shadow-soft)] bg-gradient-to-br from-indigo-50 to-blue-50 relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="font-display text-2xl mb-4 text-indigo-900">Upload Resources</h3>
                <p className="text-sm text-indigo-700/70 mb-6 max-w-md italic">Upload lesson PDFs for students to view, like, and discuss in real-time.</p>
                <div className="relative group">
                  <input type="file" onChange={handleUpload} accept=".pdf" multiple className="hidden" id="pdf-upload" disabled={uploading} />
                  <label htmlFor="pdf-upload" className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-indigo-200 rounded-2xl bg-white/50 cursor-pointer hover:bg-white hover:border-indigo-400 transition-all ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className={`h-8 w-8 text-indigo-400 mb-2 ${uploading ? 'animate-bounce' : ''}`} />
                      <p className="text-sm font-semibold text-indigo-600">{uploading ? "Uploading resources..." : "Click to upload one or more PDFs"}</p>
                    </div>
                  </label>
                </div>
              </div>
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <FileText className="h-32 w-32 rotate-12 text-indigo-500" />
              </div>
            </Card>

            <div className="space-y-4">
              <h3 className="font-display text-xl px-2">Active Resources ({posts.length})</h3>
              {posts.length === 0 ? (
                <div className="text-center p-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                  <p className="text-slate-400 italic font-medium">No files shared yet. Start by uploading a PDF.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {posts.map(p => (
                    <Card key={p.id} className="rounded-2xl border-2 border-border/50 shadow-sm hover:shadow-md transition-all overflow-hidden bg-white">
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 line-clamp-1 italic">{p.title}</p>
                              <div className="flex items-center gap-3 mt-0.5">
                                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                                  <Heart className="h-3 w-3 fill-rose-500 text-rose-500" /> {(p as any).board_likes?.[0]?.count || 0}
                                </span>
                                <button 
                                  onClick={() => setExpandedPostId(expandedPostId === p.id ? null : p.id)}
                                  className="text-[10px] uppercase font-bold text-slate-500 hover:text-primary transition-colors flex items-center gap-1"
                                >
                                  <MessageSquare className="h-3 w-3" /> {(p as any).board_comments?.length || 0} Comments
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <a href={p.file_url} target="_blank" rel="noopener">
                              <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-slate-100">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </a>
                            <Button size="icon" variant="ghost" onClick={() => deletePost(p.id, p.file_url)} className="h-8 w-8 rounded-lg hover:bg-rose-50 hover:text-rose-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {expandedPostId === p.id && (
                          <div className="mt-4 pt-4 border-t border-slate-50 space-y-2 animate-in fade-in slide-in-from-top-1">
                            {(p as any).board_comments?.length === 0 ? (
                              <p className="text-xs text-slate-400 italic text-center py-2">No comments yet.</p>
                            ) : (
                              (p as any).board_comments.map((c: any) => (
                                <div key={c.id} className="text-xs bg-slate-50 p-2 rounded-lg border border-slate-100">
                                  <span className="font-bold text-indigo-600">{c.display_name}:</span> <span className="text-slate-600">{c.comment}</span>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <Card className="p-6 rounded-3xl border-2 border-border/50 shadow-lg bg-slate-900 text-white relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-4">Class Session Code</p>
                <div className="flex items-center justify-between gap-4">
                  <div className="text-5xl font-display font-black tracking-tighter text-white">
                    {board.code}
                  </div>
                  <Button size="icon" variant="secondary" className="h-12 w-12 rounded-xl" onClick={() => {
                    navigator.clipboard.writeText(board.code);
                    toast.success("Code copied!");
                  }}>
                    <ClipboardList className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              <div className="absolute -bottom-8 -right-8 h-32 w-32 bg-indigo-500/10 rounded-full blur-3xl" />
            </Card>

            <Card className="p-6 rounded-3xl border-2 border-border/50 shadow-[var(--shadow-soft)]">
              <h4 className="font-bold text-slate-800 mb-2 italic">Student Link</h4>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 mb-4 break-all text-xs font-mono text-slate-500 italic">
                {studentLink}
              </div>
              <Button onClick={() => {
                navigator.clipboard.writeText(studentLink);
                toast.success("Link copied!");
              }} className="w-full rounded-xl gap-2 font-semibold shadow-lg shadow-primary/20">
                <Share2 className="h-4 w-4" /> Copy Share Link
              </Button>
            </Card>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
              <div className="flex gap-3">
                <Sparkles className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 leading-relaxed italic">
                  Students join using the code and their name. After they exit, their name is not stored, keeping the session anonymous and safe.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 animate-fade-in">
          <div className="h-20 w-20 bg-white rounded-3xl flex items-center justify-center text-indigo-600 shadow-xl mb-6">
            <Users className="h-10 w-10" />
          </div>
          <h2 className="text-3xl font-display font-bold text-slate-800 mb-2 text-center">Social Learning Board</h2>
          <p className="text-slate-500 text-center max-w-sm mb-8 italic">
            Start a live session to share resources and gather real-time student feedback. 
          </p>
          <Button 
            onClick={activate} 
            className="h-14 px-10 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg shadow-xl shadow-indigo-100 transition-all hover:scale-[1.02]"
          >
            Start New Session
          </Button>
        </div>
      )}
    </AppShell>
  );
};

export default Behavioral;
