import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { StepProps } from '../types';

const logoOptions = [
  { value: 'yes_files', label: 'Yes, and I have the original files (AI, EPS, PNG, etc.)' },
  { value: 'yes_low_quality', label: 'Yes, but I only have low-quality images' },
  { value: 'need_designed', label: 'No, I need a logo designed' },
  { value: 'dont_need', label: "No, but I don't need one" },
];

const colorPaletteOptions = [
  { value: 'yes_specific', label: 'Yes, I have specific brand colors' },
  { value: 'some_ideas', label: 'I have some colors in mind but nothing finalized' },
  { value: 'need_help', label: 'No, I need help choosing colors' },
];

const brandGuidelinesOptions = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'not_sure', label: 'Not sure what this is' },
];

const photosOptions = [
  { value: 'yes_ready', label: 'Yes, I have professional photos ready to use' },
  { value: 'some_need_more', label: 'I have some photos but may need more' },
  { value: 'need_guidance', label: 'No, I need guidance on images/photography' },
  { value: 'use_stock', label: "I'm happy to use stock images" },
];

const BrandingAssetsStep = ({ data, updateData, errors }: StepProps) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Branding & Design Assets</h2>
        <p className="text-muted-foreground mt-1">
          Help us understand what brand materials you already have.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-foreground">
            Do you have a logo? <span className="text-destructive">*</span>
          </Label>
          <RadioGroup
            value={data.hasLogo}
            onValueChange={(value) => updateData({ hasLogo: value })}
            className="mt-2 space-y-2"
          >
            {logoOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`logo-${option.value}`} />
                <Label
                  htmlFor={`logo-${option.value}`}
                  className="text-foreground font-normal cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {errors.hasLogo && (
            <p className="text-sm text-destructive mt-1">{errors.hasLogo}</p>
          )}
        </div>

        <div>
          <Label className="text-foreground">
            Do you have an established color palette for your brand? <span className="text-destructive">*</span>
          </Label>
          <RadioGroup
            value={data.hasColorPalette}
            onValueChange={(value) => updateData({ hasColorPalette: value })}
            className="mt-2 space-y-2"
          >
            {colorPaletteOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`colors-${option.value}`} />
                <Label
                  htmlFor={`colors-${option.value}`}
                  className="text-foreground font-normal cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {errors.hasColorPalette && (
            <p className="text-sm text-destructive mt-1">{errors.hasColorPalette}</p>
          )}
        </div>

        {data.hasColorPalette === 'yes_specific' && (
          <div className="animate-fade-in">
            <Label htmlFor="brandColors" className="text-foreground">
              Please list your brand colors
            </Label>
            <Input
              id="brandColors"
              value={data.brandColors}
              onChange={(e) => updateData({ brandColors: e.target.value })}
              placeholder="E.g., hex codes (#FF5733) or color names"
            />
          </div>
        )}

        <div>
          <Label className="text-foreground">
            Do you have brand guidelines or a style guide? <span className="text-destructive">*</span>
          </Label>
          <RadioGroup
            value={data.hasBrandGuidelines}
            onValueChange={(value) => updateData({ hasBrandGuidelines: value })}
            className="mt-2 space-y-2"
          >
            {brandGuidelinesOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`guidelines-${option.value}`} />
                <Label
                  htmlFor={`guidelines-${option.value}`}
                  className="text-foreground font-normal cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {errors.hasBrandGuidelines && (
            <p className="text-sm text-destructive mt-1">{errors.hasBrandGuidelines}</p>
          )}
        </div>

        <div>
          <Label className="text-foreground">
            Do you have professional photos or images for your website? <span className="text-destructive">*</span>
          </Label>
          <RadioGroup
            value={data.hasProfessionalPhotos}
            onValueChange={(value) => updateData({ hasProfessionalPhotos: value })}
            className="mt-2 space-y-2"
          >
            {photosOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`photos-${option.value}`} />
                <Label
                  htmlFor={`photos-${option.value}`}
                  className="text-foreground font-normal cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {errors.hasProfessionalPhotos && (
            <p className="text-sm text-destructive mt-1">{errors.hasProfessionalPhotos}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrandingAssetsStep;
