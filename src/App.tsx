
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { TopNavigation } from "@/components/TopNavigation";
import { HelpSystem } from "@/components/HelpSystem";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Cages from "./pages/Cages";
import Feeding from "./pages/Feeding";
import WaterQuality from "./pages/WaterQuality";
import Health from "./pages/Health";
import Inventory from "./pages/Inventory";
import Sales from "./pages/Sales";
import Reports from "./pages/Reports";
import Finance from "./pages/Finance";
import CRM from "./pages/CRM";
import Alerts from "./pages/Alerts";
import Predictions from "./pages/Predictions";
import SmartAlerts from "./pages/SmartAlerts";
import PerformanceAnalysis from "./pages/PerformanceAnalysis";
import Auth from "./pages/Auth";
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
            <Route path="/auth" element={<Auth />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <SidebarProvider>
                  <div className="min-h-screen flex flex-col w-full bg-underwater-gradient">
                    <TopNavigation />
                    <div className="flex flex-1">
                      <AppSidebar />
                      <main className="flex-1 overflow-auto">
                       <Routes>
                         <Route path="/" element={<Index />} />
                         <Route path="/cages" element={<Cages />} />
                         <Route path="/feeding" element={<Feeding />} />
                         <Route path="/water-quality" element={<WaterQuality />} />
                         <Route path="/health" element={<Health />} />
                         <Route path="/inventory" element={<Inventory />} />
                         <Route path="/sales" element={<Sales />} />
                         <Route path="/finance" element={<Finance />} />
                         <Route path="/crm" element={<CRM />} />
                         <Route path="/reports" element={<Reports />} />
                         <Route path="/alerts" element={<Alerts />} />
                         <Route path="/predictions" element={<Predictions />} />
                         <Route path="/smart-alerts" element={<SmartAlerts />} />
                         <Route path="/performance" element={<PerformanceAnalysis />} />
                         <Route path="*" element={<NotFound />} />
                       </Routes>
                      </main>
                    </div>
                    <HelpSystem />
                  </div>
                </SidebarProvider>
              </ProtectedRoute>
            } />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
