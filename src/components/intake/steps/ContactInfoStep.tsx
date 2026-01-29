import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { StepProps } from '../types';

const ContactInfoStep = ({ data, updateData, errors }: StepProps) => {
  const contactMethods = [
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Contact Information</h2>
        <p className="text-muted-foreground mt-1">
          Let's start with your basic details so we can get in touch.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="fullName" className="text-foreground">
            Full Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="fullName"
            value={data.fullName}
            onChange={(e) => updateData({ fullName: e.target.value })}
            placeholder="John Smith"
            className={errors.fullName ? 'border-destructive' : ''}
          />
          {errors.fullName && (
            <p className="text-sm text-destructive mt-1">{errors.fullName}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email" className="text-foreground">
            Email Address <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => updateData({ email: e.target.value })}
            placeholder="john@example.com"
            className={errors.email ? 'border-destructive' : ''}
          />
          {errors.email && (
            <p className="text-sm text-destructive mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <Label htmlFor="phone" className="text-foreground">
            Phone Number
          </Label>
          <Input
            id="phone"
            type="tel"
            value={data.phone}
            onChange={(e) => updateData({ phone: e.target.value })}
            placeholder="(555) 123-4567"
          />
        </div>

        <div>
          <Label className="text-foreground">
            Preferred Method of Contact <span className="text-destructive">*</span>
          </Label>
          <RadioGroup
            value={data.preferredContactMethod}
            onValueChange={(value) => updateData({ preferredContactMethod: value })}
            className="mt-2 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap"
          >
            {contactMethods.map((method) => (
              <div key={method.value} className="flex items-center space-x-2">
                <RadioGroupItem value={method.value} id={`contact-${method.value}`} />
                <Label
                  htmlFor={`contact-${method.value}`}
                  className="text-foreground font-normal cursor-pointer"
                >
                  {method.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {errors.preferredContactMethod && (
            <p className="text-sm text-destructive mt-1">{errors.preferredContactMethod}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactInfoStep;
