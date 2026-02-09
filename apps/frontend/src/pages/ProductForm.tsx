import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProductSchema, Product, ProductCategory } from '@marketverse/types';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useProductStore } from '../stores/productStore';
import { useAIStore } from '../stores/aiStore';
import { api } from '../lib/api';

const categories = Object.values(ProductCategory.enum);

export function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  // Ensure we consistently use user.id. We cast to any if the type definition is lagging behind the backend data
  const vendorId = (user as any)?.id; 
  const { products, createProduct, updateProduct } = useProductStore();
  const { suggestedCategories, suggestCategories, isGenerating: isAiGenerating } = useAIStore();
  
  const isEdit = Boolean(id);
  const existingProduct = products.find(p => p.id === id);

  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<Product>({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      vendorId: vendorId, // Use the derived vendorId
      isNegotiable: false,
      status: 'available',
      price: 0
    }
  });

  useEffect(() => {
    if (isEdit && existingProduct) {
      reset(existingProduct);
      setPreviewImage(existingProduct.imageUrl || null);
    } else if (vendorId) {
       setValue('vendorId', vendorId);
    }
  }, [isEdit, existingProduct, reset, vendorId, setValue]);

  const onFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'imageUrl' | 'meshUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);

    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const url = res.data.url;
      setValue(field, url);
      if (field === 'imageUrl') setPreviewImage(url);
    } catch (err) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const generateDescription = async () => {
    const productName = watch('name');
    const category = watch('category');
    
    if (!productName) return alert('Please enter a Product Name first');

    setGenerating(true);
    try {
      const res = await api.post('/ai/generate-description', {
        productName,
        category
      });
      setValue('description', res.data.description);
    } catch (err) {
      alert('AI Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleSuggestCategory = async () => {
    const name = watch('name');
    const desc = watch('description') || '';
    if (!name) return alert('Enter a product name first');
    await suggestCategories(name, desc);
  };

  const onSubmit = async (data: Product) => {
    try {
      if (isEdit) {
        await updateProduct({ ...data, id });
      } else {
        await createProduct(data);
      }
      navigate('/products');
    } catch (err) {
      console.error(err);
      alert('Save failed');
    }
  };

  if (!vendorId) return <div>Access Denied: No Vendor ID found.</div>;

  return (
    <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 shadow rounded-lg">
        {/* ...existing code... (rest of the render function remains the same) */}
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Product Photo</label>
          <div className="mt-1 flex items-center space-x-4">
            <div className="h-32 w-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
              {previewImage ? (
                <img src={previewImage} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <span className="text-gray-400 text-xs">No image</span>
              )}
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => onFileUpload(e, 'imageUrl')}
                disabled={uploading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              {uploading && <p className="text-xs text-indigo-600 mt-1">Uploading...</p>}
            </div>
          </div>
          <input type="hidden" {...register('imageUrl')} />
          {errors.imageUrl && <p className="text-red-500 text-sm mt-1">Image is required</p>}
        </div>

        {/* 3D Model Upload (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">3D Model (.glb, .gltf)</label>
          <input
              type="file"
              accept=".glb,.gltf"
              onChange={(e) => onFileUpload(e, 'meshUrl')}
              disabled={uploading}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <input type="hidden" {...register('meshUrl')} />
          <p className="text-xs text-gray-500 mt-1">Optional. Allows users to view your product in 3D space.</p>
        </div>

        {/* AI Generation */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={generateDescription}
            disabled={generating || !watch('name')}
            className="inline-flex items-center px-4 py-2 border border-purple-500 shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
             <svg className={`-ml-1 mr-2 h-5 w-5 ${generating ? 'animate-spin' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
             </svg>
            {generating ? 'Gemini Generating...' : 'Generate Description with AI'}
          </button>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Product Name</label>
          <input
            {...register('name')}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <div className="flex gap-2">
            <select
              {...register('category')}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <button
                type="button"
                onClick={handleSuggestCategory}
                disabled={isAiGenerating}
                className="mt-1 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
                {isAiGenerating ? '...' : '🤖 Suggest'}
            </button>
          </div>
          {suggestedCategories.length > 0 && (
              <div className="mt-2 text-xs text-gray-500">
                  Did you mean: {suggestedCategories.map(c => (
                      <button 
                        key={c} 
                        type="button"
                        onClick={() => setValue('category', c as any)}
                        className="text-indigo-600 hover:text-indigo-800 underline ml-1"
                      >
                         {c}
                      </button>
                  ))}?
              </div>
          )}
          {errors.category && <p className="text-red-500 text-sm">{errors.category.message}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            {...register('description')}
            rows={4}
             className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            placeholder="Describe your product..."
          />
        </div>

        {/* Price & Negotiability */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Price ($)</label>
            <input
              type="number"
              step="0.01"
              {...register('price', { valueAsNumber: true })}
               className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
            {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
          </div>
          <div className="flex items-center mt-6">
            <input
              type="checkbox"
              {...register('isNegotiable')}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">Price Negotiable</label>
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Availability</label>
          <select
            {...register('status')}
             className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          >
            <option value="available">Available Today</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Save Product
          </button>
        </div>
      </form>
    </div>
  );
}