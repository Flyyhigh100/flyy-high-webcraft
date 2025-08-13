
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown } from "lucide-react";

// Sample testimonials data
const testimonials = [
  {
    id: 1,
    text: "Syde Vault transformed our outdated website into a modern, conversion-focused platform. Sales have increased since the redesign!",
    name: "Sarah Johnson",
    role: "CEO, Retail Solutions Inc.",
    // These would be real images from your project in production
    avatarUrl: "https://randomuser.me/api/portraits/women/32.jpg",
    company: "Retail Solutions Inc.",
  },
  {
    id: 2,
    text: "The AI features they implemented on our website have drastically improved our user engagement. Their team was professional, communicative, and delivered everything on time.",
    name: "Michael Rodriguez",
    role: "Marketing Director, TechStart",
    avatarUrl: "https://randomuser.me/api/portraits/men/42.jpg",
    company: "TechStart",
  },
  {
    id: 3,
    text: "We've worked with several web development agencies before, but Syde Vault truly stands out. Their attention to detail and commitment to our success has made them our go-to digital partner.",
    name: "Emily Chang",
    role: "Founder, Wellness Collective",
    avatarUrl: "https://randomuser.me/api/portraits/women/65.jpg",
    company: "Wellness Collective",
  },
];

const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  return (
    <section className="section bg-gray-50">
      <div className="container mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="gradient-text">What Our Clients Say</span>
          </h2>
          <p className="text-gray-700 text-lg">
            Don't just take our word for it - hear from some of our satisfied clients.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-12">
            <div className="flex flex-col items-center text-center">
              <svg
                className="w-12 h-12 mb-6 text-flyy-300"
                fill="currentColor"
                viewBox="0 0 32 32"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
              </svg>
              
              <p className="text-xl md:text-2xl text-gray-600 italic mb-8">
                "{testimonials[activeIndex].text}"
              </p>
              
              <div className="mb-8">
                <div 
                  className="w-16 h-16 rounded-full overflow-hidden mb-4 mx-auto"
                  style={{
                    backgroundImage: `url(${testimonials[activeIndex].avatarUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                ></div>
                <div>
                  <h4 className="font-bold text-lg">{testimonials[activeIndex].name}</h4>
                  <p className="text-gray-500">{testimonials[activeIndex].role}</p>
                  <p className="text-flyy-600">{testimonials[activeIndex].company}</p>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full border-gray-300 hover:border-flyy-500 hover:text-flyy-500"
                  onClick={prevTestimonial}
                >
                  <ArrowUp size={20} />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full border-gray-300 hover:border-flyy-500 hover:text-flyy-500"
                  onClick={nextTestimonial}
                >
                  <ArrowDown size={20} />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center mt-12">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full mx-1 ${
                index === activeIndex ? "bg-flyy-500" : "bg-gray-300"
              }`}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
