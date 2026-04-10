
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ScrollToTop } from "./ScrollToTop";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import EngagementWidget from "@/components/home/EngagementWidget";

export function Layout() {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  
  useEffect(() => {
    if (user) {
      console.log("Layout: User authenticated, isAdmin:", isAdmin);
    }
  }, [user, isAdmin]);

  const hideWidget = !!user || location.pathname.startsWith("/admin") || location.pathname.startsWith("/dashboard");
  
  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      {!hideWidget && <EngagementWidget />}
    </div>
  );
}
