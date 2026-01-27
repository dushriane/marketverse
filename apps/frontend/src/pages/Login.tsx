import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema, LoginRequest } from '@marketverse/types';
import { api } from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { useNavigate, Link } from 'react-router-dom';

export function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginRequest>({
    resolver: zodResolver(LoginSchema)
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();

  const onSubmit = async (data: LoginRequest) => {
    setIsLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', data);
      
      // Update global auth store
      // Response expects: { token, user: { userId, email, role, fullName } }
      const { token, user } = res.data;
      
      login({
          ...user,
          token
      });

      // Redirect based on role
      if (user.role === 'VENDOR') {
        navigate('/profile'); // Vendor Dashboard
      } else if (user.role === 'ADMIN') {
        navigate('/admin'); // Admin Dashboard (Needs implementation)
      } else {
        navigate('/explore'); // Buyer goes to market
      }

    } catch (err: any) {
        console.error("Login failed", err);
        setError(err.response?.data?.error || 'Invalid credentials');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 shadow rounded-xl">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm -space-y-px">
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email or Phone</label>
              <input
                {...register('identifier')}
                type="text"
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Name or Email"
              />
              {errors.identifier && <p className="text-red-500 text-xs mt-1">{errors.identifier.message}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                {...register('password')}
                type="password"
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center mt-4">
             <Link to="/register" className="text-indigo-600 hover:text-indigo-500 text-sm">Create an account</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
  //       setVendor(res.data.vendor);
  //       navigate('/profile');
  //     } else {
  //       // Redirect to onboarding with phone number pre-filled state
  //       navigate('/onboarding', { state: { phoneNumber: data.phoneNumber } });
  //     }
  //     */
  //   } catch (err) {
  //     console.error(err);
  //     setError('Login failed. Ensure backend is running.');
  //   }
  // };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">
//       <div className="p-8 bg-white shadow-lg rounded-lg max-w-md w-full">
//         <h1 className="text-2xl font-bold mb-4">MarketVerse Login</h1>
//         <p className="mb-4 text-gray-600">Enter your phone number to access your stall.</p>
        
//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium">Phone Number</label>
//             <input
//               {...register('phoneNumber')}
//               className="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border"
//               placeholder="1234567890"
//             />
//             {errors.phoneNumber && <p className="text-red-500 text-sm">{errors.phoneNumber.message}</p>}
//           </div>
          
//           {error && <p className="text-red-500">{error}</p>}
          
//           <div className="space-y-3">
//              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-medium">
//                 Vendor Login / Register
//              </button>
             
//             <div className="relative">
//                 <div className="absolute inset-0 flex items-center">
//                     <div className="w-full border-t border-gray-300"></div>
//                 </div>
//                 <div className="relative flex justify-center text-sm">
//                     <span className="px-2 bg-white text-gray-500">Or</span>
//                 </div>
//             </div>

//              <a href="/explore" className="w-full block text-center border border-gray-300 bg-white text-gray-700 py-2 rounded hover:bg-gray-50 font-medium">
//                 Start Exploring Market 🛍️
//              </a>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }
