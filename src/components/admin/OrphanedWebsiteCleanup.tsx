import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, Search, Info } from 'lucide-react';

export function OrphanedWebsiteCleanup() {
  const [daysThreshold, setDaysThreshold] = useState(30);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const handleScan = async (dryRun: boolean) => {
    setLoading(true);
    setResults(null);

    try {
      const { data, error } = await supabase.functions.invoke('cleanup-orphaned-websites', {
        body: {
          days_threshold: daysThreshold,
          dry_run: dryRun
        }
      });

      if (error) throw error;

      setResults(data);

      toast({
        title: dryRun ? 'Scan Complete' : 'Cleanup Complete',
        description: dryRun 
          ? `Found ${data.found} orphaned websites`
          : `Cleaned up ${data.cleaned} orphaned websites`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orphaned Website Cleanup</CardTitle>
        <CardDescription>
          Find and remove websites that have no associated user (pending invitations that were never accepted)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Orphaned websites are created when invitations are sent but never accepted. Use "Scan" to preview what would be deleted, then "Cleanup" to remove them.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="daysThreshold">Days Old (threshold)</Label>
          <Input
            id="daysThreshold"
            type="number"
            min="1"
            value={daysThreshold}
            onChange={(e) => setDaysThreshold(parseInt(e.target.value) || 30)}
          />
          <p className="text-sm text-muted-foreground">
            Only websites older than this many days will be considered for cleanup
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => handleScan(true)}
            disabled={loading}
            variant="outline"
          >
            <Search className="h-4 w-4 mr-2" />
            Scan (Preview)
          </Button>
          <Button
            onClick={() => handleScan(false)}
            disabled={loading}
            variant="destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Cleanup Now
          </Button>
        </div>

        {results && (
          <div className="mt-4 p-4 border rounded-md">
            <h4 className="font-semibold mb-2">
              {results.dry_run ? 'Scan Results' : 'Cleanup Results'}
            </h4>
            <div className="space-y-2 text-sm">
              <p><strong>Found:</strong> {results.found} websites</p>
              {!results.dry_run && <p><strong>Cleaned:</strong> {results.cleaned} websites</p>}
              
              {results.details && results.details.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium mb-1">Details:</p>
                  <ul className="space-y-1 max-h-64 overflow-y-auto">
                    {results.details.map((detail: any, idx: number) => (
                      <li key={idx} className="p-2 bg-muted rounded text-xs">
                        <div><strong>{detail.name}</strong> ({detail.url})</div>
                        <div className="text-muted-foreground">
                          {detail.status || (detail.would_delete ? 'Would delete' : 'N/A')}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
