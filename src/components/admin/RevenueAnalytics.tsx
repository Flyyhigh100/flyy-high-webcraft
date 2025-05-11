
import { Card, CardContent } from "@/components/ui/card";
import { Line } from "react-chartjs-2";
import { Payment, RevenueData } from "@/types/admin";
import { useEffect, useState } from "react";

interface RevenueAnalyticsProps {
  payments: Payment[];
}

export function RevenueAnalytics({ payments }: RevenueAnalyticsProps) {
  // Revenue chart data
  const initialRevenueData: RevenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Monthly Revenue',
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        tension: 0.3,
      },
    ],
  };

  const [revenueData, setRevenueData] = useState<RevenueData>(initialRevenueData);
  const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
  
  useEffect(() => {
    // Calculate revenue data
    if (payments.length > 0) {
      const monthlyRevenue = Array(12).fill(0);
      
      payments.forEach((payment: Payment) => {
        const date = new Date(payment.payment_date);
        const month = date.getMonth();
        monthlyRevenue[month] += payment.amount;
      });
      
      setRevenueData({
        ...initialRevenueData,
        datasets: [{
          ...initialRevenueData.datasets[0],
          data: monthlyRevenue
        }]
      });
    }
  }, [payments]);

  return (
    <>
      <div className="h-80">
        <Line 
          data={revenueData} 
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: (value) => `$${value}`
                }
              }
            },
            plugins: {
              tooltip: {
                callbacks: {
                  label: function(context) {
                    return `Revenue: $${context.parsed.y}`;
                  }
                }
              }
            }
          }}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-500">Monthly Average</h3>
              <p className="text-3xl font-bold text-primary mt-2">
                ${(totalRevenue / 12).toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-500">Recurring Revenue</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">
                ${totalRevenue.toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-500">Growth Rate</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {payments.length > 0 ? '+15.7%' : '0%'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
