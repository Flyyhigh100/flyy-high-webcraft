
import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ScrollToTop } from "./ScrollToTop";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export function Layout() {
  const { user, isAdmin } = useAuth();
  
  // Debug log to see if the Layout component is aware of admin status
  useEffect(() => {
    if (user) {
      console.log("Layout: User authenticated, isAdmin:", isAdmin);
    }
  }, [user, isAdmin]);
  
  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
