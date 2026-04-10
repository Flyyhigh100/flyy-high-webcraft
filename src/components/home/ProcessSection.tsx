
import { useEffect, useRef, useState } from "react";
import { Search, Palette, Code2, Rocket } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Discovery",
    description: "We learn about your business, goals, audience, and competitors to craft a strategic plan.",
  },
  {
    icon: Palette,
    title: "Design",
    description: "We create stunning mockups and prototypes tailored to your brand identity and user needs.",
  },
  {
    icon: Code2,
    title: "Development",
    description: "Our team builds your site with clean code, fast performance, and responsive design.",
  },
  {
    icon: Rocket,
    title: "Launch",
    description: "We deploy, test, and optimize — then provide ongoing support to keep you growing.",
  },
];

const ProcessSection = () => {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="section">
      <div className="container mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Our <span className="gradient-text">Process</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            A proven four-step approach that delivers results every time.
          </p>
        </div>

        <div ref={ref} className="relative max-w-5xl mx-auto">
          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-px bg-border" />
          <div
            className={`hidden md:block absolute top-12 left-[10%] h-px bg-gradient-to-r from-primary to-accent transition-all duration-1000 ease-out ${
              visible ? 'right-[10%]' : 'right-[90%]'
            }`}
          />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={index}
                  className={`flex flex-col items-center text-center transition-all duration-500 ease-out ${
                    visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${index * 200}ms` }}
                >
                  {/* Step circle */}
                  <div className="relative z-10 w-24 h-24 rounded-full bg-card border-2 border-border flex items-center justify-center mb-6 group hover:border-primary/50 transition-colors duration-300">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    {/* Step number */}
                    <span className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-lg shadow-primary/30">
                      {index + 1}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
