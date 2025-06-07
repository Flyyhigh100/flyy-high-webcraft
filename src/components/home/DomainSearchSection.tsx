
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { checkDomainAvailability, type DomainCheckResponse } from "@/lib/api-services";

export function DomainSearchSection() {
  const [domain, setDomain] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<DomainCheckResponse | null>(null);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!domain.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter a domain name",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setSearchResult(null);

    try {
      const result = await checkDomainAvailability(domain.trim());
      setSearchResult(result);
      
      if (result.available) {
        toast({
          title: "Great news!",
          description: `${result.domain} is available`,
        });
      }
    } catch (error) {
      console.error('Domain search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to check domain availability. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Find Your Perfect Domain
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Search for available domains and start building your online presence today
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="flex gap-2 mb-6">
            <Input
              type="text"
              placeholder="Enter domain name (e.g., myawesome.com)"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
              disabled={isSearching}
            />
            <Button 
              onClick={handleSearch}
              disabled={isSearching}
              className="px-6"
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </div>

          {searchResult && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {searchResult.available ? (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-500" />
                    )}
                    <div>
                      <h3 className="font-semibold text-lg">{searchResult.domain}</h3>
                      <p className="text-gray-600">{searchResult.message}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {searchResult.available ? (
                      <Badge className="bg-green-100 text-green-800">
                        Available
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        Unavailable
                      </Badge>
                    )}
                    {searchResult.price && (
                      <p className="text-lg font-bold text-primary mt-1">
                        ${searchResult.price}/year
                      </p>
                    )}
                  </div>
                </div>
                {searchResult.available && (
                  <div className="mt-4 pt-4 border-t">
                    <Button className="w-full">
                      Register Domain
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="text-center text-sm text-gray-500">
            <p>Domain availability is checked in real-time. Prices shown are estimates.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
