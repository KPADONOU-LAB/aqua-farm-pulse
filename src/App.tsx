import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebarOptimized } from "@/components/AppSidebarOptimized";
import { TopNavigationOptimized } from "@/components/TopNavigationOptimized";
import { IntelligentDashboard } from "@/components/IntelligentDashboard";
import { HelpSystem } from "@/components/HelpSystem";
import { AuthProvider } from "@/hooks/useAuth";
import { FarmProvider } from "@/contexts/FarmContext";
import { FarmSetupWrapper } from "@/components/FarmSetupWrapper";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Auth from "./pages/Auth";
import Cages from "./pages/Cages";
import Feeding from "./pages/Feeding";
import WaterQuality from "./pages/WaterQuality";
import Health from "./pages/Health";
import Inventory from "./pages/Inventory";
import Sales from "./pages/Sales";
import Finance from "./pages/Finance";
import CRM from "./pages/CRM";
import Reports from "./pages/Reports";
import Alerts from "./pages/Alerts";
import Predictions from "./pages/Predictions";
import SmartAlerts from "./pages/SmartAlerts";
import PerformanceAnalysis from "./pages/PerformanceAnalysis";
import SmartNotifications from "./pages/SmartNotifications";
import SmartRecommendations from "./pages/SmartRecommendations";
import AdvancedReports from "./pages/AdvancedReports";
import AdvancedAnalytics from "./pages/AdvancedAnalytics";
import CustomDashboards from "./pages/CustomDashboards";
import CageHistory from "./pages/CageHistory";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function NotificationProvider({ children }: { children: React.ReactNode }) {
  useRealtimeNotifications();
  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
          <AuthProvider>
            <FarmProvider>
              <NotificationProvider>
                <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/*" element={
                  <ProtectedRoute>
                    <FarmSetupWrapper>
                      <SidebarProvider>
                      <div className="flex h-screen bg-background">
                        <AppSidebarOptimized />
                        <div className="flex-1 flex flex-col overflow-hidden">
                          <TopNavigationOptimized />
                          <main className="flex-1 overflow-y-auto bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
                            <Routes>
                              <Route path="/" element={<IntelligentDashboard />} />
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
                              <Route path="/smart-notifications" element={<SmartNotifications />} />
                              <Route path="/smart-recommendations" element={<SmartRecommendations />} />
                              <Route path="/advanced-reports" element={<AdvancedReports />} />
                              <Route path="/advanced-analytics" element={<AdvancedAnalytics />} />
                              <Route path="/custom-dashboards" element={<CustomDashboards />} />
                              <Route path="/cage-history" element={<CageHistory />} />
                              <Route path="/settings" element={<Settings />} />
                              <Route path="*" element={<NotFound />} />
                            </Routes>
                          </main>
                        </div>
                      </div>
                      <HelpSystem />
                      </SidebarProvider>
                    </FarmSetupWrapper>
                  </ProtectedRoute>
                } />
                </Routes>
              </NotificationProvider>
            </FarmProvider>
          </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}