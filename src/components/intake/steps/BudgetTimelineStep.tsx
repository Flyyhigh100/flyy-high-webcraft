import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { StepProps } from '../types';

const budgetOptions = [
  { 
    value: 'starting_out', 
    label: 'Just getting started',
    description: 'Looking for an affordable solution to get online'
  },
  { 
    value: 'under_1000', 
    label: 'Under $1,000',
    description: 'Simple site with essential features'
  },
  { 
    value: '1000_2500', 
    label: '$1,000 – $2,500',
    description: 'Custom design with more functionality'
  },
  { 
    value: '2500_5000', 
    label: '$2,500 – $5,000',
    description: 'Full-featured site with advanced capabilities'
  },
  { 
    value: '5000_plus', 
    label: '$5,000+',
    description: 'Complex projects with extensive requirements'
  },
  { 
    value: 'flexible', 
    label: 'Flexible / Not sure',
    description: "Let's discuss what works best for my goals"
  },
];

const timelineOptions = [
  { value: 'asap', label: 'ASAP' },
  { value: '2_4_weeks', label: 'Within 2-4 weeks' },
  { value: '1_2_months', label: 'Within 1-2 months' },
  { value: '3_6_months', label: 'Within 3-6 months' },
  { value: 'no_deadline', label: 'No specific deadline' },
  { value: 'specific_date', label: 'Specific date' },
];

const BudgetTimelineStep = ({ data, updateData, errors }: StepProps) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Budget & Timeline</h2>
        <p className="text-muted-foreground mt-1">
          We work with every budget — let us know where you're starting so we can find the right solution for you.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-foreground">
            What's your ideal investment range? <span className="text-destructive">*</span>
          </Label>
          <p className="text-xs text-muted-foreground mb-1">
            Don't worry — we'll tailor a solution that fits your needs and budget
          </p>
          <RadioGroup
            value={data.budgetRange}
            onValueChange={(value) => updateData({ budgetRange: value })}
            className="mt-3 space-y-3"
          >
            {budgetOptions.map((option) => (
              <div 
                key={option.value} 
                className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => updateData({ budgetRange: option.value })}
              >
                <RadioGroupItem 
                  value={option.value} 
                  id={`budget-${option.value}`}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <Label
                    htmlFor={`budget-${option.value}`}
                    className="text-foreground font-medium cursor-pointer"
                  >
                    {option.label}
                  </Label>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {option.description}
                  </p>
                </div>
              </div>
            ))}
          </RadioGroup>
          {errors.budgetRange && (
            <p className="text-sm text-destructive mt-1">{errors.budgetRange}</p>
          )}
        </div>

        <div>
          <Label className="text-foreground">
            When would you like your website to be completed? <span className="text-destructive">*</span>
          </Label>
          <RadioGroup
            value={data.timeline}
            onValueChange={(value) => updateData({ timeline: value })}
            className="mt-2 grid grid-cols-2 gap-2"
          >
            {timelineOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`timeline-${option.value}`} />
                <Label
                  htmlFor={`timeline-${option.value}`}
                  className="text-foreground font-normal cursor-pointer text-sm"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {errors.timeline && (
            <p className="text-sm text-destructive mt-1">{errors.timeline}</p>
          )}
        </div>

        <div>
          <Label htmlFor="deadlineEvent" className="text-foreground">
            Is there a specific event or deadline driving this timeline?
          </Label>
          <Input
            id="deadlineEvent"
            value={data.deadlineEvent}
            onChange={(e) => updateData({ deadlineEvent: e.target.value })}
            placeholder="E.g., business launch, seasonal promotion, etc."
          />
        </div>
      </div>
    </div>
  );
};

export default BudgetTimelineStep;
