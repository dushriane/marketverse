import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema, LoginRequest } from '@marketverse/types';
import { api } from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';

export function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginRequest>({
    resolver: zodResolver(LoginSchema)
  });
  const [error, setError] = useState('');
  const setVendor = useAuthStore(state => state.setVendor);
  const navigate = useNavigate();

  const onSubmit = async (data: LoginRequest) => {
    try {
      const res = await api.post('/auth/login', data);
      if (res.data.exists) {
        setVendor(res.data.vendor);
        navigate('/profile');
      } else {
        // Redirect to onboarding with phone number pre-filled state
        navigate('/onboarding', { state: { phoneNumber: data.phoneNumber } });
      }
    } catch (err) {
      setError('Login failed. Ensure backend is running.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-8 bg-white shadow-lg rounded-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">MarketVerse Login</h1>
        <p className="mb-4 text-gray-600">Enter your phone number to access your stall.</p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Phone Number</label>
            <input
              {...register('phoneNumber')}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border"
              placeholder="1234567890"
            />
            {errors.phoneNumber && <p className="text-red-500 text-sm">{errors.phoneNumber.message}</p>}
          </div>
          
          {error && <p className="text-red-500">{error}</p>}
          
          <div className="space-y-3">
             <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-medium">
                Vendor Login / Register
             </button>
             
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or</span>
                </div>
            </div>

             <a href="/explore" className="w-full block text-center border border-gray-300 bg-white text-gray-700 py-2 rounded hover:bg-gray-50 font-medium">
                Start Exploring Market 🛍️
             </a>
          </div>
        </form>
      </div>
    </div>
  );
}
