import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const SuccessStep = () => {
  return (
    <div className="text-center py-12 animate-fade-in">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
        <CheckCircle2 className="w-10 h-10 text-primary" />
      </div>
      
      <h2 className="text-3xl font-bold text-foreground mb-4">
        Thank You!
      </h2>
      
      <p className="text-lg text-muted-foreground mb-2 max-w-md mx-auto">
        We've received your project details and will be in touch soon.
      </p>
      
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        You should receive a confirmation email shortly with a summary of your submission.
        We typically respond within 24-48 hours.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild variant="outline">
          <Link to="/">
            Return to Home
          </Link>
        </Button>
        <Button asChild>
          <Link to="/contact">
            Contact Us <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default SuccessStep;
