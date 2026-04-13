
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-br from-primary via-accent to-primary text-primary-foreground">
      {/* Subtle dot pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-background/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm uppercase tracking-widest font-semibold mb-4 opacity-80">
            Let's Work Together
          </p>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            Ready to Build Something Amazing?
          </h2>
          <p className="text-lg md:text-xl mb-10 opacity-90 max-w-2xl mx-auto">
            Every great website starts with a conversation. Let's discuss your vision, goals, and budget to create the perfect solution for your business.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild className="bg-background text-foreground hover:bg-muted px-8 py-6 text-lg font-semibold shadow-lg">
              <Link to="/project-intake">
                Get Your Free Consultation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 px-8 py-6 text-lg font-semibold">
              <Link to="/portfolio">View Our Work</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
