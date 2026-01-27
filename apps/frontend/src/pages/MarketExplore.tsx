import { useEffect } from 'react';
import { useMarketStore } from '../stores/marketStore';
import { Market3D } from '../components/market/Market3D';
import { Market2D } from '../components/market/Market2D';
import { ProductCategory } from '@marketverse/types';

export function MarketExplore() {
  const { 
    viewMode, setViewMode, 
    fetchMarketData, isLoading, 
    searchQuery, setSearchQuery,
    selectedCategory, setCategory,
    selectedVendorId, selectVendor
  } = useMarketStore();
  
  useEffect(() => {
    fetchMarketData();
  }, [fetchMarketData]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden relative">
      {/* Top Bar Overlay */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 pointer-events-none">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between pointer-events-auto bg-white/90 backdrop-blur-md p-3 rounded-lg shadow-lg border border-gray-200">
          
          <div className="flex items-center gap-4">
             <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                MarketVerse Virtual
             </h1>
             
             <div className="flex bg-gray-100 p-1 rounded-md">
                <button
                    onClick={() => setViewMode('3D')}
                    className={`px-3 py-1 text-sm rounded transition-all ${viewMode === '3D' ? 'bg-white shadow text-indigo-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    3D View
                </button>
                <button
                    onClick={() => setViewMode('2D')}
                    className={`px-3 py-1 text-sm rounded transition-all ${viewMode === '2D' ? 'bg-white shadow text-indigo-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    2D List
                </button>
             </div>
          </div>

          <div className="flex gap-2 flex-1 w-full md:w-auto">
             <input
                type="text"
                placeholder="Search stalls or products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 border-gray-300 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500"
             />
             <select
                value={selectedCategory}
                onChange={(e) => setCategory(e.target.value)}
                className="border-gray-300 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500"
             >
                <option value="All">All Categories</option>
                {Object.values(ProductCategory.enum).map(c => (
                    <option key={c} value={c}>{c}</option>
                ))}
             </select>
          </div>
          
          <a href="/" className="text-sm font-medium text-gray-500 hover:text-indigo-600">
            Vendor Login
          </a>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative bg-gray-50">
          {isLoading ? (
             <div className="absolute inset-0 flex items-center justify-center bg-white z-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <span className="ml-3 text-gray-500">Loading Market...</span>
             </div>
          ) : viewMode === '3D' ? (
              <Market3D />
          ) : (
              <div className="pt-24 h-full">
                  <Market2D />
              </div>
          )}
      </div>
      
      {/* Selected Stall Sidebar/Modal */}
      {selectedVendorId && (
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-20 p-6 transform transition-transform overflow-y-auto pt-24 border-l border-gray-200">
             <button 
                onClick={() => selectVendor(null)}
                className="absolute top-24 right-4 text-gray-400 hover:text-gray-600"
             >
                ✕
             </button>
             {/* We fetch the full details from the store's vendors list */}
             {(() => {
                 const vendor = useMarketStore.getState().vendors.find(v => v.id === selectedVendorId);
                 if (!vendor) return <div>Stall not found</div>;
                 return (
                     <div className="space-y-4">
                         <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                             {vendor.profileImage ? (
                                 <img src={vendor.profileImage} className="w-full h-full object-cover" />
                             ) : (
                                 <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                             )}
                         </div>
                         <div>
                            <h2 className="text-2xl font-bold text-gray-900">{vendor.storeName}</h2>
                            <p className="text-sm text-gray-500 flex items-center mt-1">
                                📍 {vendor.marketLocation}
                            </p>
                         </div>
                         <div className="border-t pt-4">
                            <p className="text-gray-600 text-sm">
                                {vendor.description || "No description provided."}
                            </p>
                         </div>
                         <div>
                             <h4 className="font-semibold mb-2 text-sm uppercase tracking-wider text-gray-500">Categories</h4>
                             <div className="flex flex-wrap gap-1">
                                {vendor.categories.map(c => (
                                    <span key={c} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded border border-indigo-100">
                                        {c}
                                    </span>
                                ))}
                             </div>
                         </div>
                         <div className="pt-4 mt-auto">
                            <button className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition shadow-sm">
                                View Products ({vendor.productCount})
                            </button>
                            {/* In a real app, this would show product list to add to cart */}
                         </div>
                     </div>
                 );
             })()}
        </div>
      )}

    </div>
  );
}
