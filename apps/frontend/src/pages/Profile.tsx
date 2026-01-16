import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { VendorSchema, Vendor } from '@marketverse/types';
import { api } from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { useAIStore } from '../stores/aiStore';

export function Profile() {
  const { vendor, setVendor, logout } = useAuthStore();
  const { 
    isGenerating, generatedDescription, generatedSummary, 
    generateDescription, generateSummary, clearAIState 
  } = useAIStore();
  
  const { register, handleSubmit, reset, setValue, watch, formState: { isDirty, errors } } = useForm<Vendor>({
    resolver: zodResolver(VendorSchema),
    defaultValues: vendor || {}
  });

  useEffect(() => {
    if (vendor) reset(vendor);
  }, [vendor, reset]);

  useEffect(() => {
    if (generatedDescription) {
        setValue('description', generatedDescription, { shouldDirty: true });
    }
  }, [generatedDescription, setValue]);

  // Clean up on unmount
  useEffect(() => {
    return () => clearAIState();
  }, [clearAIState]);

  const onSubmit = async (data: Vendor) => {
    if (!vendor?.id) return;
    try {
      const res = await api.put(`/vendors/${vendor.id}`, data);
      setVendor(res.data);
      alert('Profile updated!');
    } catch (err) {
      alert('Failed to update profile');
    }
  };

  if (!vendor) return <div>Please login first.</div>;

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <div className="px-4 sm:px-0">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Store Profile</h3>
            <p className="mt-1 text-sm text-gray-600">
              Customize how your stall looks to customers.
              <br/>
              <button 
                onClick={logout}
                className="mt-4 text-red-600 underline"
              >
                Logout
              </button>
            </p>
          </div>
        </div>
        
        <div className="mt-5 md:mt-0 md:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="shadow sm:rounded-md sm:overflow-hidden">
              <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                
                {/* Stall Name */}
                <div className="col-span-6 sm:col-span-3">
                  <label className="block text-sm font-medium text-gray-700">Stall Name</label>
                  <input
                    {...register('storeName')}
                    type="text"
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                  />
                </div>

              {/* Description with AI Assistant */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <button
                        type="button" 
                        onClick={() => generateDescription(watch('storeName') || '', 'fresh, local, quality')}
                        disabled={isGenerating}
                        className="text-xs text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
                    >
                        ✨ {isGenerating ? 'Writer thinking...' : 'AI: Write Description'}
                    </button>
                  </div>
                  <div className="mt-1">
                    <textarea
                      {...register('description')}
                      rows={3}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                      placeholder="Fresh fruits and vegetables directly from the farm..."
                    />
                  </div>
                </div>

                 {/* Daily Summary Generator */}
                 <div className="bg-indigo-50 p-4 rounded-md border border-indigo-100">
                    <h4 className="text-sm font-medium text-indigo-900 mb-2">📢 AI Daily Update Generator</h4>
                    <p className="text-xs text-indigo-700 mb-3">
                        Create a quick summary of your new arrivals for customers.
                    </p>
                    {generatedSummary ? (
                        <div className="bg-white p-3 rounded border border-indigo-200 mb-3">
                            <p className="text-sm text-gray-800 whitespace-pre-wrap">{generatedSummary}</p>
                            <div className="mt-2 flex space-x-2">
                                <button
                                    type="button"
                                    onClick={() => {navigator.clipboard.writeText(generatedSummary); alert('Copied!')}}
                                    className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
                                >
                                    Copy to Clipboard
                                </button>
                                <button
                                    type="button"
                                    onClick={() => clearAIState()}
                                    className="text-xs text-gray-500 px-2 py-1 rounded hover:bg-gray-100"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => vendor?.id && generateSummary(vendor.id)}
                            disabled={isGenerating}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            {isGenerating ? 'Creating Summary...' : 'Generate "What\'s New" Post'}
                        </button>
                    )}
                 </div>

                {/* Profile Image URL (simplified) */}
                <div className="col-span-6 sm:col-span-3">
                  <label className="block text-sm font-medium text-gray-700">Profile Image URL</label>
                  <input
                    {...register('profileImage')}
                    type="text"
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                    placeholder="https://example.com/my-shop.jpg"
                  />
                  {errors.profileImage && <p className="text-red-500 text-sm">Invalid URL</p>}
                </div>

                {/* Operating Hours */}
                <div className="col-span-6 sm:col-span-3">
                  <label className="block text-sm font-medium text-gray-700">Operating Hours</label>
                  <input
                    {...register('operatingHours')}
                    type="text"
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                    placeholder="Mon-Fri: 09:00 - 18:00"
                  />
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
                    <input
                      {...register('contactPhone')}
                      type="text"
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700">WhatsApp</label>
                    <input
                      {...register('contactWhatsapp')}
                      type="text"
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                    />
                  </div>
                </div>

              </div>
              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                <button
                  type="submit"
                  disabled={!isDirty}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
