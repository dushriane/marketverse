import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useOrderStore } from '../stores/orderStore';
import { useCartStore } from '../stores/cartStore';
import { api } from '../lib/api';

export function Orders() {
  const { user } = useAuthStore();

  if (!user) {
      return <div className="p-8">Please log in to view orders.</div>;
  }

  // Determine view based on role
  // If user has a vendor profile, show Vendor Dashboard by default? 
  // Or handle dual roles? For simplicity, if role is VENDOR, show Vendor View, else Buyer View.
  // Actually, current auth store has a 'role' string.
  
  return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {user.role === 'VENDOR' ? <VendorOrders /> : <BuyerOrders />}
      </div>
  );
}

function VendorOrders() {
    const { reservations, isLoading, fetchReservations, updateReservationStatus } = useOrderStore();
    const [vendorId, setVendorId] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch my profile to get ID
        const fetchProfile = async () => {
             try {
                 const res = await api.get('/vendor/profile');
                 setVendorId(res.data.id);
             } catch(e) { console.error(e); }
        };
        fetchProfile();
    }, []);

    useEffect(() => {
        if (vendorId) fetchReservations(vendorId);
    }, [vendorId, fetchReservations]);

    const getStatusBadge = (status: string) => {
        switch (status) {
          case 'fulfilled': return <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">Fulfilled</span>;
          case 'cancelled': return <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-800">Cancelled</span>;
          default: return <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800">Pending</span>;
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Customer Reservations</h1>
            {isLoading ? (
                <div>Loading...</div>
            ) : reservations.length === 0 ? (
                <div className="bg-white rounded p-6 shadow text-center text-gray-500">No active reservations.</div>
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                        {reservations.map(r => (
                            <li key={r.id} className="px-4 py-4 sm:px-6 flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-medium text-indigo-600">{r.customerName}</p>
                                    <p className="text-sm text-gray-500">{r.productName}</p>
                                    {r.total && <p className="text-xs text-purple-600 mt-1">Total: RWF {r.total.toLocaleString()}</p>}
                                </div>
                                <div className="flex items-center space-x-2">
                                    {r.userId && (
                                        <button 
                                            onClick={() => navigate(`/messages?partner=${r.userId}`)}
                                            className="text-xs border border-indigo-500 text-indigo-500 px-2 py-1 rounded hover:bg-indigo-50 mr-2"
                                        >
                                            Message
                                        </button>
                                    )}
                                    {getStatusBadge(r.status)}
                                    {r.status === 'pending' && (
                                        <button 
                                            onClick={() => updateReservationStatus(r.id!, 'fulfilled')}
                                            className="text-xs bg-green-600 text-white px-2 py-1 rounded"
                                        >
                                            Complete
                                        </button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

function BuyerOrders() {
    const { items, orderHistory, fetchOrderHistory, checkout, removeFromCart, clearCart, isLoading } = useCartStore();
    const [checkingOut, setCheckingOut] = useState(false);

    useEffect(() => {
        fetchOrderHistory();
    }, [fetchOrderHistory]);

    const handleCheckout = async () => {
        setCheckingOut(true);
        try {
            await checkout();
            alert('Order placed successfully!');
        } catch (e) {
            alert('Checkout failed.');
        } finally {
            setCheckingOut(false);
        }
    };

    const cartTotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    return (
        <div className="space-y-12">
            
            {/* Shopping Cart Section */}
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">🛒 Shopping Cart</h2>
                    {items.length > 0 && (
                         <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700">Clear Cart</button>
                    )}
                </div>

                {items.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                        Your cart is empty. Go explore the market!
                    </div>
                ) : (
                    <div className="space-y-4">
                        {items.map(item => (
                            <div key={item.productId} className="flex items-center justify-between border-b pb-4">
                                <div className="flex items-center space-x-4">
                                    {item.image && <img src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover" />}
                                    <div>
                                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                                        <p className="text-sm text-gray-500">RWF {item.price.toLocaleString()} x {item.quantity}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <span className="font-semibold">RWF {(item.price * item.quantity).toLocaleString()}</span>
                                    <button 
                                        onClick={() => removeFromCart(item.productId)}
                                        className="text-red-500 hover:text-red-700 font-bold"
                                    >
                                        &times;
                                    </button>
                                </div>
                            </div>
                        ))}
                        
                        <div className="pt-4 flex justify-between items-center">
                            <div className="text-lg font-bold text-gray-900">Total: RWF {cartTotal.toLocaleString()}</div>
                            <button
                                onClick={handleCheckout}
                                disabled={checkingOut || isLoading}
                                className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 disabled:bg-gray-400"
                            >
                                {checkingOut ? 'Processing...' : 'Pay Now'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Order History Section */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order History</h2>
                {isLoading && orderHistory.length === 0 ? (
                    <div>Loading history...</div>
                ) : orderHistory.length === 0 ? (
                    <p className="text-gray-500">No past orders.</p>
                ) : (
                    <div className="space-y-6">
                        {orderHistory.map(order => (
                            <div key={order.id} className="bg-white shadow rounded-lg overflow-hidden border border-gray-100">
                                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                    <div>
                                        <span className="text-sm text-gray-500">Order placed</span>
                                        <div className="text-sm font-medium text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500">Total</span>
                                        <div className="text-sm font-medium text-gray-900">RWF {order.totalAmount.toLocaleString()}</div>
                                    </div>
                                    <div>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                                <ul className="divide-y divide-gray-200">
                                    {order.items.map(item => (
                                        <li key={item.id} className="p-4 flex justify-between items-center">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-bold text-gray-900">{item.product.name}</h4>
                                                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                                </div>
                                            </div>
                                            <div className="text-sm font-medium text-gray-900">
                                                RWF {item.priceAtTime.toLocaleString()}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
