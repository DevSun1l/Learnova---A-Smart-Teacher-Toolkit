import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import UDLPlanner from "./pages/tools/UDLPlanner";
import Behavioral from "./pages/tools/Behavioral";
import Developmental from "./pages/tools/Developmental";
import Intervention from "./pages/tools/Intervention";
import StudentBoard from "./pages/StudentBoard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const checkBlocked = async () => {
      if (session?.user) {
        const { data } = await supabase
          .from("profiles")
          .select("is_blocked")
          .eq("user_id", session.user.id)
          .maybeSingle();
        if (data?.is_blocked) {
          await supabase.auth.signOut();
          setBlocked(true);
        }
      }
    };
    checkBlocked();
  }, [session]);

  if (loading) return <div className="min-h-screen flex items-center justify-center italic text-muted-foreground animate-pulse">Loading Learnova...</div>;
  if (blocked) return <Navigate to="/auth" replace />;
  if (!session) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      if (session?.user) {
        const { data } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("user_id", session.user.id)
          .single();
        setIsAdmin(data?.is_admin ?? false);
      } else {
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, [session]);

  if (loading || isAdmin === null) return <div className="min-h-screen flex items-center justify-center italic text-muted-foreground animate-pulse">Verifying Admin Access...</div>;
  if (!session || !isAdmin) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/join" element={<StudentBoard />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
            <Route path="/tools/udl" element={<ProtectedRoute><UDLPlanner /></ProtectedRoute>} />
            <Route path="/tools/behavior" element={<ProtectedRoute><Behavioral /></ProtectedRoute>} />
            <Route path="/tools/developmental" element={<ProtectedRoute><Developmental /></ProtectedRoute>} />
            <Route path="/tools/intervention" element={<ProtectedRoute><Intervention /></ProtectedRoute>} />
            <Route path="/join/:code" element={<StudentBoard />} />
            <Route path="/board/:code" element={<StudentBoard />} />
            <Route path="/board" element={<StudentBoard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
