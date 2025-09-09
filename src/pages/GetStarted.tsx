import ProjectIntakeForm from '@/components/project/ProjectIntakeForm';

const GetStarted = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Let's Build Something Amazing Together
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Ready to bring your vision to life? Share your project details with us and we'll get back to you with a personalized plan.
            </p>
          </div>
          
          <div className="bg-background/80 backdrop-blur-sm rounded-2xl shadow-xl p-2">
            <ProjectIntakeForm />
          </div>
          
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              Have questions? <a href="/contact" className="text-primary hover:underline">Contact us directly</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetStarted;