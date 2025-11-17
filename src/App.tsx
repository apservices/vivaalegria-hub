import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Financeiro from "./pages/Financeiro";
import Eventos from "./pages/Eventos";
import Profissionais from "./pages/Profissionais";
import Satisfacao from "./pages/Satisfacao";
import Configuracoes from "./pages/Configuracoes";
import Ajuda from "./pages/Ajuda";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/financeiro" element={<Financeiro />} />
            <Route path="/eventos" element={<Eventos />} />
            <Route path="/profissionais" element={<Profissionais />} />
            <Route path="/satisfacao" element={<Satisfacao />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
            <Route path="/ajuda" element={<Ajuda />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
