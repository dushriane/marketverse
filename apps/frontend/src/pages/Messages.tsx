import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useOrderStore } from '../stores/orderStore';

export function Messages() {
  const vendor = useAuthStore(state => state.vendor);
  const { messages, isLoading, fetchMessages } = useOrderStore();

  useEffect(() => {
    if (vendor?.id) fetchMessages(vendor.id);
  }, [vendor, fetchMessages]);

  if (!vendor) return <div>Access Denied</div>;

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-6">Customer Inquiries</h1>

      {isLoading ? (
        <div>Loading...</div>
      ) : messages.length === 0 ? (
        <div className="bg-white rounded-lg p-6 shadow text-center text-gray-500">
          No new messages.
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((m) => (
            <div key={m.id} className="bg-white shadow rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-medium">{m.customerName}</h3>
                  <p className="text-xs text-gray-500">{new Date(m.createdAt || '').toLocaleString()}</p>
                </div>
                {matchesMedia(m.isRead) ? null : <span className="h-2 w-2 bg-blue-500 rounded-full"></span>}
              </div>
              <p className="text-gray-700">{m.content}</p>
              {m.customerPhone && (
                <div className="mt-3">
                   <a 
                    href={`tel:${m.customerPhone}`}
                    className="text-sm text-indigo-600 hover:underline"
                   >
                     Reply to {m.customerPhone}
                   </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function matchesMedia(isRead: boolean): boolean {
    return isRead
}
