import { useMarketStore } from '../../stores/marketStore';

export function Market2D() {
  const { filteredVendors, selectedVendorId, selectVendor } = useMarketStore();

  return (
    <div className="bg-gray-50 p-6 min-h-full overflow-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVendors.map((vendor) => (
          <div 
            key={vendor.id}
            onClick={() => selectVendor(vendor.id)}
            className={`
                bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all hover:shadow-lg border-2
                ${selectedVendorId === vendor.id ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-transparent'}
            `}
          >
            <div className={`h-24 ${vendor.profileImage ? 'bg-gray-200' : 'bg-gradient-to-r from-blue-400 to-indigo-500'}`}>
                {vendor.profileImage && (
                    <img src={vendor.profileImage} alt={vendor.storeName} className="w-full h-full object-cover" />
                )}
            </div>
            <div className="p-4">
               <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{vendor.storeName}</h3>
                    <p className="text-sm text-gray-500">{vendor.marketLocation}</p>
                  </div>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Open
                  </span>
               </div>
               
               <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                  {vendor.description || "Welcome to our virtual stall! Browse our fresh selections."}
               </p>
               
               <div className="mt-4 flex flex-wrap gap-1">
                   {vendor.categories.map(c => (
                       <span key={c} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                           {c}
                       </span>
                   ))}
               </div>
               <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-sm text-gray-500">{vendor.productCount} Products</span>
                    <button className="text-indigo-600 text-sm font-medium hover:text-indigo-800">
                        Visit Stall &rarr;
                    </button>
               </div>
            </div>
          </div>
        ))}

        {filteredVendors.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
                No stalls found matching your search.
            </div>
        )}
      </div>
    </div>
  );
}
