import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { AuthGuard } from "./components/AuthGuard";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Financeiro from "./pages/Financeiro";
import Eventos from "./pages/Eventos";
import Profissionais from "./pages/Profissionais";
import Satisfacao from "./pages/Satisfacao";
import Reclamacoes from "./pages/Reclamacoes";
import ControleConferencia from "./pages/ControleConferencia";
import Configuracoes from "./pages/Configuracoes";
import Ajuda from "./pages/Ajuda";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<AuthGuard><Layout /></AuthGuard>}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/financeiro" element={<Financeiro />} />
                <Route path="/eventos" element={<Eventos />} />
                <Route path="/profissionais" element={<Profissionais />} />
                <Route path="/satisfacao" element={<Satisfacao />} />
                <Route path="/reclamacoes" element={<Reclamacoes />} />
                <Route path="/controle-conferencia" element={<ControleConferencia />} />
                <Route path="/configuracoes" element={<Configuracoes />} />
                <Route path="/ajuda" element={<Ajuda />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
