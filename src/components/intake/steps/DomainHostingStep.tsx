import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { StepProps } from '../types';

const domainOptions = [
  { value: 'yes', label: 'Yes' },
  { value: 'need_purchase', label: 'No, I need to purchase one' },
  { value: 'chosen_not_registered', label: "No, but I've already chosen one I want to register" },
  { value: 'not_sure', label: "I'm not sure what a domain is" },
];

const registrarAccessOptions = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'not_sure', label: 'Not sure' },
  { value: 'na', label: "N/A - I don't have a domain yet" },
];

const hostingOptions = [
  { value: 'yes_transition', label: 'Yes (we will help transition to our hosting)' },
  { value: 'need_setup', label: 'No, I need hosting set up' },
  { value: 'not_sure', label: "I'm not sure what hosting is" },
];

const ongoingHostingOptions = [
  { value: 'yes_managed', label: 'Yes, I want a fully managed solution' },
  { value: 'no_self_manage', label: 'No, I prefer to manage it myself' },
  { value: 'discuss', label: 'What are my options?' },
];

const DomainHostingStep = ({ data, updateData, errors }: StepProps) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Domain & Hosting</h2>
        <p className="text-muted-foreground mt-1">
          Let's find out about your technical setup.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-foreground">
            Do you already own a domain name? <span className="text-destructive">*</span>
          </Label>
          <p className="text-xs text-muted-foreground mb-2">
            A domain is your website address, like www.yourbusiness.com
          </p>
          <RadioGroup
            value={data.ownsDomain}
            onValueChange={(value) => updateData({ ownsDomain: value })}
            className="mt-2 space-y-2"
          >
            {domainOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`domain-${option.value}`} />
                <Label
                  htmlFor={`domain-${option.value}`}
                  className="text-foreground font-normal cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {errors.ownsDomain && (
            <p className="text-sm text-destructive mt-1">{errors.ownsDomain}</p>
          )}
        </div>

        {data.ownsDomain === 'yes' && (
          <div className="animate-fade-in">
            <Label htmlFor="domainName" className="text-foreground">
              What is your domain name?
            </Label>
            <Input
              id="domainName"
              value={data.domainName}
              onChange={(e) => updateData({ domainName: e.target.value })}
              placeholder="E.g., www.yourbusiness.com"
            />
          </div>
        )}

        <div>
          <Label className="text-foreground">
            Do you have access to your domain registrar account? <span className="text-destructive">*</span>
          </Label>
          <p className="text-xs text-muted-foreground mb-2">
            This is where you purchased your domain (e.g., GoDaddy, Namecheap, Google Domains)
          </p>
          <RadioGroup
            value={data.hasDomainRegistrarAccess}
            onValueChange={(value) => updateData({ hasDomainRegistrarAccess: value })}
            className="mt-2 space-y-2"
          >
            {registrarAccessOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`registrar-${option.value}`} />
                <Label
                  htmlFor={`registrar-${option.value}`}
                  className="text-foreground font-normal cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {errors.hasDomainRegistrarAccess && (
            <p className="text-sm text-destructive mt-1">{errors.hasDomainRegistrarAccess}</p>
          )}
        </div>

        <div>
          <Label className="text-foreground">
            Do you currently have web hosting? <span className="text-destructive">*</span>
          </Label>
          <p className="text-xs text-muted-foreground mb-2">
            All projects are hosted on our platform for optimal performance and support
          </p>
          <RadioGroup
            value={data.hasHosting}
            onValueChange={(value) => updateData({ hasHosting: value })}
            className="mt-2 space-y-2"
          >
            {hostingOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`hosting-${option.value}`} />
                <Label
                  htmlFor={`hosting-${option.value}`}
                  className="text-foreground font-normal cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {errors.hasHosting && (
            <p className="text-sm text-destructive mt-1">{errors.hasHosting}</p>
          )}
        </div>

        <div>
          <Label className="text-foreground">
            Do you need ongoing website maintenance? <span className="text-destructive">*</span>
          </Label>
          <RadioGroup
            value={data.needsOngoingHosting}
            onValueChange={(value) => updateData({ needsOngoingHosting: value })}
            className="mt-2 space-y-2"
          >
            {ongoingHostingOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`ongoing-${option.value}`} />
                <Label
                  htmlFor={`ongoing-${option.value}`}
                  className="text-foreground font-normal cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {errors.needsOngoingHosting && (
            <p className="text-sm text-destructive mt-1">{errors.needsOngoingHosting}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DomainHostingStep;
