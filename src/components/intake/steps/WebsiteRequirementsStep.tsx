import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { StepProps } from '../types';

const websiteTypes = [
  'Informational / Brochure site',
  'E-commerce / Online store',
  'Portfolio / Showcase',
  'Blog',
  'Booking / Appointment scheduling',
  'Membership / Login area',
  'Landing page (single page)',
  'Other',
];

const features = [
  'Contact form',
  'Photo gallery',
  'Blog / News section',
  'Online booking / Scheduling',
  'E-commerce / Shopping cart',
  'Payment processing',
  'Email newsletter signup',
  'Social media integration',
  'Live chat',
  'Customer login / Member area',
  'Video embedding',
  'Maps / Location',
  'Testimonials / Reviews section',
  'FAQ section',
  'Search functionality',
  'Multi-language support',
  'Other',
];

const newOrRedesignOptions = [
  { value: 'new', label: 'Brand new website' },
  { value: 'redesign', label: 'Redesign of existing website' },
];

const pagesOptions = [
  { value: '1-5', label: '1-5 pages' },
  { value: '6-10', label: '6-10 pages' },
  { value: '11-20', label: '11-20 pages' },
  { value: '20+', label: '20+ pages' },
  { value: 'not_sure', label: 'Not sure' },
];

const contentReadyOptions = [
  { value: 'yes_ready', label: 'Yes, all content is written and ready' },
  { value: 'some_need_help', label: 'I have some content but need help with the rest' },
  { value: 'need_copywriting', label: 'No, I need copywriting assistance' },
  { value: 'discuss', label: "I'd like to discuss content options" },
];

const contentUpdatesOptions = [
  { value: 'yes_easy', label: 'Yes, I want to be able to make updates easily' },
  { value: 'occasionally', label: 'Occasionally, for minor changes' },
  { value: 'prefer_you', label: "No, I'd prefer you handle all updates" },
  { value: 'not_sure', label: 'Not sure' },
];

const WebsiteRequirementsStep = ({ data, updateData, errors }: StepProps) => {
  const toggleWebsiteType = (type: string) => {
    const current = data.websiteTypes;
    const updated = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    updateData({ websiteTypes: updated });
  };

  const toggleFeature = (feature: string) => {
    const current = data.requiredFeatures;
    const updated = current.includes(feature)
      ? current.filter((f) => f !== feature)
      : [...current, feature];
    updateData({ requiredFeatures: updated });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Website Requirements</h2>
        <p className="text-muted-foreground mt-1">
          Tell us what you need your website to do.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-foreground">
            What type of website do you need? <span className="text-destructive">*</span>
          </Label>
          <p className="text-xs text-muted-foreground mb-2">Select all that apply</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            {websiteTypes.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={`type-${type}`}
                  checked={data.websiteTypes.includes(type)}
                  onCheckedChange={() => toggleWebsiteType(type)}
                />
                <Label
                  htmlFor={`type-${type}`}
                  className="text-foreground font-normal cursor-pointer text-sm"
                >
                  {type}
                </Label>
              </div>
            ))}
          </div>
          {errors.websiteTypes && (
            <p className="text-sm text-destructive mt-1">{errors.websiteTypes}</p>
          )}
        </div>

        <div>
          <Label className="text-foreground">
            Is this a new website or a redesign? <span className="text-destructive">*</span>
          </Label>
          <RadioGroup
            value={data.isNewOrRedesign}
            onValueChange={(value) => updateData({ isNewOrRedesign: value })}
            className="mt-2 space-y-2"
          >
            {newOrRedesignOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`newredesign-${option.value}`} />
                <Label
                  htmlFor={`newredesign-${option.value}`}
                  className="text-foreground font-normal cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {errors.isNewOrRedesign && (
            <p className="text-sm text-destructive mt-1">{errors.isNewOrRedesign}</p>
          )}
        </div>

        <div>
          <Label className="text-foreground">
            Approximately how many pages do you think you'll need? <span className="text-destructive">*</span>
          </Label>
          <RadioGroup
            value={data.estimatedPages}
            onValueChange={(value) => updateData({ estimatedPages: value })}
            className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2"
          >
            {pagesOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`pages-${option.value}`} />
                <Label
                  htmlFor={`pages-${option.value}`}
                  className="text-foreground font-normal cursor-pointer text-sm"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {errors.estimatedPages && (
            <p className="text-sm text-destructive mt-1">{errors.estimatedPages}</p>
          )}
        </div>

        <div>
          <Label className="text-foreground">
            What features do you need? <span className="text-destructive">*</span>
          </Label>
          <p className="text-xs text-muted-foreground mb-2">Select all that apply</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            {features.map((feature) => (
              <div key={feature} className="flex items-center space-x-2">
                <Checkbox
                  id={`feature-${feature}`}
                  checked={data.requiredFeatures.includes(feature)}
                  onCheckedChange={() => toggleFeature(feature)}
                />
                <Label
                  htmlFor={`feature-${feature}`}
                  className="text-foreground font-normal cursor-pointer text-sm"
                >
                  {feature}
                </Label>
              </div>
            ))}
          </div>
          {errors.requiredFeatures && (
            <p className="text-sm text-destructive mt-1">{errors.requiredFeatures}</p>
          )}
        </div>

        <div>
          <Label className="text-foreground">
            Do you have the written content ready for your website? <span className="text-destructive">*</span>
          </Label>
          <RadioGroup
            value={data.hasContentReady}
            onValueChange={(value) => updateData({ hasContentReady: value })}
            className="mt-2 space-y-2"
          >
            {contentReadyOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`content-${option.value}`} />
                <Label
                  htmlFor={`content-${option.value}`}
                  className="text-foreground font-normal cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {errors.hasContentReady && (
            <p className="text-sm text-destructive mt-1">{errors.hasContentReady}</p>
          )}
        </div>

        <div>
          <Label className="text-foreground">
            Will you need to update the website content yourself after it's built? <span className="text-destructive">*</span>
          </Label>
          <RadioGroup
            value={data.needsContentUpdates}
            onValueChange={(value) => updateData({ needsContentUpdates: value })}
            className="mt-2 space-y-2"
          >
            {contentUpdatesOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`updates-${option.value}`} />
                <Label
                  htmlFor={`updates-${option.value}`}
                  className="text-foreground font-normal cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {errors.needsContentUpdates && (
            <p className="text-sm text-destructive mt-1">{errors.needsContentUpdates}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WebsiteRequirementsStep;
