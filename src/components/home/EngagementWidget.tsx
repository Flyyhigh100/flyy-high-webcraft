import { useState, useEffect } from "react";
import { X, MessageCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const EngagementWidget = () => {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

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

  if (!visible) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 z-40 w-[320px] max-w-[calc(100vw-2rem)] transition-all duration-500 ease-out ${
        dismissed ? "translate-y-full opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <div className="bg-card border border-border rounded-xl shadow-2xl shadow-black/40 overflow-hidden">
        {/* Gold accent bar */}
        <div className="h-1 bg-gradient-to-r from-primary to-accent" />

        <div className="p-5 relative">
          <button
            onClick={dismiss}
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-primary" />
            </div>
            <h4 className="font-bold text-foreground text-sm">Have a project in mind?</h4>
          </div>

          <p className="text-muted-foreground text-xs leading-relaxed mb-4">
            Tell us what you're looking for and we'll get back to you within 24 hours.
          </p>

          <div className="flex gap-2">
            <Link
              to="/contact"
              onClick={dismiss}
              className="flex-1 text-center text-xs font-medium py-2 px-3 rounded-lg border border-border text-foreground hover:bg-secondary transition-colors"
            >
              Quick Question
            </Link>
            <Link
              to="/get-started"
              onClick={dismiss}
              className="flex-1 flex items-center justify-center gap-1 text-xs font-medium py-2 px-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Free Quote <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngagementWidget;
