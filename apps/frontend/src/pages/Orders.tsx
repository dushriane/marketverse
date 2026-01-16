import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useOrderStore } from '../stores/orderStore';

export function Orders() {
  const vendor = useAuthStore(state => state.vendor);
  const { reservations, isLoading, fetchReservations, updateReservationStatus } = useOrderStore();

  useEffect(() => {
    if (vendor?.id) fetchReservations(vendor.id);
  }, [vendor, fetchReservations]);

  if (!vendor) return <div>Access Denied</div>;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'fulfilled': return <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">Fulfilled</span>;
      case 'cancelled': return <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-800">Cancelled</span>;
      default: return <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800">Pending</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-6">Reservations</h1>
      
      {isLoading ? (
        <div>Loading...</div>
      ) : reservations.length === 0 ? (
        <div className="bg-white rounded-lg p-6 shadow text-center text-gray-500">
          No reservations yet.
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {reservations.map((r) => (
              <li key={r.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-indigo-600 truncate">{r.customerName} ({r.customerPhone})</p>
                    <p className="text-sm text-gray-500">Reserved: {r.productName}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(r.createdAt || '').toLocaleString()}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    {getStatusBadge(r.status)}
                    {r.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => updateReservationStatus(r.id!, 'fulfilled')}
                          className="text-xs text-white bg-green-600 px-3 py-1 rounded hover:bg-green-700"
                        >
                          Fulfill
                        </button>
                        <button 
                          onClick={() => updateReservationStatus(r.id!, 'cancelled')}
                          className="text-xs text-white bg-red-600 px-3 py-1 rounded hover:bg-red-700"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
