import { useState } from 'react';
import { api } from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';

export function Login() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();

  const handleMockLogin = async (role: 'CUSTOMER' | 'VENDOR') => {
    setIsLoading(true);
    setError('');
    try {
      // Calling the modified backend login which now accepts a role for mock login
      const res = await api.post('/auth/login', { role });
      
      const { token, user } = res.data;
      
      login({
          ...user,
          token
      });

      if (user.role === 'VENDOR') {
        navigate('/profile'); 
      } else {
        navigate('/explore');
      }

    } catch (err: any) {
        console.error("Login failed", err);
        setError(err.response?.data?.error || 'Login failed');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 shadow rounded-xl">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            MarketVerse
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Choose your role to enter the demo
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="mt-8 space-y-4">
            <button
              onClick={() => handleMockLogin('CUSTOMER')}
              disabled={isLoading}
              className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-lg font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
              Enter as Customer
            </button>

            <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400">or</span>
                <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <button
              onClick={() => handleMockLogin('VENDOR')}
              disabled={isLoading}
              className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-lg font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
            >
              Enter as Vendor
            </button>
        </div>
        
        <div className="mt-6 text-center text-xs text-gray-500">
            <p>Authentication is disabled for this demo.</p>
        </div>
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
