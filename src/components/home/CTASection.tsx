
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-primary to-accent text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Online Presence?
          </h2>
          <p className="text-lg md:text-xl mb-8 opacity-90">
            Let's create a website that works as hard as you do. Get in touch today for a free consultation.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild className="bg-background text-foreground hover:bg-muted px-8 py-6 text-lg font-semibold shadow-lg">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
