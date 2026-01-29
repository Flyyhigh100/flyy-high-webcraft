import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { STEP_TITLES } from './types';

interface IntakeProgressProps {
  currentStep: number;
  completedSteps: number[];
  onStepClick: (step: number) => void;
}

const IntakeProgress = ({ currentStep, completedSteps, onStepClick }: IntakeProgressProps) => {
  return (
    <div className="w-full mb-8">
      {/* Mobile view - simplified */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            Step {currentStep + 1} of {STEP_TITLES.length}
          </span>
          <span className="text-sm text-muted-foreground">
            {STEP_TITLES[currentStep]}
          </span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / STEP_TITLES.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop view - full step indicators */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between">
          {STEP_TITLES.map((title, index) => {
            const isCompleted = completedSteps.includes(index);
            const isCurrent = currentStep === index;
            const isClickable = isCompleted || index <= Math.max(...completedSteps, 0) + 1;

            return (
              <div key={index} className="flex flex-col items-center flex-1">
                <div className="flex items-center w-full">
                  {/* Connector line before */}
                  {index > 0 && (
                    <div
                      className={cn(
                        "flex-1 h-0.5 transition-colors duration-300",
                        index <= currentStep ? "bg-primary" : "bg-border"
                      )}
                    />
                  )}
                  
                  {/* Step circle */}
                  <button
                    type="button"
                    onClick={() => isClickable && onStepClick(index)}
                    disabled={!isClickable}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 shrink-0",
                      isCompleted && !isCurrent && "bg-primary text-primary-foreground",
                      isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                      !isCompleted && !isCurrent && "bg-secondary text-muted-foreground",
                      isClickable && !isCurrent && "cursor-pointer hover:opacity-80",
                      !isClickable && "cursor-not-allowed opacity-50"
                    )}
                  >
                    {isCompleted && !isCurrent ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      index + 1
                    )}
                  </button>

                  {/* Connector line after */}
                  {index < STEP_TITLES.length - 1 && (
                    <div
                      className={cn(
                        "flex-1 h-0.5 transition-colors duration-300",
                        index < currentStep ? "bg-primary" : "bg-border"
                      )}
                    />
                  )}
                </div>

                {/* Step title */}
                <span
                  className={cn(
                    "mt-2 text-xs font-medium transition-colors duration-300 text-center",
                    isCurrent ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {title}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default IntakeProgress;
