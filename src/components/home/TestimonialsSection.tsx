
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    text: "Syde Vault has been providing Website services for PFC for about a year, and we have been very happy with the results we are seeing. Previously we had zero responses to our website and now we are seeing regular inquiries for our services. Syde Vault provides an excellent service at a very reasonable cost.",
    name: "Eric Hoffman",
    role: "President",
    company: "Precision Fabricated Components",
  },
  {
    id: 2,
    text: "I've run my daycare for years without a website. Syde Vault created my first one and helped me present my concept, routines, and values so clearly that parents now come to me already understanding how I work—and that makes choosing us much easier for them.",
    name: "",
    role: "Business Owner",
    company: "Hakuna Matata Daycare",
  },
  {
    id: 3,
    text: "As a new nursing recruitment agency, I needed a professional online presence to start building trust with hospitals and candidates. Syde Vault guided me from a blank page to a clear, credible website that explains our services, highlights our values, and gives international nurses an easy way to get in touch.",
    name: "",
    role: "Co-Owner",
    company: "Delta Personal Services",
  },
];

const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('right');

  const changeTestimonial = useCallback((newIndex: number, dir: 'left' | 'right') => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDirection(dir);
    setTimeout(() => {
      setActiveIndex(newIndex);
      setIsAnimating(false);
    }, 300);
  }, [isAnimating]);

  const nextTestimonial = () => {
    const next = activeIndex === testimonials.length - 1 ? 0 : activeIndex + 1;
    changeTestimonial(next, 'right');
  };

  const prevTestimonial = () => {
    const prev = activeIndex === 0 ? testimonials.length - 1 : activeIndex - 1;
    changeTestimonial(prev, 'left');
  };

  // Auto-advance every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      const next = (activeIndex + 1) % testimonials.length;
      changeTestimonial(next, 'right');
    }, 6000);
    return () => clearInterval(timer);
  }, [activeIndex, changeTestimonial]);

  return (
    <section className="section bg-secondary/50">
      <div className="container mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="gradient-text">What Our Clients Say</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Don't just take our word for it — hear from some of our satisfied clients.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative bg-card border border-border rounded-2xl p-8 md:p-12 shadow-2xl shadow-primary/5">
            {/* Gold accent line at top */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-primary to-accent rounded-b-full" />

            <div className="flex flex-col items-center text-center">
              <Quote className="w-10 h-10 text-primary/60 mb-6" />

              <div
                className={`transition-all duration-300 ease-in-out ${
                  isAnimating
                    ? `opacity-0 ${direction === 'right' ? '-translate-x-4' : 'translate-x-4'}`
                    : 'opacity-100 translate-x-0'
                }`}
              >
                <p className="text-lg md:text-xl text-foreground/90 italic leading-relaxed mb-8">
                  "{testimonials[activeIndex].text}"
                </p>

                <div className="mb-2">
                  <h4 className="font-bold text-lg text-foreground">{testimonials[activeIndex].name}</h4>
                  <p className="text-muted-foreground text-sm">{testimonials[activeIndex].role}</p>
                  <p className="text-primary font-medium text-sm">{testimonials[activeIndex].company}</p>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-6 mt-8">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full border-border hover:border-primary hover:text-primary hover:bg-primary/10 transition-all"
                  onClick={prevTestimonial}
                >
                  <ArrowLeft size={18} />
                </Button>

                <div className="flex gap-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      className={`rounded-full transition-all duration-300 ${
                        index === activeIndex
                          ? "w-8 h-2 bg-primary"
                          : "w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                      }`}
                      onClick={() => changeTestimonial(index, index > activeIndex ? 'right' : 'left')}
                    />
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full border-border hover:border-primary hover:text-primary hover:bg-primary/10 transition-all"
                  onClick={nextTestimonial}
                >
                  <ArrowRight size={18} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
