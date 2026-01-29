import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StepProps } from '../types';

const websiteGoals = [
  'Generate leads / inquiries',
  'Sell products online',
  'Provide information about my business',
  'Build credibility / trust',
  'Showcase my work / portfolio',
  'Book appointments',
  'Build an email list',
  'Other',
];

const referralSources = [
  'Google search',
  'Social media',
  'Referral from friend or colleague',
  'Previous client',
  'Advertisement',
  'Other',
];

const AdditionalInfoStep = ({ data, updateData, errors }: StepProps) => {
  const toggleGoal = (goal: string) => {
    const current = data.websiteGoals;
    const updated = current.includes(goal)
      ? current.filter((g) => g !== goal)
      : [...current, goal];
    updateData({ websiteGoals: updated });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Additional Information</h2>
        <p className="text-muted-foreground mt-1">
          A few final questions to help us understand your goals.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label htmlFor="competitors" className="text-foreground">
            Who are your main competitors?
          </Label>
          <Textarea
            id="competitors"
            value={data.competitors}
            onChange={(e) => updateData({ competitors: e.target.value })}
            placeholder="List 2-3 competitors and their websites if known"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="targetAudience" className="text-foreground">
            Who is your target audience? <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="targetAudience"
            value={data.targetAudience}
            onChange={(e) => updateData({ targetAudience: e.target.value })}
            placeholder="Describe your ideal customer"
            rows={3}
            className={errors.targetAudience ? 'border-destructive' : ''}
          />
          {errors.targetAudience && (
            <p className="text-sm text-destructive mt-1">{errors.targetAudience}</p>
          )}
        </div>

        <div>
          <Label className="text-foreground">
            What is the primary goal of your website? <span className="text-destructive">*</span>
          </Label>
          <p className="text-xs text-muted-foreground mb-2">Select all that apply</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            {websiteGoals.map((goal) => (
              <div key={goal} className="flex items-center space-x-2">
                <Checkbox
                  id={`goal-${goal}`}
                  checked={data.websiteGoals.includes(goal)}
                  onCheckedChange={() => toggleGoal(goal)}
                />
                <Label
                  htmlFor={`goal-${goal}`}
                  className="text-foreground font-normal cursor-pointer"
                >
                  {goal}
                </Label>
              </div>
            ))}
          </div>
          {errors.websiteGoals && (
            <p className="text-sm text-destructive mt-1">{errors.websiteGoals}</p>
          )}
        </div>

        <div>
          <Label htmlFor="referralSource" className="text-foreground">
            How did you hear about us?
          </Label>
          <Select
            value={data.referralSource}
            onValueChange={(value) => updateData({ referralSource: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {referralSources.map((source) => (
                <SelectItem key={source} value={source}>
                  {source}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="additionalNotes" className="text-foreground">
            Is there anything else you'd like us to know about your project?
          </Label>
          <Textarea
            id="additionalNotes"
            value={data.additionalNotes}
            onChange={(e) => updateData({ additionalNotes: e.target.value })}
            placeholder="Any other details, questions, or concerns..."
            rows={4}
          />
        </div>
      </div>
    </div>
  );
};

export default AdditionalInfoStep;
