import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../lib/api';
import { useAuthStore } from '../stores/authStore';

const VendorSchema = z.object({
  storeName: z.string().min(1, 'Store name is required'),
  description: z.string().optional(),
  marketLocation: z.string().optional(),
  profileImage: z.string().optional(),
  bannerImage: z.string().optional(),
});

type Vendor = z.infer<typeof VendorSchema>;

import { useAIStore } from '../stores/aiStore';
import { Link } from 'react-router-dom';
import { TopBuyersSidebar } from '../components/vendor/TopBuyersSidebar';

// Extended type for Stall form inputs since it's not strictly in VendorSchema
type StallSettings = {
    stallId?: string;
    stallNumber: string;
    floor: number;
    locationDescription: string;
}

export function Profile() {
  const { user, logout } = useAuthStore();
  const [vendorProfile, setVendorProfile] = useState<any>(null);
  const [stall, setStall] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'stall'>('profile');

  const { 
    isGenerating, generatedDescription, generateDescription, clearAIState
  } = useAIStore();
  
  const { register, handleSubmit, reset, setValue, watch } = useForm<Vendor>({
    resolver: zodResolver(VendorSchema),
  });

  const { register: registerStall, handleSubmit: handleSubmitStall, setValue: setValueStall } = useForm<StallSettings>();

  useEffect(() => {
    async function loadData() {
        if (!user) return;
        try {
            const res = await api.get('/vendor/profile');
            setVendorProfile(res.data);
            reset(res.data); 

            // Load Stalls
            const stallRes = await api.get('/vendor/stalls');
            if (stallRes.data && stallRes.data.length > 0) {
                const myStall = stallRes.data[0]; 
                setStall(myStall);
                setValueStall('stallNumber', myStall.stallNumber);
                setValueStall('floor', myStall.floor);
                setValueStall('locationDescription', myStall.locationDescription);
            }
        } catch (e) {
            console.error("Failed to load profile", e);
        } finally {
            setIsLoading(false);
        }
    }
    loadData();
  }, [user, reset, setValueStall]);

  useEffect(() => {
    if (generatedDescription) {
        setValue('description', generatedDescription, { shouldDirty: true });
    }
  }, [generatedDescription, setValue]);

  useEffect(() => {
    return () => clearAIState();
  }, [clearAIState]);

  const onProfileSubmit = async (data: any) => {
    try {
      const formData = new FormData();
      formData.append('storeName', data.storeName || '');
      formData.append('description', data.description || '');
      formData.append('phoneNumber', data.phoneNumber || '');
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput && fileInput.files && fileInput.files[0]) {
          formData.append('profileImage', fileInput.files[0]);
      }

      const res = await api.put('/vendor/profile', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
      });
      setVendorProfile(res.data);
      alert("Profile Updated!");
    } catch (err) {
      console.error(err);
      alert("Update Failed");
    }
  };

  const onStallSubmit = async (data: StallSettings) => {
      if (!stall) return;
      try {
          await api.put(`/vendor/stalls/${stall.id}`, data);
          alert('Stall details updated!');
      } catch (e) {
          console.error(e);
          alert('Failed to update stall');
      }
  }

  const handleGenerateDescription = () => {
    const name = watch('storeName');
    if (!name) return;
    generateDescription(name, "Quality, Trusted, Best Prices");
  };

  if (isLoading) return <div className="p-8 text-center">Loading Vendor Dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Vendor Dashboard
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 items-center gap-4">
            <Link to="/products" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                Manage Products
            </Link>
             <button onClick={() => logout()} className="text-red-600 text-sm font-medium hover:text-red-800">
                Logout
            </button>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`${activeTab === 'profile' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm`}
                >
                    Profile Settings
                </button>
                <button
                    onClick={() => setActiveTab('stall')}
                    className={`${activeTab === 'stall' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm`}
                >
                    Stall Location
                </button>
            </nav>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
            {/* Main Form Area */}
            <div className="md:col-span-2">
                {activeTab === 'profile' ? (
                    <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        
                        {/* Profile Image */}
                        <div className="sm:col-span-6">
                            <label className="block text-sm font-medium text-gray-700">Store Logo / Image</label>
                            <div className="mt-1 flex items-center">
                                <span className="inline-block h-12 w-12 rounded-full overflow-hidden bg-gray-100">
                                    {vendorProfile?.profileImage ? (
                                        <img src={`http://localhost:5000${vendorProfile.profileImage}`} alt="Profile" className="h-full w-full object-cover" />
                                    ) : (
                                        <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    )}
                                </span>
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    className="ml-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label className="block text-sm font-medium text-gray-700">Store Name</label>
                            <div className="mt-1">
                                <input {...register('storeName')} type="text" className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md" />
                            </div>
                        </div>

                        <div className="sm:col-span-6">
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <div className="mt-1 flex gap-2">
                                <textarea {...register('description')} rows={3} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md" />
                                <button type="button" onClick={handleGenerateDescription} disabled={isGenerating} className="inline-flex items-center px-3 py-2 border border-blue-300 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                    <svg className={`-ml-0.5 mr-2 h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    {isGenerating ? 'Gemini Thinking...' : 'Summarize Shop Identity'}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none">
                            Save Profile
                        </button>
                    </div>
                </form>
            ) : (
                <form onSubmit={handleSubmitStall(onStallSubmit)} className="space-y-6">
                    {!stall ? (
                        <div className="text-gray-500">No stall assigned yet. Please contact Admin.</div>
                    ) : (
                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                            <div className="sm:col-span-3">
                                <label className="block text-sm font-medium text-gray-700">Stall Number / Identifier</label>
                                <input {...registerStall('stallNumber')} type="text" className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md" />
                            </div>

                            <div className="sm:col-span-3">
                                <label className="block text-sm font-medium text-gray-700">Floor</label>
                                <input {...registerStall('floor')} type="number" className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md" />
                            </div>

                            <div className="sm:col-span-6">
                                <label className="block text-sm font-medium text-gray-700">Location Description</label>
                                <input {...registerStall('locationDescription')} type="text" placeholder="e.g. Near North Entrance, Block A" className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md" />
                            </div>
                        </div>
                    )}
                    {stall && (
                        <div className="flex justify-end">
                            <button type="submit" className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none">
                                Update Location
                            </button>
                        </div>
                    )}
                </form>
            )}
            </div>

            {/* Sidebar */}
            <div className="md:col-span-1">
                <TopBuyersSidebar />
            </div>
        </div>
      </div>
    </div>
  );
}
