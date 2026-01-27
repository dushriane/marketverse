import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useProductStore } from '../stores/productStore';

export function ProductList() {
  const vendor = useAuthStore(state => state.vendor);
  const { products, isLoading, fetchProducts, deleteProduct, bulkUpdateStatus } = useProductStore();

  useEffect(() => {
    if (vendor?.id) {
      fetchProducts(vendor.id);
    }
  }, [vendor, fetchProducts]);

  if (!vendor) return <div>Access Denied</div>;

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
        <div className="space-x-4">
          <Link 
            to="/products/new" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Add Product
          </Link>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <h2 className="text-lg font-medium mb-3">Bulk Actions</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => bulkUpdateStatus(vendor.id!, 'available')}
            className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm hover:bg-green-200"
          >
            Mark All Available
          </button>
          <button
            onClick={() => bulkUpdateStatus(vendor.id!, 'out_of_stock')}
            className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-sm hover:bg-gray-200"
          >
            Mark All Out of Stock
          </button>
        </div>
      </div>

      {isLoading ? (
        <div>Loading products...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No products found. Add your first item!</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div key={product.id} className="border rounded-lg shadow-sm overflow-hidden bg-white">
              <div className="h-48 bg-gray-200 relative">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                )}
                <span className={`absolute top-2 right-2 px-2 py-1 text-xs rounded-full ${
                  product.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {product.status === 'available' ? 'Available' : 'Out of Stock'}
                </span>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-500 capitalize">{product.category}</p>
                  </div>
                  <p className="text-lg font-bold text-gray-900">RWF {product.price.toLocaleString()}</p>
                </div>
                <p className="mt-2 text-sm text-gray-600 line-clamp-2">{product.description}</p>
                
                <div className="mt-4 flex justify-between items-center border-t pt-2">
                  <div className="text-xs text-gray-500">
                    {product.isNegotiable ? 'Negotiable' : 'Fixed Price'}
                  </div>
                  <div className="space-x-2">
                    <Link to={`/products/${product.id}/edit`} className="text-indigo-600 hover:text-indigo-900 text-sm">Edit</Link>
                    <button 
                      onClick={() => { if(confirm('Delete product?')) deleteProduct(product.id!, vendor.id!); }}
                      className="text-red-600 hover:text-red-900 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
