import MultiStepIntakeForm from '@/components/intake/MultiStepIntakeForm';

const ProjectIntake = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Website Project Intake
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Help us understand your project needs by completing this brief questionnaire. 
            It only takes about 10 minutes.
          </p>
        </div>

        <MultiStepIntakeForm />
      </div>
    </div>
  );
};

export default ProjectIntake;
