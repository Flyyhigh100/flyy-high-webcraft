import { useState, useEffect } from "react";
import { X, MessageCircle, ArrowRight, Check, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const EngagementWidget = () => {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [interest, setInterest] = useState("");

  useEffect(() => {
    if (sessionStorage.getItem("engagementShown")) return;

    const timer = setTimeout(() => {
      setVisible(true);
      sessionStorage.setItem("engagementShown", "true");
    }, 45000);

    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setDismissed(true);
    setTimeout(() => setVisible(false), 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !interest) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email");
      return;
    }

    setLoading(true);

    try {
      // Store in newsletter_subscribers
      await supabase.from("newsletter_subscribers").insert({
        email: email.toLowerCase().trim(),
        source: "engagement_widget",
      });

      // Submit project inquiry via edge function
      const { error } = await supabase.functions.invoke("submit-project-inquiry", {
        body: {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          projectType: interest,
          projectDescription: `Submitted via engagement widget - interested in ${interest}`,
        },
      });

      if (error) throw error;

      setSubmitted(true);
      setTimeout(dismiss, 3000);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 z-40 w-[320px] max-w-[calc(100vw-2rem)] transition-all duration-500 ease-out ${
        dismissed ? "translate-y-full opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <div className="bg-card border border-border rounded-xl shadow-2xl shadow-black/40 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-primary to-accent" />

        <div className="p-5 relative">
          <button
            onClick={dismiss}
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>

          {submitted ? (
            <div className="flex flex-col items-center py-4 gap-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Check className="w-5 h-5 text-primary" />
              </div>
              <p className="font-bold text-foreground text-sm">Thanks! We'll be in touch.</p>
              <p className="text-muted-foreground text-xs">Within 24 hours</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-primary" />
                </div>
                <h4 className="font-bold text-foreground text-sm">Have a project in mind?</h4>
              </div>

              <form onSubmit={handleSubmit} className="space-y-2 mb-3">
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <select
                  value={interest}
                  onChange={(e) => setInterest(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">What are you interested in?</option>
                  <option value="New Website">New Website</option>
                  <option value="Redesign">Redesign</option>
                  <option value="E-Commerce">E-Commerce</option>
                  <option value="Other">Other</option>
                </select>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-1 text-xs font-medium py-2 px-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <>
                      Send It Over <ArrowRight className="w-3 h-3" />
                    </>
                  )}
                </button>
              </form>

              <div className="flex items-center justify-center gap-3 text-[11px] text-muted-foreground">
                <span>Or:</span>
                <Link to="/contact" onClick={dismiss} className="hover:text-foreground transition-colors underline">
                  Quick Question
                </Link>
                <Link to="/get-started" onClick={dismiss} className="hover:text-foreground transition-colors underline">
                  Free Quote
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EngagementWidget;
