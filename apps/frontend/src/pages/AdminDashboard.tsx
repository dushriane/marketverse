import { useEffect, useState } from 'react';
import { useAdminStore } from '../stores/adminStore';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';

export function AdminDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { users, isLoading, fetchUsers, createMarket } = useAdminStore();
  
  const [activeTab, setActiveTab] = useState<'users' | 'market'>('users');
  
  // Market Form State
  const [marketName, setMarketName] = useState('');
  const [location, setLocation] = useState('');
  const [envId, setEnvId] = useState('city-center');

  useEffect(() => {
    // Basic role protection
    if (user && user.role !== 'ADMIN') {
        navigate('/profile');
    }
    if (user?.role === 'ADMIN') {
        fetchUsers();
    }
  }, [user, navigate, fetchUsers]);

  const handleCreateMarket = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          await createMarket({ name: marketName, location, environmentId: envId });
          alert('Market created successfully');
          setMarketName('');
          setLocation('');
      } catch (e) {
          alert('Failed to create market');
      }
  };

  if (!user || user.role !== 'ADMIN') return null;

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Portal</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('users')}
              className={`${
                activeTab === 'users'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm`}
            >
              User Management
            </button>
            <button
              onClick={() => setActiveTab('market')}
              className={`${
                activeTab === 'market'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm`}
            >
              Market Configuration
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'users' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">System Users</h2>
                  <button onClick={() => fetchUsers()} className="text-sm text-indigo-600 hover:text-indigo-900">Refresh</button>
              </div>
              
              {isLoading ? (
                  <div className="text-center py-4">Loading users...</div>
              ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((u) => (
                        <tr key={u.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.fullName || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    u.role === 'ADMIN' ? 'bg-red-100 text-red-800' : 
                                    u.role === 'VENDOR' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                                }`}>
                                    {u.role}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button className="text-indigo-600 hover:text-indigo-900">View</button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'market' && (
            <div className="max-w-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Create New Market</h2>
                <form onSubmit={handleCreateMarket} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Market Name</label>
                        <input
                            type="text"
                            required
                            value={marketName}
                            onChange={(e) => setMarketName(e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
                            placeholder="e.g. Downtown Farmers Market"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Physical Location</label>
                        <input
                            type="text"
                            required
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
                            placeholder="e.g. 123 Main St, New York"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Environment ID</label>
                        <select
                            value={envId}
                            onChange={(e) => setEnvId(e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
                        >
                            <option value="city-center">City Center</option>
                            <option value="suburban-mall">Suburban Mall</option>
                            <option value="rural-fair">Rural Fairground</option>
                        </select>
                        <p className="mt-1 text-sm text-gray-500">Defines the 3D environment template.</p>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
                    >
                        {isLoading ? 'Creating...' : 'Create Market'}
                    </button>
                </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
