import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useOrderStore } from '../stores/orderStore';
import { useAIStore } from '../stores/aiStore';
import { ProductCategory } from '@marketverse/types';

export function Analytics() {
  const vendor = useAuthStore(state => state.vendor);
  const { analytics, fetchAnalytics } = useOrderStore();
  const { trendingProducts, fetchTrends, isGenerating } = useAIStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('Fruits');

  useEffect(() => {
    if (vendor?.id) fetchAnalytics(vendor.id);
  }, [vendor, fetchAnalytics]);

  useEffect(() => {
    fetchTrends(selectedCategory);
  }, [selectedCategory, fetchTrends]);

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 space-y-6">
      <h1 className="text-2xl font-bold">Analytics & Insights</h1>
      
      {/* Trends Section */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-lg shadow border border-indigo-100">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-indigo-900">📈 Market Trends Simulator</h2>
            <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
                {Object.values(ProductCategory.enum).map(c => (
                    <option key={c} value={c}>{c}</option>
                ))}
            </select>
        </div>
        
        {isGenerating ? (
            <div className="text-sm text-gray-500 animate-pulse">Analyzing market data...</div>
        ) : (
            <div>
                <p className="text-sm text-gray-600 mb-3">Top selling items in <strong>{selectedCategory}</strong> right now:</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {trendingProducts.map((product, idx) => (
                        <div key={idx} className="bg-white p-3 rounded shadow-sm text-center border border-indigo-100">
                            <span className="text-2xl block mb-1">🔥</span>
                            <span className="text-sm font-medium text-gray-800">{product}</span>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>

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
