import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StepProps } from '../types';

const industries = [
  'Retail / E-commerce',
  'Professional Services (Legal, Accounting, Consulting)',
  'Health & Wellness',
  'Food & Hospitality',
  'Construction / Trades',
  'Creative / Design',
  'Technology',
  'Education',
  'Non-profit',
  'Real Estate',
  'Other',
];

const BusinessInfoStep = ({ data, updateData, errors }: StepProps) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Tell Us About Your Business</h2>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="businessName" className="text-foreground">
            Business Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="businessName"
            value={data.businessName}
            onChange={(e) => updateData({ businessName: e.target.value })}
            placeholder="Your Business Name"
            className={errors.businessName ? 'border-destructive' : ''}
          />
          {errors.businessName && (
            <p className="text-sm text-destructive mt-1">{errors.businessName}</p>
          )}
        </div>

        <div>
          <Label htmlFor="businessDescription" className="text-foreground">
            What does your business do? <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="businessDescription"
            value={data.businessDescription}
            onChange={(e) => updateData({ businessDescription: e.target.value })}
            placeholder="Brief description of your products or services"
            rows={4}
            className={errors.businessDescription ? 'border-destructive' : ''}
          />
          {errors.businessDescription && (
            <p className="text-sm text-destructive mt-1">{errors.businessDescription}</p>
          )}
        </div>

        <div>
          <Label htmlFor="industry" className="text-foreground">
            What industry are you in? <span className="text-destructive">*</span>
          </Label>
          <Select
            value={data.industry}
            onValueChange={(value) => updateData({ industry: value })}
          >
            <SelectTrigger className={errors.industry ? 'border-destructive' : ''}>
              <SelectValue placeholder="Select your industry" />
            </SelectTrigger>
            <SelectContent>
              {industries.map((industry) => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.industry && (
            <p className="text-sm text-destructive mt-1">{errors.industry}</p>
          )}
        </div>

        <div>
          <Label className="text-foreground">
            Do you have an existing website? <span className="text-destructive">*</span>
          </Label>
          <RadioGroup
            value={data.hasExistingWebsite === null ? '' : data.hasExistingWebsite ? 'yes' : 'no'}
            onValueChange={(value) => updateData({ hasExistingWebsite: value === 'yes' })}
            className="mt-2 flex gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="existing-yes" />
              <Label htmlFor="existing-yes" className="text-foreground font-normal cursor-pointer">
                Yes
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="existing-no" />
              <Label htmlFor="existing-no" className="text-foreground font-normal cursor-pointer">
                No
              </Label>
            </div>
          </RadioGroup>
          {errors.hasExistingWebsite && (
            <p className="text-sm text-destructive mt-1">{errors.hasExistingWebsite}</p>
          )}
        </div>

        {data.hasExistingWebsite && (
          <div className="animate-fade-in">
            <Label htmlFor="currentWebsiteUrl" className="text-foreground">
              Current Website URL
            </Label>
            <Input
              id="currentWebsiteUrl"
              value={data.currentWebsiteUrl}
              onChange={(e) => updateData({ currentWebsiteUrl: e.target.value })}
              placeholder="www.yoursite.com"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Leave blank if you don't have an existing website
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessInfoStep;
