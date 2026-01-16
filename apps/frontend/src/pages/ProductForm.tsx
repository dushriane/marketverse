import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProductSchema, Product, ProductCategory } from '@marketverse/types';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useProductStore } from '../stores/productStore';
import { api } from '../lib/api';

const categories = Object.values(ProductCategory.enum);

export function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const vendor = useAuthStore(state => state.vendor);
  const { products, createProduct, updateProduct } = useProductStore();
  
  const isEdit = Boolean(id);
  const existingProduct = products.find(p => p.id === id);

  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<Product>({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      vendorId: vendor?.id,
      isNegotiable: false,
      status: 'available',
      price: 0 // Initialize price
    }
  });

  useEffect(() => {
    if (isEdit && existingProduct) {
      reset(existingProduct);
      setPreviewImage(existingProduct.imageUrl || null);
    } else if (vendor?.id) {
       setValue('vendorId', vendor.id); // Ensure vendorId is set for new products
    }
  }, [isEdit, existingProduct, reset, vendor, setValue]);

  const onImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);

    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const url = res.data.url;
      setValue('imageUrl', url);
      setPreviewImage(url);
    } catch (err) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const generateDescription = async () => {
    const imageUrl = watch('imageUrl');
    const category = watch('category');
    if (!imageUrl) return alert('Please upload an image first');

    setGenerating(true);
    try {
      const res = await api.post('/ai/generate-description', {
        imageBase64: imageUrl, // In this mock, the URL is a data URI so it works directly
        category
      });
      setValue('description', res.data.description);
    } catch (err) {
      alert('AI Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const onSubmit = async (data: Product) => {
    try {
      if (isEdit) {
         // Ensure we pass the ID for updates
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

  if (!vendor) return <div>Access Denied</div>;

  return (
    <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 shadow rounded-lg">
        
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
                onChange={onImageUpload}
                disabled={uploading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              {uploading && <p className="text-xs text-indigo-600 mt-1">Uploading...</p>}
            </div>
          </div>
          <input type="hidden" {...register('imageUrl')} />
          {errors.imageUrl && <p className="text-red-500 text-sm mt-1">Image is required</p>}
        </div>

        {/* AI Generation */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={generateDescription}
            disabled={generating || !watch('imageUrl')}
            className="inline-flex items-center px-3 py-1.5 border border-indigo-600 text-xs font-medium rounded text-indigo-600 bg-white hover:bg-indigo-50 disabled:opacity-50"
          >
            {generating ? 'Generating...' : '✨ AI Generate Description'}
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
          <select
            {...register('category')}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          >
            <option value="">Select a category</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
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
