import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TOPICS, TopicKey } from "@/lib/topicContent";
import { Video, ImageIcon, Hand, BookOpen, Sparkles, Trophy, Rocket, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

const GRADES = Array.from({ length: 10 }, (_, i) => i + 1);
const SUBJECTS = ["Science", "Maths", "English", "Social Science"];

type Stage = "select" | "udl" | "topic-detail" | "achievements" | "challenge";

const UDLPlanner = () => {
  const [stage, setStage] = useState<Stage>("select");
  const [grade, setGrade] = useState(5);
  const [subject, setSubject] = useState("Science");
  const [topicKey, setTopicKey] = useState<TopicKey>("matter");
  const [pillar, setPillar] = useState<"engagement" | "representation" | "actions" | null>(null);
  const [detailMode, setDetailMode] = useState<"video" | "diagram" | "kinesthetic" | "reading" | null>(null);

  const topic = TOPICS[topicKey];

  // Selection screen
  if (stage === "select") {
    return (
      <AppShell showBack>
        <h1 className="font-display text-4xl mb-2">UDL Planner</h1>
        <p className="text-muted-foreground mb-8">Universal Design for Learning — teach any topic in four engaging ways.</p>

        <Card className="p-6 rounded-3xl border-2 border-border/50 shadow-[var(--shadow-soft)] space-y-6">
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">Grade</p>
            <div className="flex flex-wrap gap-2">
              {GRADES.map(g => (
                <button key={g} disabled={g !== 5}
                  onClick={() => setGrade(g)}
                  className={`h-11 w-11 rounded-xl font-semibold transition ${g === grade ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"} disabled:opacity-40 disabled:cursor-not-allowed`}>
                  {g}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Only Grade 5 active in this version.</p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">Subject</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {SUBJECTS.map(s => (
                <button key={s} disabled={s !== "Science"}
                  onClick={() => setSubject(s)}
                  className={`p-3 rounded-xl font-medium transition ${s === subject ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"} disabled:opacity-40 disabled:cursor-not-allowed`}>
                  {s}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Only Science active in this version.</p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">Topic</p>
            <div className="grid sm:grid-cols-3 gap-3">
              {Object.values(TOPICS).map(t => (
                <button key={t.id} onClick={() => setTopicKey(t.id)}
                  className={`p-4 rounded-2xl text-left transition border-2 ${topicKey === t.id ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"}`}>
                  <div className="text-3xl mb-2">{t.emoji}</div>
                  <p className="font-semibold">{t.title}</p>
                </button>
              ))}
            </div>
          </div>

          <Button onClick={() => setStage("udl")} className="w-full h-12 rounded-xl bg-gradient-warm hover:opacity-95 text-primary-foreground text-base">
            <Sparkles className="h-4 w-4 mr-2" /> Generate Lesson Plan
          </Button>
        </Card>
      </AppShell>
    );
  }

  // UDL pillars
  if (stage === "udl") {
    const pillars = [
      { id: "engagement" as const, title: "Engagement", desc: "The 'why' of learning", icon: Trophy, color: "from-pink-500 to-rose-400" },
      { id: "representation" as const, title: "Representation", desc: "The 'what' — 4 ways to teach", icon: BookOpen, color: "from-orange-500 to-amber-400" },
      { id: "actions" as const, title: "Action & Expression", desc: "The 'how' — student tasks", icon: Rocket, color: "from-teal-500 to-cyan-400" },
    ];
    return (
      <AppShell showBack>
        <Button variant="ghost" onClick={() => setStage("select")} className="mb-4">← Change topic</Button>
        <div className="mb-8 flex items-center gap-3">
          <span className="text-5xl">{topic.emoji}</span>
          <div>
            <p className="text-sm text-muted-foreground">Grade {grade} · {subject}</p>
            <h1 className="font-display text-3xl">{topic.title}</h1>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {pillars.map(({ id, title, desc, icon: Icon, color }) => (
            <button key={id} onClick={() => { setPillar(id); }} className="tool-card text-left">
              <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white mb-4`}>
                <Icon className="h-7 w-7" />
              </div>
              <h3 className="font-display text-2xl mb-1">{title}</h3>
              <p className="text-muted-foreground text-sm">{desc}</p>
            </button>
          ))}
        </div>

        {/* Pillar content */}
        {pillar === "representation" && (
          <Card className="mt-6 p-6 rounded-3xl border-2 border-border/50 shadow-[var(--shadow-soft)]">
            <h3 className="font-display text-2xl mb-4">Representation — 4 ways to teach {topic.title}</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <ModeButton icon={Video} label="Video" sub={topic.representation.video.title} onClick={() => setDetailMode("video")} color="bg-rose-500" />
              <ModeButton icon={ImageIcon} label="Diagram" sub={topic.representation.diagram.title} onClick={() => setDetailMode("diagram")} color="bg-orange-500" />
              <ModeButton icon={Hand} label="Kinesthetic" sub={topic.representation.kinesthetic.title} onClick={() => setDetailMode("kinesthetic")} color="bg-teal-500" />
              <ModeButton icon={BookOpen} label="Reading/Notes" sub={topic.representation.reading.title} onClick={() => setDetailMode("reading")} color="bg-violet-500" />
            </div>
            {detailMode && <RepresentationDetail topicKey={topicKey} mode={detailMode} onClose={() => setDetailMode(null)} />}
          </Card>
        )}

        {pillar === "actions" && (
          <Card className="mt-6 p-6 rounded-3xl border-2 border-border/50 shadow-[var(--shadow-soft)]">
            <h3 className="font-display text-2xl mb-4">Action & Expression — Student tasks</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <ActionCard icon={Video} title="Video task" body={topic.actions.video} />
              <ActionCard icon={ImageIcon} title="Diagram task" body={topic.actions.diagram} />
              <ActionCard icon={Hand} title="Kinesthetic task" body={topic.actions.kinesthetic} />
              <ActionCard icon={BookOpen} title="Reading/Writing task" body={topic.actions.reading} />
            </div>
          </Card>
        )}

        {pillar === "engagement" && (
          <Card className="mt-6 p-6 rounded-3xl border-2 border-border/50 shadow-[var(--shadow-soft)]">
            <h3 className="font-display text-2xl mb-4">Engagement</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <button onClick={() => setStage("achievements")} className="tool-card text-left">
                <Award className="h-10 w-10 text-warning mb-3" />
                <h4 className="font-display text-xl mb-1">Student Achievements</h4>
                <p className="text-sm text-muted-foreground">Award badges & track progress.</p>
              </button>
              <button onClick={() => setStage("challenge")} className="tool-card text-left">
                <Rocket className="h-10 w-10 text-tool-intervention mb-3" />
                <h4 className="font-display text-xl mb-1">Challenge Extension</h4>
                <p className="text-sm text-muted-foreground">A Grade {grade + 1} stretch challenge for advanced learners.</p>
              </button>
            </div>
          </Card>
        )}
      </AppShell>
    );
  }

  if (stage === "achievements") return <Achievements onBack={() => setStage("udl")} />;
  if (stage === "challenge") return <ChallengeView topicKey={topicKey} onBack={() => setStage("udl")} />;

  return null;
};

// ============ helpers ============

const ModeButton = ({ icon: Icon, label, sub, onClick, color }: any) => (
  <button onClick={onClick} className="rounded-2xl border border-border bg-card hover:border-primary p-4 text-left transition">
    <div className={`h-10 w-10 rounded-xl ${color} text-white flex items-center justify-center mb-2`}><Icon className="h-5 w-5" /></div>
    <p className="font-semibold">{label}</p>
    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{sub}</p>
  </button>
);

const ActionCard = ({ icon: Icon, title, body }: any) => (
  <div className="rounded-2xl bg-secondary/50 p-4">
    <div className="flex items-center gap-2 mb-2">
      <Icon className="h-5 w-5 text-accent" />
      <p className="font-semibold">{title}</p>
    </div>
    <p className="text-sm text-foreground/80">{body}</p>
  </div>
);

const RepresentationDetail = ({ topicKey, mode, onClose }: { topicKey: TopicKey; mode: "video"|"diagram"|"kinesthetic"|"reading"; onClose: () => void }) => {
  const r = TOPICS[topicKey].representation;
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl rounded-3xl">
        {mode === "video" && (
          <>
            <DialogHeader><DialogTitle>{r.video.title}</DialogTitle></DialogHeader>
            <a href={r.video.url} target="_blank" rel="noopener" className="block">
              <div className="aspect-video rounded-2xl bg-gradient-to-br from-rose-500 to-orange-400 flex items-center justify-center text-white">
                <Video className="h-16 w-16" />
              </div>
              <Button className="w-full mt-3">Open YouTube video ↗</Button>
            </a>
          </>
        )}
        {mode === "diagram" && (
          <>
            <DialogHeader><DialogTitle>{r.diagram.title}</DialogTitle></DialogHeader>
            <img src={r.diagram.url} alt={r.diagram.title} className="rounded-2xl w-full max-h-[60vh] object-contain bg-muted" />
            <a href={r.diagram.url} target="_blank" rel="noopener"><Button variant="outline" className="w-full">Open full size ↗</Button></a>
          </>
        )}
        {mode === "kinesthetic" && (
          <>
            <DialogHeader><DialogTitle>{r.kinesthetic.title}</DialogTitle></DialogHeader>
            {r.kinesthetic.imageUrl && (
              <img src={r.kinesthetic.imageUrl} alt={r.kinesthetic.title} className="rounded-2xl w-full max-h-[40vh] object-contain bg-muted mb-4" />
            )}
            <a href={r.kinesthetic.url} target="_blank" rel="noopener" className="block">
              <div className="aspect-video rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center text-white">
                <Hand className="h-16 w-16" />
              </div>
              <Button className="w-full mt-3">Open kinesthetic video ↗</Button>
            </a>
          </>
        )}
        {mode === "reading" && (
          <>
            <DialogHeader><DialogTitle>{r.reading.title}</DialogTitle></DialogHeader>
            {r.reading.imageUrl && (
              <img src={r.reading.imageUrl} alt={r.reading.title} className="rounded-2xl w-full max-h-[40vh] object-contain bg-muted mb-4" />
            )}
            <ul className="space-y-2 list-disc pl-5 mb-4">{r.reading.notes.map((n, i) => <li key={i} className="text-sm">{n}</li>)}</ul>
            <a href={r.reading.pdfUrl} target="_blank" rel="noopener"><Button className="w-full">Open notes PDF ↗</Button></a>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

const BADGE_TIERS = [
  { threshold: 5, name: "Bronze Star", emoji: "🥉" },
  { threshold: 10, name: "Silver Star", emoji: "🥈" },
  { threshold: 20, name: "Gold Star", emoji: "🥇" },
  { threshold: 35, name: "Champion", emoji: "🏆" },
];

const Achievements = ({ onBack }: { onBack: () => void }) => {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);

  const load = async () => {
    const { data } = await supabase.from("students").select("id,roll_number,name,points,badges").order("points", { ascending: false });
    setStudents(data ?? []);
  };
  useEffect(() => { if (user) load(); }, [user]);

  const award = async (s: any, tier: typeof BADGE_TIERS[number]) => {
    const newBadges = [...(s.badges ?? []), tier.name];
    const newPoints = s.points + 2;
    await supabase.from("students").update({ badges: newBadges, points: newPoints }).eq("id", s.id);
    toast.success(`${tier.emoji} ${tier.name} awarded to ${s.name}`);
    load();
  };

  return (
    <AppShell showBack>
      <Button variant="ghost" onClick={onBack} className="mb-4">← Back to Engagement</Button>
      <h1 className="font-display text-3xl mb-1">Student Achievements</h1>
      <p className="text-muted-foreground mb-6">Award badges to celebrate progress. Each badge adds 2 progress points.</p>
      {students.length === 0 ? (
        <Card className="p-8 rounded-3xl text-center text-muted-foreground">Add students to your roster first.</Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {students.map(s => {
            const maxPts = 50;
            return (
              <Card key={s.id} className="p-5 rounded-2xl border-0 shadow-[var(--shadow-soft)]">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground">#{s.roll_number}</p>
                    <p className="font-semibold text-lg">{s.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-display font-bold text-primary">{s.points}</p>
                    <p className="text-xs text-muted-foreground">points</p>
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-gradient-warm transition-all" style={{ width: `${Math.min(100, (s.points / maxPts) * 100)}%` }} />
                </div>
                {s.badges?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {Array.from(new Set(s.badges)).map((b: any) => {
                      const count = s.badges.filter((x: any) => x === b).length;
                      const emoji = BADGE_TIERS.find(t => t.name === b)?.emoji || "⭐";
                      return (
                        <span key={b} className="px-2 py-1 rounded-full bg-warning/20 text-xs font-medium">
                          {emoji} {b} {count > 1 ? `x${count}` : ""}
                        </span>
                      );
                    })}
                  </div>
                )}
                <div className="grid grid-cols-4 gap-1.5">
                   {BADGE_TIERS.map(t => (
                    <button key={t.name} onClick={() => award(s, t)}
                      className="p-2 rounded-lg text-xs font-medium transition bg-muted hover:bg-warning/20 active:scale-95">
                      <div className="text-lg">{t.emoji}</div>
                      <p className="text-[9px] mt-0.5 text-muted-foreground">Award</p>
                    </button>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </AppShell>
  );
};

const ChallengeView = ({ topicKey, onBack }: { topicKey: TopicKey; onBack: () => void }) => {
  const c = TOPICS[topicKey].challenge;
  return (
    <AppShell showBack>
      <Button variant="ghost" onClick={onBack} className="mb-4">← Back to Engagement</Button>
      <Card className="p-8 rounded-3xl border-0 shadow-[var(--shadow-soft)] bg-gradient-to-br from-pink-50 to-rose-50">
        <Rocket className="h-12 w-12 text-tool-intervention mb-4" />
        <p className="text-xs uppercase tracking-wider font-semibold text-tool-intervention mb-1">Challenge Extension</p>
        <h1 className="font-display text-3xl mb-3">{c.title}</h1>
        <p className="text-lg text-foreground/80">{c.description}</p>
      </Card>
    </AppShell>
  );
};

export default UDLPlanner;
