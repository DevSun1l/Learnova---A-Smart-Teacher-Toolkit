import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Layers, Brain, Compass, ClipboardList, Users, Plus, UploadCloud } from "lucide-react";

interface Student { id: string; roll_number: number; name: string; points: number; }
interface Profile { first_name: string; last_name: string; school: string; }

const Dashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [bulk, setBulk] = useState("");
  const [singleName, setSingleName] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: p } = await supabase.from("profiles").select("first_name,last_name,school").eq("user_id", user.id).maybeSingle();
      setProfile(p);
      loadStudents();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadStudents = async () => {
    const { data } = await supabase.from("students").select("id,roll_number,name,points").order("roll_number");
    setStudents(data ?? []);
  };

  const addBulk = async () => {
    if (!user) return;
    const names = bulk.split(/\n|,/).map(n => n.trim()).filter(Boolean);
    if (names.length === 0) return toast.error("Add at least one name");
    const startRoll = students.length;
    const rows = names.map((name, i) => ({ teacher_id: user.id, name, roll_number: startRoll + i + 1 }));
    const { error } = await supabase.from("students").insert(rows);
    if (error) return toast.error(error.message);
    toast.success(`Added ${names.length} students`);
    setBulk("");
    loadStudents();
  };

  const addSingle = async () => {
    if (!user || !singleName.trim()) return;
    const { error } = await supabase.from("students").insert({ teacher_id: user.id, name: singleName.trim(), roll_number: students.length + 1 });
    if (error) return toast.error(error.message);
    setSingleName("");
    loadStudents();
  };

  const tools = [
    { to: "/tools/udl", title: "UDL Planner", desc: "Teach any topic 4 ways", icon: Layers, color: "from-orange-500 to-amber-400" },
    { to: "/tools/behavior", title: "Behavioral Theories", desc: "Behaviorism, cognitivism & more", icon: Brain, color: "from-purple-500 to-fuchsia-400" },
    { to: "/tools/developmental", title: "Developmental Advisor", desc: "Piaget · Vygotsky · Erikson", icon: Compass, color: "from-teal-500 to-cyan-400" },
    { to: "/tools/intervention", title: "Intervention Plan", desc: "AI-powered student plans", icon: ClipboardList, color: "from-pink-500 to-rose-400" },
  ];

  return (
    <AppShell>
      <section className="mb-10">
        <p className="text-sm text-muted-foreground">Welcome back,</p>
        <h1 className="font-display text-4xl md:text-5xl mt-1">
          {profile?.first_name ? `${profile.first_name} ${profile.last_name}` : "Teacher"} <span className="text-2xl">👋</span>
        </h1>
        {profile?.school && <p className="text-muted-foreground mt-2">{profile.school}</p>}
      </section>

      {/* Roster card */}
      <Card className="p-6 rounded-3xl mb-10 border-0 shadow-[var(--shadow-soft)]">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center">
              <Users className="h-5 w-5 text-secondary-foreground" />
            </div>
            <div>
              <h2 className="font-display text-xl">Your Class</h2>
              <p className="text-sm text-muted-foreground">{students.length} student{students.length === 1 ? "" : "s"}</p>
            </div>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="rounded-xl"><Plus className="h-4 w-4 mr-1" />Add students</Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader><DialogTitle>Add to your roster</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Add one student</Label>
                  <div className="flex gap-2 mt-1">
                    <Input value={singleName} onChange={e => setSingleName(e.target.value)} placeholder="Student name" />
                    <Button onClick={addSingle}>Add</Button>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <Label className="flex items-center gap-1.5"><UploadCloud className="h-4 w-4"/> Bulk upload (one name per line, or comma-separated)</Label>
                  <textarea
                    value={bulk}
                    onChange={e => setBulk(e.target.value)}
                    rows={6}
                    placeholder={"Aanya Sharma\nRohan Patel\nMeera Singh"}
                    className="w-full mt-1 rounded-xl border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <Button onClick={addBulk} className="mt-2 w-full">Import all</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {students.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center bg-muted/40 rounded-xl">No students yet. Add your class to unlock all features.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {students.map(s => (
              <div key={s.id} className="px-3 py-2 rounded-lg bg-muted/50 text-sm">
                <span className="text-muted-foreground text-xs mr-1.5">{s.roll_number}.</span>{s.name}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Tools grid */}
      <h2 className="font-display text-2xl mb-4">Choose a tool</h2>
      <div className="grid sm:grid-cols-2 gap-5">
        {tools.map(({ to, title, desc, icon: Icon, color }) => (
          <Link to={to} key={to} className="tool-card group">
            <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-100 transition-opacity`} />
            <div className="relative">
              <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className="h-7 w-7" />
              </div>
              <h3 className="font-display text-2xl mb-1 group-hover:text-white transition-colors">{title}</h3>
              <p className="text-muted-foreground group-hover:text-white/90 transition-colors">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </AppShell>
  );
};

export default Dashboard;
