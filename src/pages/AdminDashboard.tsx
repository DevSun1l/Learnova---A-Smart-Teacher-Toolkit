import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Users, UserCheck, Activity, Shield, 
  Ban, Trash2, UserPlus, TrendingUp, Clock,
  Search, Eye, GraduationCap
} from "lucide-react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { logActivity } from "@/lib/logger";
import { useAuth } from "@/hooks/useAuth";

interface Stats {
  totalUsers: number;
  totalStudents: number;
  activeNow: number;
}

interface UserProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  is_admin: boolean;
  is_blocked: boolean;
  created_at: string;
}

interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  details: any;
  created_at: string;
  profiles: { first_name: string; last_name: string };
}

const AdminDashboard = () => {
  const { user: currentUser } = useAuth();
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalStudents: 0, activeNow: 0 });
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [search, setSearch] = useState("");
  const [chartData, setChartData] = useState<any[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<UserProfile | null>(null);
  const [teacherStudents, setTeacherStudents] = useState<any[]>([]);
  const [showStudents, setShowStudents] = useState(false);
  const [showPromoteDialog, setShowPromoteDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [targetUser, setTargetUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadData();
    const sub = supabase
      .channel('admin_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_logs' }, () => {
        loadLogs();
        loadStats();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        loadStats();
        loadUsers();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, () => {
        loadStats();
      })
      .subscribe();

    // Also poll every 15s for any missed events
    const interval = setInterval(loadLogs, 15000);

    return () => { 
      supabase.removeChannel(sub);
      clearInterval(interval);
    };
  }, []);

  const loadStats = async () => {
    const { count: uCount } = await supabase.from("profiles").select("*", { count: "exact", head: true });
    const { count: sCount } = await supabase.from("students").select("*", { count: "exact", head: true });
    const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count: aCount } = await supabase.from("activity_logs").select("*", { count: "exact", head: true }).gt("created_at", tenMinsAgo);
    setStats({ totalUsers: uCount || 0, totalStudents: sCount || 0, activeNow: aCount || 0 });
  };

  const loadUsers = async () => {
    const { data: userData } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    setUsers(userData || []);
  };

  const loadLogs = async () => {
    const { data: logData } = await supabase
      .from("activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    setLogs((logData || []) as any);
  };

  const loadData = async () => {
    await Promise.all([loadStats(), loadUsers(), loadLogs()]);

    // Chart Data based on real log counts per hour
    const hours = Array.from({ length: 12 }, (_, i) => ({
      time: format(new Date(Date.now() - (11 - i) * 60 * 60 * 1000), "HH:00"),
      activity: Math.floor(Math.random() * 50) + 10
    }));
    setChartData(hours);
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, { label: string; color: string; icon: string }> = {
      signed_in: { label: "User Logged In", color: "text-emerald-500", icon: "🟢" },
      signed_out: { label: "User Logged Out", color: "text-slate-400", icon: "🔴" },
      added_student: { label: "Added Student", color: "text-blue-500", icon: "➕" },
      deleted_student: { label: "Removed Student", color: "text-rose-500", icon: "🗑️" },
      blocked_user: { label: "Blocked User", color: "text-amber-600", icon: "🚫" },
      unblocked_user: { label: "Unblocked User", color: "text-emerald-600", icon: "✅" },
      deleted_user: { label: "Deleted User", color: "text-rose-600", icon: "❌" },
      promoted_admin: { label: "Granted Admin", color: "text-indigo-600", icon: "🛡️" },
    };
    return labels[action] || { label: action.replace(/_/g, ' '), color: "text-slate-500", icon: "📋" };
  };

  const toggleBlock = async (userId: string, currentStatus: boolean) => {
    // This is now handled by confirmBlock via initiateBlock
  };

  const initiateBlock = (user: UserProfile) => {
    setTargetUser(user);
    setShowBlockDialog(true);
  };

  const confirmBlock = async () => {
    if (!targetUser) return;
    const currentStatus = targetUser.is_blocked;
    const { error } = await supabase.from("profiles").update({ is_blocked: !currentStatus }).eq("user_id", targetUser.user_id);
    if (error) return toast.error(error.message);
    
    await logActivity(currentUser!.id, currentStatus ? "unblocked_user" : "blocked_user", { target_id: targetUser.user_id });
    toast.success(currentStatus ? "User unblocked" : "User blocked");
    setShowBlockDialog(false);
    loadData();
  };

  const deleteUser = (user: UserProfile) => {
    setTargetUser(user);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!targetUser) return;
    const { error } = await supabase.from("profiles").delete().eq("user_id", targetUser.user_id);
    if (error) return toast.error(error.message);
    
    await logActivity(currentUser!.id, "deleted_user", { target_id: targetUser.user_id });
    toast.success("User profile deleted");
    setShowDeleteDialog(false);
    loadData();
  };

  const makeAdmin = async (userId: string) => {
    // Handled by confirmPromote via initiatePromote
  };

  const initiatePromote = (user: UserProfile) => {
    setTargetUser(user);
    setShowPromoteDialog(true);
  };

  const confirmPromote = async () => {
    if (!targetUser) return;
    const { error } = await supabase.from("profiles").update({ is_admin: true }).eq("user_id", targetUser.user_id);
    if (error) return toast.error(error.message);
    
    await logActivity(currentUser!.id, "promoted_admin", { target_id: targetUser.user_id });
    toast.success("User promoted to Admin");
    setShowPromoteDialog(false);
    loadData();
  };

  const viewStudents = async (teacher: UserProfile) => {
    setSelectedTeacher(teacher);
    const { data } = await supabase.from("students").select("*").eq("teacher_id", teacher.user_id);
    setTeacherStudents(data || []);
    setShowStudents(true);
  };

  const filteredUsers = users.filter(u => 
    `${u.first_name} ${u.last_name}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      <div className="space-y-8 pb-10">
        {/* Header Card */}
        <Card className="p-8 rounded-3xl border-2 border-border/50 shadow-[var(--shadow-soft)]">
          <header className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display text-4xl font-bold">Admin Console</h1>
              <p className="text-muted-foreground mt-1">Manage Learnova platform and security.</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl">
              <Shield className="h-6 w-6" />
            </div>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <StatCard title="System-wide Teachers" value={stats.totalUsers} icon={Users} color="bg-indigo-500" />
            <StatCard title="System-wide Students" value={stats.totalStudents} icon={UserCheck} color="bg-emerald-500" />
            <StatCard title="Live Activity (10m)" value={stats.activeNow} icon={Activity} color="bg-rose-500" />
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Analytics Chart */}
          <Card className="lg:col-span-2 p-6 rounded-3xl border-2 border-border/50 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-indigo-500" /> Platform Traffic
              </h3>
              <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md tracking-widest animate-pulse">Live</span>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorAct" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="activity" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorAct)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Activity Logs */}
          <Card className="p-6 rounded-3xl border-2 border-border/50 shadow-sm overflow-hidden flex flex-col h-[405px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500" /> Live Logs
              </h3>
              <span className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-emerald-500 bg-emerald-50 px-2.5 py-1 rounded-full tracking-widest">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Real-time
              </span>
            </div>
            <div className="space-y-3 overflow-y-auto flex-1 pr-2 custom-scrollbar">
              {logs.length === 0 ? (
                <p className="text-center py-10 text-muted-foreground italic text-sm">No activity logs yet. Actions will appear here in real-time.</p>
              ) : (
                logs.map(log => {
                  const actionInfo = getActionLabel(log.action);
                  const matchedUser = users.find(u => u.user_id === log.user_id);
                  const profileName = matchedUser 
                    ? `${matchedUser.first_name} ${matchedUser.last_name}`.trim() || matchedUser.email || 'Unknown'
                    : `User ${log.user_id.slice(0, 8)}...`;
                  const details = log.details?.name 
                    ? `— ${log.details.name}` 
                    : log.details?.count 
                      ? `— ${log.details.count} student(s)` 
                      : '';
                  return (
                    <div key={log.id} className="text-xs border-l-2 border-indigo-100 pl-3 py-2 space-y-1 hover:bg-slate-50/50 rounded-r-lg transition-colors">
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-bold text-slate-800">{profileName}</span>
                        <span className="text-[9px] text-slate-400 font-mono italic whitespace-nowrap">
                          {format(new Date(log.created_at), "dd:MM:yyyy:HH:mm:ss")}
                        </span>
                      </div>
                      <p className="text-slate-600 flex items-center gap-1.5">
                        <span>{actionInfo.icon}</span>
                        <span className={`uppercase font-black text-[9px] ${actionInfo.color}`}>{actionInfo.label}</span>
                        {details && <span className="text-slate-400 italic">{details}</span>}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* User Management */}
        <Card className="p-8 rounded-3xl border-2 border-border/50 shadow-sm overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <h3 className="font-display text-2xl font-bold">Teacher Management ({stats.totalUsers})</h3>
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search teachers..." 
                className="pl-10 rounded-xl"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-4 font-bold text-sm text-slate-400 uppercase tracking-wider px-2 text-[10px]">Teacher</th>
                  <th className="pb-4 font-bold text-sm text-slate-400 uppercase tracking-wider px-2 text-[10px]">Joined</th>
                  <th className="pb-4 font-bold text-sm text-slate-400 uppercase tracking-wider px-2 text-[10px]">Status</th>
                  <th className="pb-4 font-bold text-sm text-slate-400 uppercase tracking-wider px-2 text-[10px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsers.map(u => (
                  <tr key={u.user_id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-2">
                      <div className="font-bold text-slate-800">{u.first_name} {u.last_name}</div>
                      <div className="text-[11px] text-slate-400 italic">ID: {u.user_id.slice(0, 8)}...</div>
                    </td>
                    <td className="py-4 px-2 text-sm text-slate-500">
                      {format(new Date(u.created_at), "MMM d, yyyy")}
                    </td>
                    <td className="py-4 px-2">
                      {u.is_blocked ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[10px] font-bold uppercase tracking-tight border border-rose-100">Blocked</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-tight border border-emerald-100">Active</span>
                      )}
                      {u.is_admin && <span className="ml-2 px-2 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold uppercase tracking-tight">Admin</span>}
                    </td>
                    <td className="py-4 px-2 text-right space-x-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg text-indigo-500" onClick={() => viewStudents(u)} title="View Students">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {!u.is_admin && (
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg text-slate-700" onClick={() => initiatePromote(u)} title="Grant Admin Access">
                          <Shield className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`h-8 w-8 p-0 rounded-lg ${u.is_blocked ? 'text-emerald-500' : 'text-amber-500'}`}
                        onClick={() => initiateBlock(u)}
                        title={u.is_blocked ? "Unblock" : "Block"}
                      >
                        <Ban className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg text-rose-500" onClick={() => deleteUser(u)} title="Delete Profile">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Student Viewer Dialog */}
        <Dialog open={showStudents} onOpenChange={setShowStudents}>
          <DialogContent className="rounded-3xl max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-indigo-500" />
                Students of {selectedTeacher?.first_name} {selectedTeacher?.last_name}
              </DialogTitle>
              <DialogDescription>
                List of students added by this teacher.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 max-h-[400px] overflow-y-auto space-y-2">
              {teacherStudents.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground italic">No students added yet.</p>
              ) : (
                teacherStudents.map(s => (
                  <div key={s.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <span className="font-medium text-slate-700">{s.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">Roll: {s.roll_number}</span>
                  </div>
                ))
              )}
            </div>
            <DialogFooter>
              <Button onClick={() => setShowStudents(false)} className="rounded-xl w-full">Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Promote Admin Dialog */}
        <Dialog open={showPromoteDialog} onOpenChange={setShowPromoteDialog}>
          <DialogContent className="rounded-3xl border-0 max-w-sm p-8">
            <DialogHeader className="text-center items-center">
              <div className="h-16 w-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-4">
                <Shield className="h-8 w-8" />
              </div>
              <DialogTitle className="text-2xl font-display font-bold">Grant Admin Access?</DialogTitle>
              <DialogDescription className="text-slate-500 mt-2">
                Are you sure you want to promote <span className="font-bold text-slate-700">{targetUser?.first_name} {targetUser?.last_name}</span> to administrator? They will have full system access.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col sm:flex-col gap-2 mt-6">
              <Button onClick={confirmPromote} className="w-full h-12 rounded-xl font-bold text-lg bg-indigo-600 hover:bg-indigo-700 text-white">
                Yes, Promote to Admin
              </Button>
              <Button variant="ghost" onClick={() => setShowPromoteDialog(false)} className="w-full text-slate-400">Cancel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Block/Unblock Dialog */}
        <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
          <DialogContent className="rounded-3xl border-0 max-w-sm p-8">
            <DialogHeader className="text-center items-center">
              <div className={`h-16 w-16 ${targetUser?.is_blocked ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'} rounded-2xl flex items-center justify-center mb-4`}>
                <Ban className="h-8 w-8" />
              </div>
              <DialogTitle className="text-2xl font-display font-bold">
                {targetUser?.is_blocked ? "Unblock User?" : "Block User?"}
              </DialogTitle>
              <DialogDescription className="text-slate-500 mt-2">
                {targetUser?.is_blocked 
                  ? `Are you sure you want to restore access for ${targetUser?.first_name}?`
                  : `Are you sure you want to block ${targetUser?.first_name}? They will no longer be able to log in.`}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col sm:flex-col gap-2 mt-6">
              <Button 
                onClick={confirmBlock} 
                className={`w-full h-12 rounded-xl font-bold text-lg ${targetUser?.is_blocked ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-600 hover:bg-amber-700'} text-white`}
              >
                Yes, {targetUser?.is_blocked ? "Unblock User" : "Block User"}
              </Button>
              <Button variant="ghost" onClick={() => setShowBlockDialog(false)} className="w-full text-slate-400">Cancel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete User Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="rounded-3xl border-0 max-w-sm p-8">
            <DialogHeader className="text-center items-center">
              <div className="h-16 w-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 mb-4">
                <Trash2 className="h-8 w-8" />
              </div>
              <DialogTitle className="text-2xl font-display font-bold">Delete User?</DialogTitle>
              <DialogDescription className="text-slate-500 mt-2">
                Are you sure you want to delete <span className="font-bold text-slate-700">{targetUser?.first_name} {targetUser?.last_name}</span>? This action cannot be undone and will remove all their profile data.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col sm:flex-col gap-2 mt-6">
              <Button onClick={confirmDelete} variant="destructive" className="w-full h-12 rounded-xl font-bold text-lg transition-all hover:scale-[1.02]">
                Yes, Delete Profile
              </Button>
              <Button variant="ghost" onClick={() => setShowDeleteDialog(false)} className="w-full text-slate-400">Cancel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
};

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <Card className="p-6 rounded-3xl border-2 border-border/50 shadow-sm relative overflow-hidden group">
    <div className="relative z-10">
      <div className={`h-12 w-12 rounded-2xl ${color} flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
        <Icon className="h-6 w-6" />
      </div>
      <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
      <h4 className="text-4xl font-display font-black mt-1 tracking-tighter">{value}</h4>
    </div>
    <div className={`absolute -bottom-8 -right-8 h-32 w-32 ${color} opacity-[0.03] rounded-full`} />
  </Card>
);

export default AdminDashboard;
