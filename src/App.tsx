import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import DashboardLayout from "./pages/DashboardLayout";
import DashboardHome from "./pages/dashboard/Home";
import Recordings from "./pages/dashboard/Recordings";
import Ideas from "./pages/dashboard/Ideas";
import IdeaDetail from "./pages/dashboard/IdeaDetail";
import Posts from "./pages/dashboard/Posts";
import BrandDNA from "./pages/dashboard/BrandDNA";
import RecordingDetail from "./pages/dashboard/RecordingDetail";
import Channels from "./pages/dashboard/Channels";
import Calendar from "./pages/dashboard/Calendar";
import Analytics from "./pages/dashboard/Analytics";
import Settings from "./pages/dashboard/Settings";
import NotFound from "./pages/NotFound";
import DemoLayout from "./demo/DemoLayout";
import DemoHome from "./demo/pages/Home";
import DemoRecordings from "./demo/pages/Recordings";
import DemoRecordingDetail from "./demo/pages/RecordingDetail";
import DemoChannels from "./demo/pages/Channels";
import DemoCalendar from "./demo/pages/Calendar";
import DemoAnalytics from "./demo/pages/Analytics";
import DemoSettings from "./demo/pages/Settings";

const queryClient = new QueryClient();

const LegacyBrainDumpRedirect = ({ demo = false }: { demo?: boolean }) => {
  const { id } = useParams();
  const base = demo ? "/demo/brain-dumps" : "/dashboard/brain-dumps";
  return <Navigate to={id ? `${base}/${id}` : base} replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="brain-dumps" element={<Ideas />} />
            <Route path="brain-dumps/:id" element={<IdeaDetail />} />
            <Route path="ideas" element={<LegacyBrainDumpRedirect />} />
            <Route path="ideas/:id" element={<LegacyBrainDumpRedirect />} />
            <Route path="posts" element={<Posts />} />
            <Route path="brand" element={<BrandDNA />} />
            <Route path="recordings" element={<LegacyBrainDumpRedirect />} />
            <Route path="recordings/:id" element={<LegacyBrainDumpRedirect />} />
            <Route path="channels" element={<Channels />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="/demo" element={<DemoLayout />}>
            <Route index element={<DemoHome />} />
            <Route path="brain-dumps" element={<DemoRecordings />} />
            <Route path="brain-dumps/:id" element={<DemoRecordingDetail />} />
            <Route path="recordings" element={<LegacyBrainDumpRedirect demo />} />
            <Route path="recordings/:id" element={<LegacyBrainDumpRedirect demo />} />
            <Route path="channels" element={<DemoChannels />} />
            <Route path="calendar" element={<DemoCalendar />} />
            <Route path="analytics" element={<DemoAnalytics />} />
            <Route path="settings" element={<DemoSettings />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
