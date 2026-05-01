import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { CHALLENGE_TAGS } from "@/lib/topicContent";
import { GoogleGenerativeAI } from "@google/generative-ai";
import html2pdf from "html2pdf.js";
import { FileDown, ClipboardList, Sparkles, Target, Brain, Lightbulb, Hammer } from "lucide-react";

// Removed top-level genAI initialization to ensure env vars are loaded before use

interface Plan { goals: string[]; behaviorism: string[]; cognitive: string[]; constructivism: string[]; }

const Intervention = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [studentId, setStudentId] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<Plan | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("students").select("id,name,roll_number").order("roll_number").then(({ data }) => setStudents(data ?? []));
  }, [user]);

  const toggleTag = (t: string) => setTags(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);

  const generate = async () => {
    if (!studentId || tags.length === 0) return toast.error("Select a student and at least one challenge");
    
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      return toast.error("Gemini API Key is missing. Please check your .env file.");
    }

    const student = students.find(s => s.id === studentId)!;
    setLoading(true); 
    setPlan(null);
    
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      // Using 'gemini-flash-latest' based on the available models for this API key
      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
      const prompt = `
        As an educational expert, create a brief intervention plan for a student named ${student.name}.
        Challenges: ${tags.join(", ")}
        Description: ${desc}
        
        Provide the response in EXACTLY this JSON format (no other text):
        {
          "plan": {
            "goals": ["short goal 1", "short goal 2"],
            "behaviorism": ["strategy 1", "strategy 2"],
            "cognitive": ["strategy 1", "strategy 2"],
            "constructivism": ["strategy 1", "strategy 2"]
          }
        }
      `;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Robust JSON extraction
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error("No JSON found in response:", text);
        throw new Error("AI returned an invalid response format.");
      }
      
      const data = JSON.parse(jsonMatch[0]);
      if (!data.plan) throw new Error("Invalid plan data structure");
      
      setPlan(data.plan);
      toast.success("Plan generated!");
    } catch (e: any) {
      console.error("Gemini Error:", e);
      toast.error(e.message ?? "Failed to generate plan");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!plan || !studentId) return;
    const student = students.find(s => s.id === studentId)!;
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
          <p style="font-size: 14px; font-weight: 600; color: #f43f5e; margin: 0;">Intervention Plan</p>
        </div>
      </div>

      <div style="margin-bottom: 30px;">
        <h2 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0;">Student: ${student.name}</h2>
        <p style="font-size: 14px; color: #64748b; margin-top: 4px;">Roll Number: #${student.roll_number}</p>
        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px;">
          ${tags.map(t => `<span style="background: #f1f5f9; color: #475569; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 20px; border: 1px solid #e2e8f0;">${t}</span>`).join("")}
        </div>
      </div>

      <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <h3 style="font-size: 18px; font-weight: 700; color: #ec4899; margin-top: 0; margin-bottom: 12px;">Learning Goals</h3>
        <ul style="margin: 0; padding-left: 20px;">
          ${plan.goals.map(g => `<li style="margin-bottom: 8px; font-size: 14px; line-height: 1.5;">${g}</li>`).join("")}
        </ul>
      </div>

      <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <h3 style="font-size: 18px; font-weight: 700; color: #a855f7; margin-top: 0; margin-bottom: 12px;">Behaviorism Strategies</h3>
        <ul style="margin: 0; padding-left: 20px;">
          ${plan.behaviorism.map(s => `<li style="margin-bottom: 8px; font-size: 14px; line-height: 1.5;">${s}</li>`).join("")}
        </ul>
      </div>

      <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
        <h3 style="font-size: 18px; font-weight: 700; color: #f59e0b; margin-top: 0; margin-bottom: 12px;">Cognitive Strategies</h3>
        <ul style="margin: 0; padding-left: 20px;">
          ${plan.cognitive.map(s => `<li style="margin-bottom: 8px; font-size: 14px; line-height: 1.5;">${s}</li>`).join("")}
        </ul>
      </div>

      <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;">
        <h3 style="font-size: 18px; font-weight: 700; color: #10b981; margin-top: 0; margin-bottom: 12px;">Constructivism Strategies</h3>
        <ul style="margin: 0; padding-left: 20px;">
          ${plan.constructivism.map(s => `<li style="margin-bottom: 8px; font-size: 14px; line-height: 1.5;">${s}</li>`).join("")}
        </ul>
      </div>

      <div style="margin-top: 40px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px;">
        <p style="font-size: 12px; color: #94a3b8; margin: 0;">Generated by Learnova — Personalized Teacher Toolkit</p>
      </div>
    `;

    element.innerHTML = contentHtml;
    
    const opt = {
      margin: 0.5,
      filename: `Learnova_Intervention_${student.name}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    (html2pdf as any)().from(element).set(opt).save();
  };

  return (
    <AppShell showBack>
      <h1 className="font-display text-4xl mb-2">Intervention Plan Generator</h1>
      <p className="text-muted-foreground mb-6">AI-powered, theory-aligned plans for individual students.</p>

      <Card className="p-6 rounded-3xl border-2 border-border/50 shadow-[var(--shadow-soft)] space-y-5 mb-6">
        <div>
          <Label>Student</Label>
          <Select value={studentId} onValueChange={setStudentId}>
            <SelectTrigger className="mt-1"><SelectValue placeholder="Select a student"/></SelectTrigger>
            <SelectContent>
              {students.map(s => <SelectItem key={s.id} value={s.id}>#{s.roll_number} · {s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Quick learning challenges (pick all that apply)</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {CHALLENGE_TAGS.map(t => (
              <button key={t} onClick={() => toggleTag(t)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${tags.includes(t) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label>Description (optional)</Label>
          <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3}
            placeholder="Anything specific you've noticed about this student…"
            className="w-full mt-1 rounded-xl border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <Button onClick={generate} disabled={loading} className="w-full h-12 rounded-xl bg-gradient-warm text-primary-foreground">
          {loading ? "Generating with AI…" : <><Sparkles className="h-4 w-4 mr-2"/> Generate Intervention Plan</>}
        </Button>
      </Card>

      {plan && (
        <div className="space-y-4 animate-fade-in pb-10">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-display text-2xl">Generated Plan</h2>
            <Button size="sm" variant="outline" onClick={downloadPDF} className="rounded-xl flex items-center gap-2 bg-white">
              <FileDown className="h-4 w-4" /> Download PDF
            </Button>
          </div>
          <PlanCard icon={Target} color="from-pink-500 to-rose-400" title="Goals" items={plan.goals} />
          <PlanCard icon={Brain} color="from-purple-500 to-fuchsia-400" title="Behaviorism Strategies" items={plan.behaviorism} />
          <PlanCard icon={Lightbulb} color="from-amber-500 to-orange-400" title="Cognitive Strategies" items={plan.cognitive} />
          <PlanCard icon={Hammer} color="from-teal-500 to-emerald-400" title="Constructivism Strategies" items={plan.constructivism} />
        </div>
      )}
    </AppShell>
  );
};

const PlanCard = ({ icon: Icon, color, title, items }: any) => (
  <Card className="p-5 rounded-3xl border-0 shadow-[var(--shadow-soft)]">
    <div className="flex items-center gap-3 mb-3">
      <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${color} text-white flex items-center justify-center`}>
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-display text-xl">{title}</h3>
    </div>
    <ul className="space-y-2 list-disc pl-5">
      {items?.map((it: string, i: number) => <li key={i} className="text-sm">{it}</li>)}
    </ul>
  </Card>
);

export default Intervention;
