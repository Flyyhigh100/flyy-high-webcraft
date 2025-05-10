import React from 'react';

export default function About() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">About Flyy High WebCraft</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="lead text-xl mb-8">
            We're a passionate team of web designers and developers dedicated to crafting beautiful, 
            functional websites that help businesses succeed online.
          </p>
          
          <h2 className="text-2xl font-bold mt-12 mb-4">Our Mission</h2>
          <p>
            At Flyy High WebCraft, our mission is to empower businesses with exceptional 
            web presence through innovative design, cutting-edge development, and strategic 
            digital solutions. We believe that every business deserves a website that not 
            only looks stunning but also delivers tangible results.
          </p>
          
          <h2 className="text-2xl font-bold mt-12 mb-4">Our Approach</h2>
          <p>
            We take a collaborative approach to every project, working closely with our clients 
            to understand their unique needs, goals, and vision. This client-centric focus allows 
            us to create tailored solutions that align perfectly with business objectives.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-12">
            <div className="bg-primary/10 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-3">Creative Design</h3>
              <p>Beautiful, intuitive designs that engage your visitors and reflect your brand identity.</p>
            </div>
            
            <div className="bg-primary/10 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-3">Custom Development</h3>
              <p>Tailored solutions built with clean, efficient code that performs flawlessly.</p>
            </div>
            
            <div className="bg-primary/10 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-3">Ongoing Support</h3>
              <p>Reliable maintenance and updates to keep your website secure and performing at its best.</p>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mt-12 mb-4">Our Team</h2>
          <p>
            Our diverse team brings together talent from various backgrounds, including design, 
            development, marketing, and project management. This multidisciplinary approach allows 
            us to tackle complex challenges and deliver comprehensive solutions.
          </p>
          
          <div className="mt-12 bg-gray-50 p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Ready to Work With Us?</h2>
            <p className="mb-6">
              Whether you need a brand new website, a redesign, or ongoing development support, 
              we're here to help you achieve your digital goals.
            </p>
            <a 
              href="/contact" 
              className="inline-block bg-primary text-white px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 