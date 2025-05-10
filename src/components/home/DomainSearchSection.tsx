
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Check, X } from "lucide-react";

// Domain TLD options with their yearly prices
const domainTLDs = [
  { extension: ".com", price: 12.99 },
  { extension: ".net", price: 11.99 },
  { extension: ".co", price: 19.99 },
  { extension: ".io", price: 39.99 },
  { extension: ".dev", price: 14.99 },
];

const DomainSearchSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ name: string; extension: string; price: number; available: boolean }[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Function to handle domain search
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    setHasSearched(true);
    
    // Mock domain search results
    // In a real implementation, this would call an API
    const results = domainTLDs.map((tld) => {
      // Simulate random availability (in real app, this would be API response)
      const available = Math.random() > 0.3; // 70% chance of domain being available
      return {
        name: searchQuery.trim().toLowerCase(),
        extension: tld.extension,
        price: tld.price,
        available,
      };
    });
    
    setSearchResults(results);
  };

  return (
    <section className="section bg-secondary/30 py-16 md:py-24">
      <div className="container mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Find Your Perfect Domain Name
          </h2>
          <p className="text-gray-700 text-lg">
            Secure your online identity with a domain name that represents your brand.
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <Input
              type="text"
              placeholder="Search for your domain (e.g. yourbrand.com)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-grow text-lg py-6 px-6 h-auto shadow-sm"
            />
            <Button 
              onClick={handleSearch}
              className="bg-accent hover:bg-accent/90 text-white transition-all h-auto py-6 px-8 font-medium text-lg shadow-sm"
            >
              <Search className="mr-2 h-5 w-5" />
              Search Domain
            </Button>
          </div>

          {hasSearched && (
            <div className="mt-10 animate-fadeIn">
              <h3 className="text-xl font-semibold mb-4">Domain Availability</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map((result) => (
                  <Card 
                    key={result.name + result.extension}
                    className={`overflow-hidden transition-all duration-300 hover:shadow-lg border ${
                      result.available ? "border-green-100" : "border-gray-100"
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-lg">{result.name}{result.extension}</h4>
                        <span 
                          className={`text-sm px-3 py-1 rounded-full flex items-center ${
                            result.available 
                              ? "bg-green-100 text-green-700" 
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {result.available ? (
                            <>
                              <Check className="w-4 h-4 mr-1" /> 
                              Available
                            </>
                          ) : (
                            <>
                              <X className="w-4 h-4 mr-1" /> 
                              Unavailable
                            </>
                          )}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <p className="text-md text-gray-600">${result.price}/year</p>
                        {result.available && (
                          <p className="text-sm text-green-700 font-medium">
                            Included with hosting
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="mt-6 text-center space-y-4">
                <p className="text-gray-700">
                  We'll register this domain for you as part of your hosting – no extra work needed.
                </p>
                <p className="text-gray-500 text-sm">
                  Domain registration is included free with yearly hosting plans. We'll take care of everything.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default DomainSearchSection;
