import { ReactNode, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, GraduationCap, ArrowLeft, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogDescription, DialogFooter 
} from "@/components/ui/dialog";

import { logActivity } from "@/lib/logger";

export const AppShell = ({ children, showBack = false }: { children: ReactNode; showBack?: boolean }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [isAdmin, setIsAdmin] = useState(false);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (user) {
        console.log("[AppShell] Checking admin for user:", user.id, user.email);
        const { data, error } = await supabase
          .from("profiles")
          .select("is_admin, is_blocked, email")
          .eq("user_id", user.id)
          .maybeSingle();
        console.log("[AppShell] Profile result:", { data, error });
        if (error) {
          console.error("[AppShell] Admin check error:", error);
          setIsAdmin(false);
        } else {
          console.log("[AppShell] is_admin =", data?.is_admin);
          setIsAdmin(data?.is_admin === true);
        }
      }
    };
    checkAdmin();
  }, [user]);

  const signOut = async () => {
    if (user) await logActivity(user.id, "signed_out");
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="border-b border-border/60 bg-card/70 backdrop-blur sticky top-0 z-40">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            {showBack && (
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="rounded-xl">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
            )}
            <Link to="/dashboard" className="flex items-center gap-2.5">
              <img src="/logo.ico" alt="Learnova Logo" className="h-10 w-10 rounded-xl object-contain" />
              <div className="leading-tight hidden sm:block">
                <p className="font-display text-base font-bold">Learnova</p>
                <p className="text-[11px] text-muted-foreground">Teach Differently</p>
              </div>
            </Link>
          </div>
          
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link to={location.pathname === "/admin" ? "/dashboard" : "/admin"}>
                <Button variant="ghost" size="sm" className="rounded-xl text-indigo-600 hover:text-indigo-600 font-bold border-2 border-indigo-100 hover:border-indigo-400 hover:bg-indigo-50 hover:shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all duration-300">
                  <Shield className="h-4 w-4 mr-1.5" /> {location.pathname === "/admin" ? "Home Panel" : "Admin Panel"}
                </Button>
              </Link>
            )}
            {user && (
              <Button variant="ghost" size="sm" onClick={() => setShowSignOutDialog(true)} className="rounded-xl">
                <LogOut className="h-4 w-4 mr-1" /> Sign out
              </Button>
            )}
          </div>
        </div>
      </header>

      <Dialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
        <DialogContent className="rounded-3xl border-0 max-w-sm p-8">
          <DialogHeader className="text-center items-center">
            <div className="h-16 w-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 mb-4">
              <LogOut className="h-8 w-8" />
            </div>
            <DialogTitle className="text-2xl font-display font-bold">Sign Out?</DialogTitle>
            <DialogDescription className="text-slate-500 mt-2">
              Are you sure you want to log out of your teacher account?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-col gap-2 mt-6">
            <Button onClick={signOut} variant="destructive" className="w-full h-12 rounded-xl font-bold text-lg transition-all hover:scale-[1.02]">
              Yes, Sign Out
            </Button>
            <Button variant="ghost" onClick={() => setShowSignOutDialog(false)} className="w-full text-slate-400">Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <main className="container py-8 animate-fade-in">{children}</main>
    </div>
  );
};
