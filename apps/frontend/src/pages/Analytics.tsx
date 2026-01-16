import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useOrderStore } from '../stores/orderStore';

export function Analytics() {
  const vendor = useAuthStore(state => state.vendor);
  const { analytics, fetchAnalytics } = useOrderStore();

  useEffect(() => {
    if (vendor?.id) fetchAnalytics(vendor.id);
  }, [vendor, fetchAnalytics]);

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Most Viewed Products</h2>
        {analytics.length === 0 ? (
            <p className="text-gray-500">No data available yet.</p>
        ) : (
          <div className="space-y-4">
            {analytics.map((item, index) => (
              <div key={index} className="flex items-center">
                <span className="w-8 text-gray-500 font-bold">#{index + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-sm text-gray-600">{item.views} views</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-indigo-600 h-2.5 rounded-full" 
                      style={{ width: `${(item.views / Math.max(...analytics.map(a => a.views))) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
