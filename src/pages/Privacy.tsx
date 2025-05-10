import React from 'react';

export default function Privacy() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Privacy Policy</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="lead text-xl mb-8">
            This Privacy Policy describes how Flyy High WebCraft ("we", "our", or "us") 
            collects, uses, and shares your personal information when you visit our website 
            or use our services.
          </p>
          
          <h2 className="text-2xl font-bold mt-12 mb-4">Information We Collect</h2>
          <p>
            When you visit our website, we may collect certain information about your device, 
            including information about your web browser, IP address, time zone, and some of 
            the cookies that are installed on your device.
          </p>
          <p>
            Additionally, as you browse the site, we may collect information about the individual 
            web pages that you view, what websites or search terms referred you to our site, 
            and information about how you interact with our site.
          </p>
          
          <h2 className="text-2xl font-bold mt-12 mb-4">How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc pl-8 mb-6">
            <li>Provide, operate, and maintain our website and services</li>
            <li>Improve, personalize, and expand our website and services</li>
            <li>Understand and analyze how you use our website and services</li>
            <li>Develop new products, services, features, and functionality</li>
            <li>Communicate with you, including for customer service and updates</li>
            <li>Send you emails and marketing communications</li>
            <li>Find and prevent fraud</li>
          </ul>
          
          <h2 className="text-2xl font-bold mt-12 mb-4">Sharing Your Information</h2>
          <p>
            We may share your personal information with third-party service providers to help 
            us operate our business and provide our services, subject to confidentiality agreements.
          </p>
          <p>
            We may also release your information when we believe release is appropriate to 
            comply with the law, enforce our site policies, or protect ours or others' rights, 
            property, or safety.
          </p>
          
          <h2 className="text-2xl font-bold mt-12 mb-4">Cookies</h2>
          <p>
            We use cookies and similar tracking technologies to track activity on our website 
            and hold certain information to improve your experience.
          </p>
          
          <h2 className="text-2xl font-bold mt-12 mb-4">Your Rights</h2>
          <p>
            If you are a resident of the European Economic Area (EEA), you have certain data 
            protection rights. We aim to take reasonable steps to allow you to correct, amend, 
            delete, or limit the use of your personal information.
          </p>
          
          <h2 className="text-2xl font-bold mt-12 mb-4">Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any 
            changes by posting the new Privacy Policy on this page and updating the "Last Updated" 
            date at the top of this Privacy Policy.
          </p>
          
          <h2 className="text-2xl font-bold mt-12 mb-4">Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us 
            through our <a href="/contact" className="text-primary hover:underline">contact page</a>.
          </p>
          
          <div className="mt-12 text-center text-gray-500 text-sm">
            Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>
    </div>
  );
} 