import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import UDLPlanner from "./pages/tools/UDLPlanner";
import Behavioral from "./pages/tools/Behavioral";
import Developmental from "./pages/tools/Developmental";
import Intervention from "./pages/tools/Intervention";
import StudentBoard from "./pages/StudentBoard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<StudentBoard />} />
            <Route path="/join" element={<StudentBoard />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
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
