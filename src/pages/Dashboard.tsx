import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { logActivity } from "@/lib/logger";
import { 
  Trash2, Users, Plus, UploadCloud, 
  Layers, Brain, Compass, ClipboardList, Share2, Shield,
  FileSpreadsheet, CheckCircle2
} from "lucide-react";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface Student { id: string; roll_number: number; name: string; points: number; }
interface Profile { first_name: string; last_name: string; school: string; is_admin: boolean; is_blocked: boolean; }

const Dashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [bulk, setBulk] = useState("");
  const [singleName, setSingleName] = useState("");
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [showMapping, setShowMapping] = useState(false);
  const [selectedCols, setSelectedCols] = useState<number[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: p } = await supabase.from("profiles").select("first_name,last_name,school,is_admin,is_blocked").eq("user_id", user.id).maybeSingle();
      setProfile(p);
      loadStudents();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadStudents = async () => {
    if (!user) return;
    const { data } = await supabase.from("students").select("id,roll_number,name,points").eq("teacher_id", user.id).order("roll_number");
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
    
    await logActivity(user.id, "added_student", { count: names.length });
    
    toast.success(`Added ${names.length} students`);
    setBulk("");
    loadStudents();
  };

  const addSingle = async () => {
    if (!user || !singleName.trim()) return;
    const { error } = await supabase.from("students").insert({ teacher_id: user.id, name: singleName.trim(), roll_number: students.length + 1 });
    if (error) return toast.error(error.message);
    
    await logActivity(user.id, "added_student", { name: singleName.trim() });
    
    setSingleName("");
    loadStudents();
  };

  const deleteStudent = async (id: string, name: string) => {
    if (!user) return;
    const { error } = await supabase.from("students").delete().eq("id", id);
    if (error) return toast.error(error.message);
    
    await logActivity(user.id, "deleted_student", { name });
    
    toast.success("Student removed");
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
      <section className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back,</p>
          <h1 className="font-display text-4xl md:text-5xl mt-1">
            {profile?.first_name ? `${profile.first_name} ${profile.last_name}` : "Teacher"} <span className="text-2xl">👋</span>
          </h1>
          {profile?.school && <p className="text-muted-foreground mt-2">{profile.school}</p>}
        </div>
        {profile?.is_admin && (
          <Link to="/admin">
            <Button variant="outline" className="rounded-xl border-2 border-indigo-100 text-indigo-600 hover:text-indigo-600 hover:bg-indigo-50 font-bold gap-2 h-12 px-6">
              <Shield className="h-5 w-5" /> OPEN ADMIN PORTAL
            </Button>
          </Link>
        )}
      </section>

      {/* Roster card */}
      <Card className="p-6 rounded-3xl mb-10 border-2 border-border/50 shadow-[var(--shadow-soft)]">
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
                  <div className="flex items-center justify-between mb-2">
                    <Label className="flex items-center gap-1.5"><UploadCloud className="h-4 w-4"/> Bulk upload</Label>
                    <div className="flex gap-2">
                      <input 
                        type="file" 
                        id="csvFile" 
                        accept=".csv,.txt" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const content = event.target?.result as string;
                              const lines = content.split(/\r?\n/).filter(line => line.trim());
                              if (lines.length === 0) return toast.error("Empty file");
                              
                              const rows = lines.map(line => {
                                // Better CSV parser that handles spaces and quoted values
                                const result = [];
                                let current = '';
                                let inQuotes = false;
                                for (let i = 0; i < line.length; i++) {
                                  const char = line[i];
                                  if (char === '"') {
                                    inQuotes = !inQuotes;
                                  } else if (char === ',' && !inQuotes) {
                                    result.push(current.trim());
                                    current = '';
                                  } else {
                                    current += char;
                                  }
                                }
                                result.push(current.trim());
                                return result.map(s => s.replace(/^"|"$/g, '').trim());
                              });
                              
                              setCsvHeaders(rows[0]);
                              setCsvData(rows.slice(1));
                              setShowMapping(true);
                              
                              // Clear the input
                              e.target.value = "";
                            };
                            reader.readAsText(file);
                          }
                        }}
                      />
                      <Button variant="outline" size="sm" onClick={() => document.getElementById('csvFile')?.click()} className="rounded-lg h-8 text-xs">
                        Upload CSV File
                      </Button>
                    </div>
                  </div>
                  <textarea
                    value={bulk}
                    onChange={e => setBulk(e.target.value)}
                    rows={4}
                    placeholder={"Aanya Sharma\nRohan Patel\nMeera Singh"}
                    className="w-full mt-1 rounded-xl border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <Button onClick={addBulk} className="mt-2 w-full h-11 rounded-xl font-bold bg-secondary text-secondary-foreground hover:bg-secondary/90">
                    Import from Text
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* CSV Mapping Dialog */}
          <Dialog open={showMapping} onOpenChange={setShowMapping}>
            <DialogContent className="rounded-3xl max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-indigo-500" />
                  Map CSV Columns
                </DialogTitle>
                <p className="text-sm text-muted-foreground">Select which columns from your file match the student details.</p>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-3">
                  <Label className="text-indigo-600 font-bold uppercase text-[10px] tracking-widest">Select Columns for Student Name</Label>
                  <p className="text-xs text-muted-foreground mb-2">You can select multiple (e.g. First Name + Last Name)</p>
                  <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                    {csvHeaders.map((h, i) => (
                      <div key={i} className={`flex items-center space-x-3 p-3 rounded-xl border transition-all ${selectedCols.includes(i) ? 'border-indigo-200 bg-indigo-50/50' : 'border-slate-100 hover:bg-slate-50'}`}>
                        <Checkbox 
                          id={`col-${i}`} 
                          checked={selectedCols.includes(i)} 
                          onCheckedChange={(checked) => {
                            if (checked) setSelectedCols([...selectedCols, i]);
                            else setSelectedCols(selectedCols.filter(c => c !== i));
                          }}
                        />
                        <label htmlFor={`col-${i}`} className="text-sm font-bold text-slate-700 cursor-pointer flex-1 truncate">
                          {h || `Column ${i + 1}`}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Found <span className="font-bold">{csvData.length} students</span>. We'll automatically assign roll numbers starting from <span className="font-bold">#{students.length + 1}</span>.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setShowMapping(false)}>Cancel</Button>
                <Button 
                  disabled={selectedCols.length === 0}
                  onClick={async () => {
                    if (!user || selectedCols.length === 0) return;
                    const startRoll = students.length;
                    
                    const rows = csvData.map((row, i) => ({
                      teacher_id: user.id,
                      name: selectedCols.map(idx => row[idx]).filter(Boolean).join(" ").trim() || "Unknown Student",
                      roll_number: startRoll + i + 1
                    })).filter(r => r.name !== "Unknown Student");

                    const { error } = await supabase.from("students").insert(rows);
                    if (error) return toast.error(error.message);
                    
                    await logActivity(user.id, "added_student", { count: rows.length, method: "csv_upload" });
                    toast.success(`Successfully imported ${rows.length} students`);
                    setShowMapping(false);
                    setSelectedCols([]);
                    loadStudents();
                  }}
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Import {csvData.length} Students
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        {students.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center bg-muted/40 rounded-xl">No students yet. Add your class to unlock all features.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {students.map(s => (
              <div key={s.id} className="px-3 py-2 rounded-lg bg-muted/50 text-sm flex items-center justify-between group">
                <div className="truncate">
                  <span className="text-muted-foreground text-xs mr-1.5">{s.roll_number}.</span>{s.name}
                </div>
                <button 
                  onClick={() => deleteStudent(s.id, s.name)}
                  className="opacity-0 group-hover:opacity-100 text-rose-500 hover:bg-rose-50 p-1 rounded-md transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
      
      {/* Social Board Quick Access */}
      <div className="mb-10">
        <Link to="/tools/behavior?tab=social" className="block group">
          <div className="h-full bg-gradient-to-br from-indigo-600 to-violet-500 p-8 rounded-[2.5rem] text-white relative overflow-hidden transition-all hover:scale-[1.01] active:scale-[0.99] shadow-xl shadow-indigo-100">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="max-w-md">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest mb-4">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Real-time Collaborative
                </div>
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-3 tracking-tight">Social Learning Board</h2>
                <p className="text-indigo-100 text-lg leading-relaxed">
                  Share resources, spark discussions, and gather student feedback in one live space.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex -space-x-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-12 w-12 rounded-2xl border-4 border-indigo-600 bg-indigo-400 flex items-center justify-center font-bold text-xl">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                  <div className="h-12 w-12 rounded-2xl border-4 border-indigo-600 bg-indigo-500 flex items-center justify-center font-bold text-sm">
                    +12
                  </div>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-white text-indigo-600 flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                  <Share2 className="h-7 w-7" />
                </div>
              </div>
            </div>
            
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 h-64 w-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 h-64 w-64 bg-indigo-400/20 rounded-full blur-3xl" />
          </div>
        </Link>
      </div>

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
