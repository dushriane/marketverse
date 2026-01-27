import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useAIStore } from '../stores/aiStore';
import { ProductCategory } from '@marketverse/types';
import { api } from '../lib/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from 'recharts';

interface AnalyticsData {
    products: number;
    sales: number;
    stalls: number;
    salesTrend: { name: string; sales: number }[];
    productViews: { name: string; views: number }[];
}

export function Analytics() {
  const { user } = useAuthStore();
  const { trendingProducts, fetchTrends, isGenerating } = useAIStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('Fruits');
  
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTrends(selectedCategory);
    fetchAnalyticsData();
  }, [selectedCategory, fetchTrends]);

  const fetchAnalyticsData = async () => {
    if (!user) return;
    setLoading(true);
    try {
        const res = await api.get('/admin/analytics');
        setAnalyticsData(res.data);
    } catch (e) {
        console.error("Failed to fetch analytics", e);
    } finally {
        setLoading(false);
    }
  };

  const handleDownload = async (format: 'pdf' | 'csv') => {
      try {
        const response = await api.get(`/admin/reports?format=${format}`, {
            responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `report.${format}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (e) {
          console.error("Download failed", e);
          alert("Download failed. Please try again.");
      }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Analytics & Insights</h1>
        {loading && <span className="text-sm text-gray-500 animate-pulse">Updating...</span>}
        <div className="space-x-4">
            <button 
                onClick={() => handleDownload('csv')}
                className="bg-white text-gray-700 px-4 py-2 border border-gray-300 rounded shadow-sm hover:bg-gray-50 text-sm font-medium"
            >
                Download CSV
            </button>
            <button 
                onClick={() => handleDownload('pdf')}
                className="bg-indigo-600 text-white px-4 py-2 rounded shadow-sm hover:bg-indigo-700 text-sm font-medium"
            >
                Download PDF Report
            </button>
        </div>
      </div>
      
      {/* Key Metrics */}
      {analyticsData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow border-l-4 border-indigo-500">
                  <h3 className="text-gray-500 text-sm font-medium">Total Sales (Items)</h3>
                  <p className="text-3xl font-bold text-gray-900">{analyticsData.sales}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
                  <h3 className="text-gray-500 text-sm font-medium">Active Products</h3>
                  <p className="text-3xl font-bold text-gray-900">{analyticsData.products}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
                  <h3 className="text-gray-500 text-sm font-medium">Stalls Managed</h3>
                  <p className="text-3xl font-bold text-gray-900">{analyticsData.stalls}</p>
              </div>
          </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sales Trend */}
          <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Weekly Sales Trend</h3>
              <div className="h-64">
                {analyticsData?.salesTrend ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={analyticsData.salesTrend}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <RechartsTooltip />
                            <Legend />
                            <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">Loading chart...</div>
                )}
              </div>
          </div>

          {/* Product Views */}
          <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Most Viewed Products</h3>
              <div className="h-64">
                {analyticsData?.productViews ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analyticsData.productViews}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <RechartsTooltip />
                            <Legend />
                            <Bar dataKey="views" fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">Loading chart...</div>
                )}
              </div>
          </div>
      </div>

      {/* AI Trends Section */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-lg shadow border border-indigo-100">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-indigo-900">📈 Market Trends Simulator (AI)</h2>
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

    </div>
  );
}
