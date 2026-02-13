import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Index from "./pages/Index";
import MyPlants from "./pages/MyPlants";
import AddPlant from "./pages/AddPlant";
import Reminders from "./pages/Reminders";
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import PlantDetail from "./pages/PlantDetail";
import { DiagnosticTool } from "./pages/DiagnosticTool";
import { useEffect } from "react";
import { initializeDefaultPlants } from "./services/initializeFirebase";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    initializeDefaultPlants();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/my-plants" element={<MyPlants />} />
                <Route path="/plant/:id" element={<PlantDetail />} />
                <Route path="/add-plant" element={<AddPlant />} />
                <Route path="/reminders" element={<Reminders />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/about" element={<About />} />
                <Route path="/diagnostics" element={<DiagnosticTool />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
