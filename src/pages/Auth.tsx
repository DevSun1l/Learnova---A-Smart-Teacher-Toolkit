import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { GraduationCap, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const Auth = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", school: "", password: "" });

  useEffect(() => {
    if (session) navigate("/dashboard", { replace: true });
  }, [session, navigate]);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { first_name: form.firstName, last_name: form.lastName, school: form.school },
          },
        });
        if (error) throw error;
        toast.success("Welcome! You're all set.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
        if (error) throw error;
        toast.success("Welcome back!");
      }
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
        <div className="text-primary-foreground space-y-6 px-4">
          <div className="flex items-center gap-3">
            <img src="/loginpage_logo.png" alt="Learnova Logo" className="h-14 w-14 rounded-2xl object-contain bg-white/10 p-1" />
            <span className="font-display font-bold text-xl">Learnova</span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-bold leading-[1.05]">
            Teach with<br/>more <span className="italic">heart</span>.<br/>And less prep.
          </h1>
          <p className="text-lg text-primary-foreground/90 max-w-md">
            Four research-backed tools — UDL planning, behavior tracking, developmental tips, and AI-powered intervention plans — built for real classrooms.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            {["UDL", "Vygotsky", "Piaget", "Erikson", "AI insights"].map(t => (
              <span key={t} className="px-3 py-1 rounded-full bg-white/15 backdrop-blur text-sm">{t}</span>
            ))}
          </div>
        </div>

        <Card className="p-8 rounded-3xl border-0 shadow-2xl">
          <div className="flex items-center gap-2 mb-1 text-primary">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">{mode === "signup" ? "Create teacher account" : "Welcome back"}</span>
          </div>
          <h2 className="font-display text-2xl mb-6">{mode === "signup" ? "Let's get you set up." : "Sign in to continue."}</h2>

          <form onSubmit={handle} className="space-y-4">
            {mode === "signup" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="fn">First name</Label>
                    <Input id="fn" required value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="ln">Last name</Label>
                    <Input id="ln" required value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="sch">School / Organization</Label>
                  <Input id="sch" required value={form.school} onChange={e => setForm({ ...form, school: e.target.value })} />
                </div>
              </>
            )}
            <div>
              <Label htmlFor="em">Email</Label>
              <Input id="em" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="pw">Password</Label>
              <Input id="pw" type="password" required minLength={6} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-gradient-warm hover:opacity-95 text-primary-foreground h-11 rounded-xl">
              {loading ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
            </Button>
          </form>
          <p className="text-sm text-muted-foreground mt-5 text-center">
            {mode === "signup" ? "Already a teacher here?" : "New here?"}{" "}
            <button onClick={() => setMode(mode === "signup" ? "signin" : "signup")} className="text-primary font-semibold hover:underline">
              {mode === "signup" ? "Sign in" : "Create an account"}
            </button>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
