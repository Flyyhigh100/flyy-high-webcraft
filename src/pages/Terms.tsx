import React from 'react';

export default function Terms() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Terms of Service</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="lead text-xl mb-8">
            Please read these Terms of Service ("Terms", "Terms of Service") carefully before 
            using the SydeVault website and services.
          </p>
          
          <h2 className="text-2xl font-bold mt-12 mb-4">1. Agreement to Terms</h2>
          <p>
            By accessing our website and/or using our services, you agree to be bound by these 
            Terms of Service, all applicable laws and regulations, and agree that you are 
            responsible for compliance with any applicable local laws.
          </p>
          <p>
            If you do not agree with any of these terms, you are prohibited from using or 
            accessing this site. The materials contained in this website are protected by 
            applicable copyright and trademark law.
          </p>
          
          <h2 className="text-2xl font-bold mt-12 mb-4">2. Use License</h2>
          <p>
            Permission is granted to temporarily download one copy of the materials (information 
            or software) on SydeVault's website for personal, non-commercial transitory 
            viewing only. This is the grant of a license, not a transfer of title, and under this 
            license you may not:
          </p>
          <ul className="list-disc pl-8 mb-6">
            <li>Modify or copy the materials;</li>
            <li>Use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
            <li>Attempt to decompile or reverse engineer any software contained on SydeVault's website;</li>
            <li>Remove any copyright or other proprietary notations from the materials; or</li>
            <li>Transfer the materials to another person or "mirror" the materials on any other server.</li>
          </ul>
          
          <h2 className="text-2xl font-bold mt-12 mb-4">3. Disclaimer</h2>
          <p>
            The materials on SydeVault's website are provided on an 'as is' basis. 
            SydeVault makes no warranties, expressed or implied, and hereby disclaims 
            and negates all other warranties including, without limitation, implied warranties 
            or conditions of merchantability, fitness for a particular purpose, or non-infringement 
            of intellectual property or other violation of rights.
          </p>
          
          <h2 className="text-2xl font-bold mt-12 mb-4">4. Limitations</h2>
          <p>
            In no event shall SydeVault or its suppliers be liable for any damages 
            (including, without limitation, damages for loss of data or profit, or due to business 
            interruption) arising out of the use or inability to use the materials on SydeVault's 
            website, even if SydeVault or a SydeVault authorized 
            representative has been notified orally or in writing of the possibility of such damage.
          </p>
          
          <h2 className="text-2xl font-bold mt-12 mb-4">5. Revisions and Errata</h2>
          <p>
            The materials appearing on SydeVault's website could include technical, 
            typographical, or photographic errors. SydeVault does not warrant that any 
            of the materials on its website are accurate, complete or current. SydeVault 
            may make changes to the materials contained on its website at any time without notice.
          </p>
          
          <h2 className="text-2xl font-bold mt-12 mb-4">6. Links</h2>
          <p>
            SydeVault has not reviewed all of the sites linked to its website and is 
            not responsible for the contents of any such linked site. The inclusion of any link 
            does not imply endorsement by SydeVault of the site. Use of any such linked 
            website is at the user's own risk.
          </p>
          
          <h2 className="text-2xl font-bold mt-12 mb-4">7. Payment Processing</h2>
          <p>
            All payments for SydeVault services are processed securely through Stripe, Inc. 
            When you make a payment, you will see "Flyy High LLC" on your billing statement 
            as the merchant of record. Flyy High LLC is the company that handles payment 
            processing for SydeVault services.
          </p>
          <p>
            By making a payment, you agree to Stripe's Terms of Service and Privacy Policy. 
            Your payment information is encrypted and securely processed by Stripe. We do not 
            store your credit card information on our servers.
          </p>
          
          <h2 className="text-2xl font-bold mt-12 mb-4">8. Subscription and Billing</h2>
          <p>
            Subscription fees are billed in advance on a monthly or annual basis depending on 
            your selected plan. You can cancel your subscription at any time through your 
            account dashboard or by contacting our support team. Upon cancellation, you will 
            continue to have access to the service until the end of your current billing period.
          </p>
          <p>
            Refunds are available within 30 days of your initial purchase. Refunds for 
            subsequent billing periods are at our discretion and may be prorated based on usage.
          </p>
          
          <h2 className="text-2xl font-bold mt-12 mb-4">9. Data and Privacy</h2>
          <p>
            Your website data is stored securely using our database infrastructure. We implement 
            industry-standard security measures to protect your data. You retain full ownership 
            of your website content and data. We do not access, modify, or share your data 
            except as necessary to provide our services or as required by law.
          </p>
          
          <h2 className="text-2xl font-bold mt-12 mb-4">10. Modifications</h2>
          <p>
            SydeVault may revise these terms of service for its website at any time 
            without notice. By using this website you are agreeing to be bound by the then 
            current version of these terms of service.
          </p>
          
          <h2 className="text-2xl font-bold mt-12 mb-4">11. Governing Law</h2>
          <p>
            These terms and conditions are governed by and construed in accordance with the 
            laws and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
          </p>
          
          <div className="mt-12 text-center text-gray-500 text-sm">
            Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>
    </div>
  );
} 