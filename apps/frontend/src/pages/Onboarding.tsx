import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { VendorSchema, Vendor } from '@marketverse/types';
import { api } from '../lib/api';
import { useAuthStore } from '../stores/authStore';

export function Onboarding() {
  const location = useLocation();
  const navigate = useNavigate();
  const setVendor = useAuthStore(state => state.setVendor);
  const defaultPhone = location.state?.phoneNumber || '';

  const { register, handleSubmit, formState: { errors,  }, setError } = useForm<Vendor>({
    resolver: zodResolver(VendorSchema),
    defaultValues: {
      phoneNumber: defaultPhone
    }
  });

  const onSubmit = async (data: Vendor) => {
    try {
      const res = await api.post('/vendors', data);
      setVendor(res.data);
      navigate('/profile');
    } catch (err: any) {
      if (err.response?.data?.error) {
        setError('root', { message: err.response.data.error });
      } else {
        setError('root', { message: 'Registration failed' });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 shadow rounded">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Join MarketVerse
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Set up your vendor profile
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                {...register('phoneNumber')}
                readOnly
                className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded p-2"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Market Location</label>
              <select {...register('marketLocation')} className="mt-1 block w-full border border-gray-300 rounded p-2">
                <option value="">Select a market...</option>
                <option value="Central Market">Central Market</option>
                <option value="Downtown Plaza">Downtown Plaza</option>
                <option value="Night Bazaar">Night Bazaar</option>
              </select>
              {errors.marketLocation && <p className="text-red-500 text-sm">{errors.marketLocation.message}</p>}
            </div>
          </div>
          
          <button
            type="submit"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create Profile
          </button>
        </form>
      </div>
    </div>
  );
}
