import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { StepProps } from '../types';

const designStyles = [
  'Modern / Contemporary',
  'Classic / Traditional',
  'Minimalist / Clean',
  'Bold / Vibrant',
  'Professional / Corporate',
  'Friendly / Approachable',
  'Elegant / Luxurious',
  'Playful / Fun',
  'Other',
];

const DesignPreferencesStep = ({ data, updateData, errors }: StepProps) => {
  const toggleStyle = (style: string) => {
    const current = data.designStyles;
    const updated = current.includes(style)
      ? current.filter((s) => s !== style)
      : [...current, style];
    updateData({ designStyles: updated });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Design Preferences</h2>
        <p className="text-muted-foreground mt-1">
          Help us understand your visual style.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-foreground">
            How would you describe your desired style? <span className="text-destructive">*</span>
          </Label>
          <p className="text-xs text-muted-foreground mb-2">Select all that apply</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            {designStyles.map((style) => (
              <div key={style} className="flex items-center space-x-2">
                <Checkbox
                  id={`style-${style}`}
                  checked={data.designStyles.includes(style)}
                  onCheckedChange={() => toggleStyle(style)}
                />
                <Label
                  htmlFor={`style-${style}`}
                  className="text-foreground font-normal cursor-pointer"
                >
                  {style}
                </Label>
              </div>
            ))}
          </div>
          {errors.designStyles && (
            <p className="text-sm text-destructive mt-1">{errors.designStyles}</p>
          )}
        </div>

        <div>
          <Label htmlFor="referenceWebsites" className="text-foreground">
            Please share 2-3 websites you like
          </Label>
          <Textarea
            id="referenceWebsites"
            value={data.referenceWebsites}
            onChange={(e) => updateData({ referenceWebsites: e.target.value })}
            placeholder="Include URLs and what you like about them (design, layout, features, etc.)"
            rows={4}
          />
        </div>

        <div>
          <Label htmlFor="designDislikes" className="text-foreground">
            Is there anything you definitely DON'T want on your website?
          </Label>
          <Textarea
            id="designDislikes"
            value={data.designDislikes}
            onChange={(e) => updateData({ designDislikes: e.target.value })}
            placeholder="Tell us about design elements, colors, or features you want to avoid"
            rows={3}
          />
        </div>
      </div>
    </div>
  );
};

export default DesignPreferencesStep;
