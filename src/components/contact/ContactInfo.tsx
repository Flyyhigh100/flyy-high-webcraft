
const ContactInfo = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-medium mb-2">Email</h3>
          <a href="mailto:operations@sydevault.com" className="text-primary hover:underline">
            operations@sydevault.com
          </a>
        </div>
      </div>
      
      <div className="mt-8 bg-primary/10 rounded-lg p-8 text-center border border-primary/20">
        <h3 className="text-lg font-medium mb-2">Get in Touch</h3>
        <p className="text-muted-foreground">
          We'll get back to you as quick as possible.
        </p>
      </div>
    </div>
  );
};

export default ContactInfo;
